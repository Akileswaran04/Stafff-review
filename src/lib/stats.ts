import type { Sentiment } from "./types";

// brass = positive, slate = neutral, clay = needs attention
export const SENTIMENT_COLOR: Record<Sentiment, string> = {
  positive: "#D4A574",
  neutral: "#8B8D9A",
  attention: "#C8553D",
};

export const sentimentOf = (rating: number): Sentiment =>
  rating >= 4 ? "positive" : rating === 3 ? "neutral" : "attention";

export function isThisMonth(iso: string, now = new Date()) {
  const d = new Date(iso);
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
}

export const initials = (name: string) =>
  name
    .replace(/^(dr|prof|mr|mrs|ms)\.?\s+/i, "")
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
