export type ToolbarRow = {
  height: number;
  center: number;
  button: number;
  buttonRadius: number;
  field: number;
  fieldRadius: number;
  fieldButton: number;
  fieldButtonRadius: number;
  extensionButton: number;
};

export const TOOLBAR_ROWS: Record<"regular" | "compact", ToolbarRow> = {
  regular: { height: 46, center: 22, button: 28, buttonRadius: 8, field: 40, fieldRadius: 8, fieldButton: 24, fieldButtonRadius: 5, extensionButton: 28 },
  compact: { height: 28, center: 14, button: 22, buttonRadius: 4, field: 22, fieldRadius: 4, fieldButton: 18, fieldButtonRadius: 2, extensionButton: 22 },
};

export const toolbarRowOf = (compact: boolean): ToolbarRow => (compact ? TOOLBAR_ROWS.compact : TOOLBAR_ROWS.regular);

export const urlFieldOf = (row: ToolbarRow) => ({ top: row.center - row.field / 2, height: row.field });

export const compactLift = (row: ToolbarRow) => Math.round((TOOLBAR_ROWS.regular.center - row.center) * 2) / 2;
