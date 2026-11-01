import AppKit
import ArdiaCore
import ExpoModulesCore

final class ScreenshotColorWell: ExpoView {
  let onColor = EventDispatcher()
  private let well = NSColorWell(frame: .zero)
  required init(appContext: AppContext? = nil) {
    super.init(appContext: appContext)
    well.target = self
    well.action = #selector(changed)
    well.colorWellStyle = .minimal
    well.isEnabled = !LaunchConfig.shared.background
    addSubview(well)
  }
  override func layout() { super.layout(); well.frame = bounds }
  override func viewDidMoveToWindow() {
    super.viewDidMoveToWindow()
    if window == nil && well.isActive { well.deactivate(); NSColorPanel.shared.close() }
  }
  func setColor(_ text: String) {
    guard let hex = UInt32(text.dropFirst(), radix: 16) else { return }
    well.color = NSColor(srgbRed: CGFloat((hex >> 16) & 255) / 255, green: CGFloat((hex >> 8) & 255) / 255, blue: CGFloat(hex & 255) / 255, alpha: 1)
  }
  @objc private func changed() {
    guard let color = well.color.usingColorSpace(.sRGB) else { return }
    onColor(["color": String(format: "#%02X%02X%02X", Int((color.redComponent * 255).rounded()), Int((color.greenComponent * 255).rounded()), Int((color.blueComponent * 255).rounded()))])
  }
}
