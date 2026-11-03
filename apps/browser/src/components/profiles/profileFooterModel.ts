type SegmenterConstructor = new (locale?: string, options?: { granularity: "grapheme" }) => { segment(input: string): Iterable<{ segment: string }> };

export function profileFooterContent(name: string, icon: string | null): { photo: string | null; initial: string } {
  const photo = icon?.startsWith("file:") || icon?.startsWith("data:image/") ? icon : null;
  const value = name.trim();
  const Segmenter = (Intl as typeof Intl & { Segmenter?: SegmenterConstructor }).Segmenter;
  const initial = value && Segmenter ? [...new Segmenter(undefined, { granularity: "grapheme" }).segment(value)][0]?.segment : Array.from(value)[0];
  return { photo, initial: initial?.toLocaleUpperCase() ?? "?" };
}
