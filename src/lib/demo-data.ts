import type { Review, Staff } from "./types";

// Hardcoded demo data — no backend. Sign in with any of the IDs below.

export const DEMO_STAFF: Staff[] = [
  { id: "DIST-1042", name: "Dr. Meera Iyer", dept: "Information Science & Technology", avatar_url: null },
  { id: "DIST-2210", name: "Prof. Arjun Rao", dept: "Information Science & Technology", avatar_url: null },
  { id: "DIST-0387", name: "Dr. Lena Fischer", dept: "Information Science & Technology", avatar_url: null }, // no reviews -> empty state
];

// [alias, rating, comment, tags, daysAgo]
type Row = [string, number, string, string[], number];

const ROWS: Record<string, Row[]> = {
  "DIST-1042": [
    ["Quiet Otter", 5, "Explains recursion like telling a story. I finally get it.", ["clarity", "engaging"], 2],
    ["Amber Finch", 4, "Great pace, and the office hours are genuinely useful.", ["supportive", "pace"], 5],
    ["Slow Comet", 3, "Good content, but the slides are dense.", ["slides"], 9],
    ["Paper Heron", 5, "Made me want to specialise in networks.", ["inspiring", "engaging"], 13],
    ["Copper Moth", 2, "Feedback on assignments took too long to arrive.", ["feedback", "timeliness"], 18],
    ["Green Lantern", 4, "Fair grading and clear rubrics.", ["fairness", "clarity"], 26],
    ["Dusk Sparrow", 5, "Always patient, even with the same question three times.", ["patient", "supportive"], 33],
    ["Tin Fox", 3, "Lectures felt rushed near the end of term.", ["pace"], 41],
    ["Marble Wren", 4, "Real-world examples made the theory stick.", ["examples", "engaging"], 52],
    ["Salt Badger", 1, "Lab instructions were confusing and changed mid-week.", ["clarity", "labs"], 60],
    ["Velvet Ibis", 5, "The best course I took this year.", ["inspiring"], 75],
    ["Rust Kestrel", 4, "Kind, organised, and funny.", ["organised", "engaging"], 90],
  ],
  "DIST-2210": [
    ["Ash Lynx", 3, "Rigorous, but the networking labs move very fast.", ["pace", "rigour"], 4],
    ["Ivory Crane", 2, "Hard to follow the diagrams from the back row.", ["clarity"], 11],
    ["Mint Sparrow", 4, "Tough but fair exams.", ["fairness"], 20],
    ["Bronze Owl", 3, "Knows the material deeply; could slow down.", ["pace"], 38],
    ["Coral Newt", 5, "The problem sessions were a highlight.", ["supportive", "engaging"], 47],
    ["Dawn Vole", 2, "Homework solutions were posted too late to learn from.", ["feedback", "timeliness"], 66],
  ],
  "DIST-0387": [],
};

const DAY = 86_400_000;

export function findStaff(id: string): Staff | undefined {
  return DEMO_STAFF.find((s) => s.id === id.trim().toUpperCase());
}

export function reviewsFor(staffId: string): Review[] {
  const now = Date.now();
  return (ROWS[staffId] ?? []).map(([student_alias, rating, comment, tags, daysAgo], i) => ({
    id: `${staffId}-${i}`,
    staff_id: staffId,
    student_alias,
    rating,
    comment,
    tags,
    created_at: new Date(now - daysAgo * DAY).toISOString(),
  }));
}
