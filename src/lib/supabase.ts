import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(url, key);

export async function savePlayer(nickname: string, grade: string): Promise<string | null> {
  const { data, error } = await supabase
    .from("pref_players")
    .insert([{ nickname, grade }])
    .select("id")
    .single();
  if (error) { console.error("player save error:", error); return null; }
  return data?.id ?? null;
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

export interface RankingRow {
  clear_time: number;
  penalty_total: number;
  pref_players: { nickname: string; grade: string } | null;
}

export async function fetchRanking(): Promise<RankingRow[]> {
  const { data, error } = await supabase
    .from("pref_scores")
    .select("clear_time, penalty_total, pref_players(nickname, grade)")
    .eq("mode", "solo")
    .eq("completed_count", 41)
    .order("clear_time", { ascending: true })
    .limit(10);
  if (error) { console.error(error); return []; }
  return (data ?? []) as RankingRow[];
}
