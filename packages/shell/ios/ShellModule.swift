import AppKit
import ArdiaCore
import ExpoModulesCore

public class ShellModule: Module {
  private static var quitCancelledOwner: ObjectIdentifier?

  private let lifetime = ModuleLifetime()
  private var appearanceObservation: NSKeyValueObservation?
  private var sidebarObservers: [(NotificationCenter, NSObjectProtocol)] = []
  private var flagsMonitor: Any?
  private var numberHintWork: DispatchWorkItem?
  private var numberHintSuppressed = false
  private var numberHintsShown = false

  public func definition() -> ModuleDefinition {
    Name("ArdiaShell")
    Events(ShellEvents.Channel.openURLs.rawValue, ShellEvents.Channel.app.rawValue)

    OnCreate {
      _ = installTextSettingsMenu
      _ = installTextFieldSelectAll
      _ = installInputSourceKeys
      _ = installScrollViewInsetFix
      _ = installOutsidePressMonitor
      _ = installWindowMoveFallback
      self.lifetime.begin(self) {
        self.appearanceObservation?.invalidate()
        self.appearanceObservation = nil
        for (center, token) in self.sidebarObservers { center.removeObserver(token) }
        self.sidebarObservers = []
        if let monitor = self.flagsMonitor { NSEvent.removeMonitor(monitor) }
        self.flagsMonitor = nil
        self.numberHintWork?.cancel()
        self.numberHintWork = nil
        if Self.quitCancelledOwner == ObjectIdentifier(self) {
          Self.quitCancelledOwner = nil
          ArdiaHost.quitCancelledHandler = nil
        }
        ShellEvents.retire(self)
      }
      self.lifetime.onMain { [weak self] in
        guard let self else { return }
        self.appearanceObservation = NSApp.observe(\.effectiveAppearance) { _, _ in
          ShellEvents.send(.app, ["type": "appearance", "dark": ShellModule.isDark])
        }
        self.observeForSidebar()
        ArdiaHost.quitCancelledHandler = { ShellEvents.send(.app, ["type": "quitCancelled"]) }
        Self.quitCancelledOwner = ObjectIdentifier(self)
      }
    }

    OnDestroy {
      self.lifetime.end()
      ShellEvents.detach(self)
    }

    OnStartObserving(ShellEvents.Channel.app.rawValue) { ShellEvents.attach(.app, to: self, while: self.lifetime) }

    OnStartObserving(ShellEvents.Channel.openURLs.rawValue) { ShellEvents.attach(.openURLs, to: self, while: self.lifetime) }

    AsyncFunction("setAppearance") { (mode: String) in
      NSApp.appearance = mode == "light" ? NSAppearance(named: .aqua) : mode == "dark" ? NSAppearance(named: .darkAqua) : nil
    }.runOnQueue(.main)
    AsyncFunction("isDarkAppearance") { () -> Bool in ShellModule.isDark }.runOnQueue(.main)
    Function("startDictation") {
      DispatchQueue.main.async { NSApp.sendAction(Selector(("startDictation:")), to: nil, from: nil) }
    }
    AsyncFunction("fetchBangList") { (etag: String?, promise: Promise) in
      BangListFetch.start(etag: etag) { result in
        switch result {
        case .success(let reply): promise.resolve(reply)
        case .failure(let error): promise.reject("ERR_BANG_LIST", error.localizedDescription)
        }
      }
    }
    Function("copyText") { (text: String) in
      DispatchQueue.main.async {
        NSPasteboard.general.clearContents()
        NSPasteboard.general.setString(text, forType: .string)
      }
    }
    AsyncFunction("readText") { () -> String in NSPasteboard.general.string(forType: .string) ?? "" }.runOnQueue(.main)
  }

  private func observeForSidebar() {
    let emit: (String) -> Void = { ShellEvents.send(.app, ["type": $0]) }
    let quiet = { NSApp.modalWindow == nil && !NSApp.windows.contains { $0.attachedSheet != nil || $0.isSheet && $0.isVisible } }
    let workspace = NotificationCenter.default
    sidebarObservers.append((workspace, workspace.addObserver(forName: NSApplication.didResignActiveNotification, object: nil, queue: .main) { _ in
      if quiet() { emit("resignActive") }
    }))
    sidebarObservers.append((workspace, workspace.addObserver(forName: NSWindow.didResignKeyNotification, object: nil, queue: .main) { [weak self] _ in
      self?.hideTabNumbers()
      self?.numberHintSuppressed = true
    }))
    let distributed = DistributedNotificationCenter.default()
    sidebarObservers.append((distributed, distributed.addObserver(forName: .init("com.apple.screenIsLocked"), object: nil, queue: .main) { _ in
      emit("lockedOrAsleep")
      if quiet() { emit("screenLocked") }
    }))
    let session = NSWorkspace.shared.notificationCenter
    for name in [NSWorkspace.willSleepNotification, NSWorkspace.screensDidSleepNotification, NSWorkspace.sessionDidResignActiveNotification] {
      sidebarObservers.append((session, session.addObserver(forName: name, object: nil, queue: .main) { _ in emit("lockedOrAsleep") }))
    }
    flagsMonitor = NSEvent.addLocalMonitorForEvents(matching: [.flagsChanged, .keyDown]) { [weak self] event in
      guard let self else { return event }
      self.hideTabNumbers()
      if event.type == .keyDown {
        self.numberHintSuppressed = event.modifierFlags.contains(.command)
        return event
      }
      if SwitcherHold.released(by: event.modifierFlags) { emit("switcherReleased") }
      let flags = event.modifierFlags.intersection([.command, .shift, .option, .control])
      if !flags.contains(.command) { self.numberHintSuppressed = false }
      if flags == .command, !self.numberHintSuppressed, let windowId = WindowManager.shared.keyWindowId {
        let work = DispatchWorkItem { [weak self] in
          guard let self, NSApp.isActive, WindowManager.shared.keyWindowId == windowId else { return }
          self.numberHintsShown = true
          ShellEvents.send(.app, ["type": "tabNumbers", "windowId": windowId, "shown": true])
        }
        self.numberHintWork = work
        DispatchQueue.main.asyncAfter(deadline: .now() + .milliseconds(200), execute: work)
      }
      return event
    }
  }

  private func hideTabNumbers() {
    numberHintWork?.cancel()
    numberHintWork = nil
    if numberHintsShown {
      numberHintsShown = false
      ShellEvents.send(.app, ["type": "tabNumbers", "windowId": "", "shown": false])
    }
  }

  static var isDark: Bool {
    NSApp.effectiveAppearance.bestMatch(from: [.darkAqua, .aqua]) == .darkAqua
  }
}
