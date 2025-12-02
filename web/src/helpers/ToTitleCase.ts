export function toTitleCase(input: unknown): string {
  const str = (input ?? "").toString();
  if (!str) return "";
  return str
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim()
    .replace(/(^|[\s-])([a-z])/g, (_, p1, p2) => `${p1}${p2.toUpperCase()}`);
}