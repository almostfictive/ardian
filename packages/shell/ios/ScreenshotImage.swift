import AppKit
import ArdiaCore
import ImageIO
import CoreGraphics
import ExpoModulesCore
import UniformTypeIdentifiers

enum ScreenshotImage {
  static func error(_ message: String) -> NSError {
    NSError(domain: "ArdiaScreenshot", code: 1, userInfo: [NSLocalizedDescriptionKey: message])
  }

  static func decode(_ data: String) throws -> CGImage {
    let encoded = data.contains(",") ? String(data.split(separator: ",", maxSplits: 1).last ?? "") : data
    guard encoded.count < 100_000_000, let bytes = Data(base64Encoded: encoded), let source = CGImageSourceCreateWithData(bytes as CFData, nil),
          let properties = CGImageSourceCopyPropertiesAtIndex(source, 0, nil) as? [CFString: Any],
          let width = properties[kCGImagePropertyPixelWidth] as? Int, let height = properties[kCGImagePropertyPixelHeight] as? Int,
          width > 0, height > 0, width <= 20000, height <= 20000, width * height <= 50_000_000,
          let image = CGImageSourceCreateImageAtIndex(source, 0, nil) else { throw error("The screenshot is invalid or exceeds the 50 megapixel limit.") }
    return image
  }

  static func bitmap(_ width: Int, _ height: Int) throws -> CGContext {
    guard width > 0, height > 0, width <= 20000, height <= 20000, width * height <= 50_000_000,
          let context = CGContext(data: nil, width: width, height: height, bitsPerComponent: 8, bytesPerRow: width * 4, space: CGColorSpaceCreateDeviceRGB(), bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue) else { throw error("The screenshot is too large. Capture a selected area instead.") }
    return context
  }

  static func png(_ image: CGImage) throws -> Data {
    let data = NSMutableData()
    guard let destination = CGImageDestinationCreateWithData(data, UTType.png.identifier as CFString, 1, nil) else { throw error("Couldn't create the image.") }
    CGImageDestinationAddImage(destination, image, nil)
    guard CGImageDestinationFinalize(destination) else { throw error("Couldn't encode the image.") }
    return data as Data
  }

  static func reply(_ image: CGImage) throws -> [String: Any] {
    ["data": try png(image).base64EncodedString(), "width": image.width, "height": image.height]
  }

  static func render(_ encoded: String, crop: [Double]?, strokes: [[String: Any]]) throws -> CGImage {
    var image = try decode(encoded)
    if let crop {
      guard crop.count == 4, crop.allSatisfy({ $0.isFinite && $0 >= 0 && $0 <= 1 }), crop[2] > 0, crop[3] > 0, crop[0] + crop[2] <= 1.000001, crop[1] + crop[3] <= 1.000001 else { throw error("The selected area is invalid.") }
      let rect = CGRect(x: crop[0] * Double(image.width), y: crop[1] * Double(image.height), width: crop[2] * Double(image.width), height: crop[3] * Double(image.height)).integral
      guard let cropped = image.cropping(to: rect) else { throw error("Couldn't crop the screenshot.") }
      image = cropped
    }
    let context = try bitmap(image.width, image.height)
    context.draw(image, in: CGRect(x: 0, y: 0, width: image.width, height: image.height))
    context.translateBy(x: 0, y: CGFloat(image.height))
    context.scaleBy(x: 1, y: -1)
    guard strokes.count <= 1000 else { throw error("The screenshot has too many annotations.") }
    var pointCount = 0
    for stroke in strokes {
      guard let points = stroke["points"] as? [[Double]], let color = stroke["color"] as? String, stroke["highlighter"] is Bool,
            points.allSatisfy({ $0.count == 2 && $0.allSatisfy({ $0.isFinite && $0 >= 0 && $0 <= 1 }) }),
            color.range(of: "^#[0-9a-fA-F]{6}$", options: .regularExpression) != nil,
            UInt32(color.dropFirst(), radix: 16) != nil else { throw error("An annotation is invalid.") }
      pointCount += points.count
      guard pointCount <= 100_000 else { throw error("The screenshot has too many annotation points.") }
    }
    drawStrokes(strokes, in: context, size: NSSize(width: image.width, height: image.height))
    guard let result = context.makeImage() else { throw error("Couldn't render the screenshot.") }
    return result
  }

