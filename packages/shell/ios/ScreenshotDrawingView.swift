import AppKit

final class ScreenshotDrawingView: NSView {
  var onUndo: (() -> Void)?
  var onStroke: (([String: Any]) -> Void)?
  var encoded = "" { didSet { if encoded != oldValue { picture = (try? ScreenshotImage.decode(encoded)).map { NSImage(cgImage: $0, size: NSSize(width: $0.width, height: $0.height)) }; needsDisplay = true } } }
  var strokes: [[String: Any]] = [] { didSet { needsDisplay = true } }
  var brushColor = "#FF3B30"
  var highlighter = false
  private var picture: NSImage?
  private var points: [[Double]] = []
  private var pointer: [Double]?
  private var keyMonitor: Any?
  override var isFlipped: Bool { true }
  override var acceptsFirstResponder: Bool { false }
  override var mouseDownCanMoveWindow: Bool { false }
  override func acceptsFirstMouse(for event: NSEvent?) -> Bool { true }

  override func viewDidMoveToWindow() {
    super.viewDidMoveToWindow()
    if let keyMonitor { NSEvent.removeMonitor(keyMonitor); self.keyMonitor = nil }
    guard window != nil else { return }
    keyMonitor = NSEvent.addLocalMonitorForEvents(matching: .keyDown) { [weak self] event in
      guard let self, event.window === self.window,
            event.modifierFlags.intersection([.command, .shift, .option, .control]) == .command,
            event.charactersIgnoringModifiers?.lowercased() == "z" else { return event }
      self.points = []
      self.pointer = nil
      self.onUndo?()
      self.needsDisplay = true
      return nil
    }
  }

  deinit {
    if let keyMonitor { NSEvent.removeMonitor(keyMonitor) }
  }

  private func point(_ event: NSEvent) -> [Double] {
    let at = convert(event.locationInWindow, from: nil)
    return [min(1, max(0, at.x / max(1, bounds.width))), min(1, max(0, at.y / max(1, bounds.height)))]
  }
  override func mouseDown(with event: NSEvent) {
    pointer = point(event)
    points = [point(event)]
    needsDisplay = true
  }
  override func mouseDragged(with event: NSEvent) {
    updatePoint(event)
  }
  override func mouseUp(with event: NSEvent) {
    guard !points.isEmpty else { return }
    updatePoint(event)
    let stroke: [String: Any] = ["points": points, "color": brushColor, "highlighter": highlighter]
    strokes.append(stroke)
    points = []
    pointer = nil
    onStroke?(stroke)
    needsDisplay = true
  }
  override func draw(_ dirtyRect: NSRect) {
    super.draw(dirtyRect)
    picture?.draw(in: bounds, from: .zero, operation: .copy, fraction: 1, respectFlipped: true, hints: nil)
    guard let context = NSGraphicsContext.current?.cgContext else { return }
    context.saveGState()
    let size = picture?.size ?? bounds.size
    context.scaleBy(x: bounds.width / max(1, size.width), y: bounds.height / max(1, size.height))
    let live: [[String: Any]] = points.isEmpty ? [] : [["points": points, "color": brushColor, "highlighter": highlighter]]
    ScreenshotImage.drawStrokes(strokes + live, in: context, size: size)
    context.restoreGState()
  }

  override func flagsChanged(with event: NSEvent) {
    if !points.isEmpty, let pointer { updatePoint(event, at: pointer) }
    super.flagsChanged(with: event)
  }

  private func updatePoint(_ event: NSEvent, at supplied: [Double]? = nil) {
    guard let first = points.first else { return }
    let at = supplied ?? point(event)
    pointer = at
    if event.modifierFlags.contains(.shift) {
      let dx = (at[0] - first[0]) * bounds.width
      let dy = (at[1] - first[1]) * bounds.height
      let angle = (atan2(dy, dx) / (.pi / 4)).rounded() * (.pi / 4)
      let ux = cos(angle) / max(1, bounds.width)
      let uy = sin(angle) / max(1, bounds.height)
      var distance = max(0, dx * cos(angle) + dy * sin(angle))
      for (origin, direction) in [(first[0], ux), (first[1], uy)] where abs(direction) > 0.000001 {
        distance = min(distance, (direction > 0 ? 1 - origin : -origin) / direction)
      }
      points = [first, [min(1, max(0, first[0] + distance * ux)), min(1, max(0, first[1] + distance * uy))]]
    } else if points.count < 10000 {
      let last = points.last!
      if hypot((at[0] - last[0]) * bounds.width, (at[1] - last[1]) * bounds.height) >= 0.5 || event.type == .leftMouseUp {
        points.append(at)
      }
    }
    needsDisplay = true
  }
}
