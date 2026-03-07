/**
 * Fallback emoji mappings for expense categories
 */

const FALLBACK_EMOJIS: Record<string, string> = {
  Food: "🍔",
  Transportation: "🚗",
  Entertainment: "🎬",
  Shopping: "🛍️",
  Bills: "📄",
  Healthcare: "🏥",
  Education: "📚",
  Travel: "✈️",
  Other: "📦",
};

export const DEFAULT_EMOJI = "📦";

export function getCategoryEmoji(
  categoryOrName: string | { emoji?: string | null; name?: string },
): string {
  if (typeof categoryOrName === "string") {
    return FALLBACK_EMOJIS[categoryOrName] || DEFAULT_EMOJI;
  }
  return (
    categoryOrName.emoji || FALLBACK_EMOJIS[categoryOrName.name || ""] || DEFAULT_EMOJI
  );
}
