This folder stores which mini-app card is open and which apps were visited.
App definitions and window actions live in `store.ts`.
Mini-app web views use Ardia's existing profile and tab opening helpers.
The sidebar components are the user entry point.
Remove their imports and renders to turn this state off.
