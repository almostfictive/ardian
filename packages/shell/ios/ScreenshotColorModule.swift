import ExpoModulesCore

public class ScreenshotColorModule: Module {
  public func definition() -> ModuleDefinition {
    Name("ArdiaScreenshotColor")
    View(ScreenshotColorWell.self) {
      Events("onColor")
      Prop("color") { (view: ScreenshotColorWell, color: String) in view.setColor(color) }
    }
  }
}
