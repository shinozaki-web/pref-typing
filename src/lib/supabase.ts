import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(url, key);

export interface Player {
  id: string;
  nickname: string;
  grade: string;
}

export interface ScoreRecord {
  player_id: string;
  mode: "solo" | "battle";
  clear_time: number | null;
  penalty_total: number;
  completed_count: number;
  won: boolean | null;
}

export async function saveScore(record: ScoreRecord) {
  const { error } = await supabase.from("pref_scores").insert([record]);
  if (error) console.error("score save error:", error);
}

export async function fetchRanking(mode: "solo" | "battle") {
  const { data, error } = await supabase
    .from("pref_scores")
    .select("*, pref_players(nickname, grade)")
    .eq("mode", mode)
    .eq("completed_count", 47)
    .order("clear_time", { ascending: true })
    .limit(10);
  if (error) { console.error(error); return []; }
  return data ?? [];
}
