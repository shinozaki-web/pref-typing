"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { savePlayer, fetchRanking, type RankingRow } from "@/lib/supabase";

const GRADES = [
  "小学1年生", "小学2年生", "小学3年生",
  "小学4年生", "小学5年生", "小学6年生",
  "中学1年生", "中学2年生", "中学3年生",
  "高校生以上",
];

const AREAS = [
  "門司区", "小倉北区", "小倉南区",
  "戸畑区", "若松区", "八幡西区", "八幡東区",
];

function formatTime(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode") ?? "solo";
  const [nickname, setNickname] = useState("");
  const [grade, setGrade] = useState("");
  const [area, setArea] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [ranking, setRanking] = useState<RankingRow[]>([]);

  useEffect(() => {
    fetchRanking().then(setRanking);
  }, []);

  const handleStart = async () => {
    if (!nickname.trim()) { setError("ニックネームを入力してください"); return; }
    if (!grade) { setError("学年を選んでください"); return; }
    if (!area) { setError("区を選んでください"); return; }

    setLoading(true);
    const playerId = await savePlayer(nickname.trim(), grade);
    if (playerId) sessionStorage.setItem("playerId", playerId);
    sessionStorage.setItem("nickname", nickname.trim());
    sessionStorage.setItem("grade", grade);
    sessionStorage.setItem("area", area);

    router.push(mode === "battle" ? "/battle" : "/solo");
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-400 to-sky-100 p-6">
      <div className="max-w-sm mx-auto space-y-6">
        {/* 登録フォーム */}
        <div className="bg-white rounded-3xl shadow-xl p-8">
          <div className="text-center mb-6">
            <div className="text-4xl mb-2">✏️</div>
            <h2 className="text-2xl font-black text-gray-800">プレイヤー登録</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-600 mb-1">ニックネーム</label>
              <input
                type="text"
                value={nickname}
                onChange={e => setNickname(e.target.value)}
                placeholder="例: たろう"
                maxLength={10}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-lg focus:border-sky-400 outline-none text-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-600 mb-1">学年</label>
              <select
                value={grade}
                onChange={e => setGrade(e.target.value)}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-lg focus:border-sky-400 outline-none bg-white text-gray-900"
              >
                <option value="">選んでください</option>
                {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-600 mb-1">区</label>
              <div className="grid grid-cols-2 gap-2">
                {AREAS.map(a => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => setArea(a)}
                    className={`py-2 rounded-xl font-bold text-sm border-2 transition ${
                      area === a
                        ? "bg-sky-500 border-sky-500 text-white"
                        : "bg-white border-gray-200 text-gray-600 hover:border-sky-300"
                    }`}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>

            {error && <p className="text-red-500 text-sm text-center">{error}</p>}

            <button
              onClick={handleStart}
              disabled={loading}
              className="w-full bg-sky-500 hover:bg-sky-600 disabled:bg-sky-300 text-white font-black text-xl rounded-xl py-4 transition hover:scale-105 active:scale-95 mt-2"
            >
              {loading ? "登録中…" : "スタート！"}
            </button>
          </div>
        </div>

        {/* ランキング */}
        {ranking.length > 0 && (
          <div className="bg-white rounded-3xl shadow-xl p-6">
            <h3 className="text-lg font-black text-gray-800 mb-4 text-center">🏆 ソロランキング TOP10</h3>
            <div className="space-y-2">
              {ranking.map((r, i) => (
                <div key={i} className={`flex items-center gap-3 px-3 py-2 rounded-xl ${i === 0 ? "bg-yellow-50 border border-yellow-200" : i === 1 ? "bg-gray-50 border border-gray-200" : i === 2 ? "bg-orange-50 border border-orange-200" : "bg-white border border-gray-100"}`}>
                  <span className="text-lg font-black w-6 text-center">
                    {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}`}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-gray-800 truncate">{r.pref_players?.nickname ?? "？"}</div>
                    <div className="text-xs text-gray-400">{r.pref_players?.grade}</div>
                  </div>
                  <div className="font-black text-sky-600 tabular-nums">{formatTime(r.clear_time)}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}
