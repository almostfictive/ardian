import AppKit
import ExpoModulesCore

final class ScreenshotCanvas: ExpoView {
  let onStroke = EventDispatcher()
  var encoded = "" { didSet { if encoded != oldValue { picture = (try? ScreenshotImage.decode(encoded)).map { NSImage(cgImage: $0, size: NSSize(width: $0.width, height: $0.height)) }; needsDisplay = true } } }
  var strokes: [[String: Any]] = [] { didSet { needsDisplay = true } }
  var brushColor = "#FF3B30"
  var highlighter = false
  private var picture: NSImage?
  private var points: [[Double]] = []
  override var isFlipped: Bool { true }
  override var acceptsFirstResponder: Bool { false }

  private func point(_ event: NSEvent) -> [Double] {
    let at = convert(event.locationInWindow, from: nil)
    return [min(1, max(0, at.x / max(1, bounds.width))), min(1, max(0, at.y / max(1, bounds.height)))]
  }
  override func mouseDown(with event: NSEvent) {
    points = [point(event)]
    needsDisplay = true
  }
  override func mouseDragged(with event: NSEvent) {
    if points.count < 10000 { points.append(point(event)); needsDisplay = true }
  }
  override func mouseUp(with event: NSEvent) {
    guard !points.isEmpty else { return }
    points.append(point(event))
    let stroke: [String: Any] = ["points": points, "color": brushColor, "highlighter": highlighter]
    strokes.append(stroke)
    points = []
    onStroke(stroke)
    needsDisplay = true
  }
  override func draw(_ dirtyRect: NSRect) {
    super.draw(dirtyRect)
    picture?.draw(in: bounds, from: .zero, operation: .copy, fraction: 1, respectFlipped: true, hints: nil)
    for stroke in strokes { drawStroke(stroke) }
    if !points.isEmpty { drawStroke(["points": points, "color": brushColor, "highlighter": highlighter]) }
  }
  private func drawStroke(_ stroke: [String: Any]) {
    guard let points = stroke["points"] as? [[Double]], let first = points.first, first.count == 2,
          let color = stroke["color"] as? String, let hex = UInt32(color.dropFirst(), radix: 16) else { return }
    let highlight = stroke["highlighter"] as? Bool ?? false
    NSColor(srgbRed: CGFloat((hex >> 16) & 255) / 255, green: CGFloat((hex >> 8) & 255) / 255, blue: CGFloat(hex & 255) / 255, alpha: highlight ? 0.28 : 1).setStroke()
    let path = NSBezierPath()
    path.move(to: NSPoint(x: first[0] * bounds.width, y: first[1] * bounds.height))
    for point in points.dropFirst() where point.count == 2 { path.line(to: NSPoint(x: point[0] * bounds.width, y: point[1] * bounds.height)) }
    if points.count == 1 { path.line(to: NSPoint(x: first[0] * bounds.width + 0.1, y: first[1] * bounds.height)) }
    path.lineWidth = (highlight ? 18 : 3) * bounds.width / max(1, picture?.size.width ?? bounds.width)
    path.lineCapStyle = .round
    path.lineJoinStyle = .round
    path.stroke()
  }
}
