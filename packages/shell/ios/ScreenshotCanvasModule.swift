import ExpoModulesCore

public class ScreenshotCanvasModule: Module {
  public func definition() -> ModuleDefinition {
    Name("ArdiaScreenshotCanvas")
    View(ScreenshotCanvas.self) {
      Events("onStroke")
      Prop("image") { (view: ScreenshotCanvas, data: String) in view.encoded = data }
      Prop("strokes") { (view: ScreenshotCanvas, strokes: [[String: Any]]) in view.strokes = strokes }
      Prop("color") { (view: ScreenshotCanvas, color: String) in view.brushColor = color }
      Prop("highlighter") { (view: ScreenshotCanvas, highlighter: Bool) in view.highlighter = highlighter }
    }
  }
}
