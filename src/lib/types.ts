export interface Staff {
  id: string;
  name: string;
  dept: string;
  avatar_url: string | null;
}

export interface Review {
  id: string;
  staff_id: string;
  student_alias: string;
  rating: number;
  comment: string;
  tags: string[];
  created_at: string;
}

export type Sentiment = "positive" | "neutral" | "attention";