  static func drawStrokes(_ strokes: [[String: Any]], in context: CGContext, size: NSSize) {
    context.saveGState()
    for highlight in [true, false] {
      for stroke in strokes where (stroke["highlighter"] as? Bool ?? false) == highlight {
        guard let samples = stroke["points"] as? [[Double]],
              let color = stroke["color"] as? String, let hex = UInt32(color.dropFirst(), radix: 16) else { continue }
        let points = samples.filter { $0.count == 2 }.map { CGPoint(x: $0[0] * size.width, y: $0[1] * size.height) }
        guard let first = points.first, let last = points.last else { continue }
        let path = CGMutablePath()
        path.move(to: first)
        if points.count == 1 || points.allSatisfy({ $0 == first }) {
          path.addLine(to: CGPoint(x: first.x + 0.1, y: first.y))
        } else if points.count == 2 {
          path.addLine(to: last)
        } else {
          for index in 1..<points.count {
            let previous = points[index - 1]
            let current = points[index]
            path.addQuadCurve(to: CGPoint(x: (previous.x + current.x) / 2, y: (previous.y + current.y) / 2), control: previous)
          }
          path.addQuadCurve(to: last, control: last)
        }
        context.setFillColor(CGColor(red: CGFloat((hex >> 16) & 255) / 255, green: CGFloat((hex >> 8) & 255) / 255, blue: CGFloat(hex & 255) / 255, alpha: highlight ? 0.28 : 1))
        context.addPath(path.copy(strokingWithWidth: highlight ? 18 : 3, lineCap: .round, lineJoin: .round, miterLimit: 10))
        context.fillPath()
      }
    }
    context.restoreGState()
  }

  static func stitch(_ tiles: [[String: Any]], width: Double, height: Double) throws -> [String: Any] {
    guard width.isFinite, height.isFinite, width > 0, height > 0, width <= 20000, height <= 20000, !tiles.isEmpty, tiles.count <= 40 else { throw error("The page is too large to capture.") }
    let context = try bitmap(Int(width.rounded(.up)), Int(height.rounded(.up)))
    for tile in tiles {
      guard let data = tile["data"] as? String, let y = tile["y"] as? Double, y.isFinite, y >= 0, y < height else { throw error("A screenshot tile is invalid.") }
      let image = try decode(data)
      let scale = width / Double(image.width)
      let tileHeight = Double(image.height) * scale
      context.draw(image, in: CGRect(x: 0, y: height - y - tileHeight, width: width, height: tileHeight))
    }
    guard let image = context.makeImage() else { throw error("Couldn't stitch the screenshot.") }
    return try reply(image)
  }

  static func export(_ encoded: String, strokes: [[String: Any]], output: String, windowId: String, promise: Promise) {
    do {
      let image = try render(encoded, crop: nil, strokes: strokes)
      if output == "clipboard" {
        let data = try png(image)
        NSPasteboard.general.clearContents()
        guard NSPasteboard.general.setData(data, forType: .png) else { throw error("Couldn't copy the image.") }
        return promise.resolve("clipboard")
      }
      guard output == "png" || output == "pdf" else { throw error("Unknown screenshot output.") }
      let data: Data
      if output == "pdf" {
        let bytes = NSMutableData()
        var box = CGRect(x: 0, y: 0, width: image.width, height: image.height)
        guard let consumer = CGDataConsumer(data: bytes), let context = CGContext(consumer: consumer, mediaBox: &box, nil) else { throw error("Couldn't create the PDF.") }
        context.beginPDFPage(nil)
        context.draw(image, in: box)
        context.endPDFPage()
        context.closePDF()
        data = bytes as Data
      } else { data = try png(image) }
      if LaunchConfig.shared.background {
        let path = URL(fileURLWithPath: LaunchConfig.shared.dataDirectory ?? NSTemporaryDirectory()).appendingPathComponent("Screenshot-\(UUID().uuidString).\(output)")
        try data.write(to: path, options: .atomic)
        return promise.resolve(path.path)
      }
      let panel = NSSavePanel()
      panel.nameFieldStringValue = "Ardian Screenshot.\(output)"
      panel.allowedContentTypes = output == "pdf" ? [.pdf] : [.png]
      panel.canCreateDirectories = true
      let finish: (NSApplication.ModalResponse) -> Void = { response in
        guard response == .OK, let url = panel.url else { promise.resolve(nil); return }
        do { try data.write(to: url, options: .atomic); promise.resolve(url.path) }
        catch { promise.reject(error) }
      }
      if let window = WindowManager.shared.window(windowId) { panel.beginSheetModal(for: window, completionHandler: finish) }
      else { panel.begin(completionHandler: finish) }
    } catch { promise.reject(error) }
  }
}
