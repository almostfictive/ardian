import AppKit
import ExpoModulesCore

final class ScreenshotCanvas: ExpoView {
  let onStroke = EventDispatcher()
  private let canvas = ScreenshotDrawingView(frame: .zero)
  var encoded = "" { didSet { canvas.encoded = encoded } }
  var strokes: [[String: Any]] = [] { didSet { canvas.strokes = strokes } }
  var brushColor = "#FF3B30" { didSet { canvas.brushColor = brushColor } }
  var highlighter = false { didSet { canvas.highlighter = highlighter } }

  required init(appContext: AppContext? = nil) {
    super.init(appContext: appContext)
    canvas.onStroke = { [weak self] stroke in self?.onStroke(stroke) }
    addSubview(canvas)
  }

  override var mouseDownCanMoveWindow: Bool {
    get { false }
    set {}
  }

  override func layout() {
    super.layout()
    canvas.frame = bounds
  }

  override func setFrameSize(_ newSize: NSSize) {
    super.setFrameSize(newSize)
    canvas.frame = bounds
  }
}
