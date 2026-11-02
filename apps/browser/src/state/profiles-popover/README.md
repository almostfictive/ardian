This folder holds the open window id for the profile popover.
The popover UI reads and updates this small Zustand store.
Profile data and switching remain owned by Ardia's existing profile state.
The UI entry point is `components/profiles-popover/ProfilePopover.tsx`.
Remove this folder and the component integration to turn it off.
