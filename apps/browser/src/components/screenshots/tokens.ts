const NAMED_COLORS: Record<string, string> = { red: "#FF3B30", blue: "#007AFF", black: "#1D1D1F", purple: "#AF52DE", green: "#34C759", yellow: "#FFCC00", lightgreen: "#34C759", cyan: "#32ADE6", orange: "#FF9500", pink: "#FF2D55" };
export const screenshotColor = (value: string) => /^#[0-9a-f]{6}$/i.test(value) ? value : NAMED_COLORS[value] ?? NAMED_COLORS.red!;
