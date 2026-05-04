"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

interface SoloResult {
  mode: "solo";
  completed: number;
  totalTime: number;
  penalty: number;
  timeUp: boolean;
}

function ResultContent() {
  const router = useRouter();
  const params = useSearchParams();
  const mode = params.get("mode") ?? "solo";
  const [result, setResult] = useState<SoloResult | null>(null);
  const [battleResult, setBattleResult] = useState<{
    territory: Record<string, string[]>; winner: string; myId: string; playerIndex: number;
  } | null>(null);

  useEffect(() => {
    if (mode === "battle") {
      const raw = sessionStorage.getItem("battleResult");
      if (raw) setBattleResult(JSON.parse(raw));
    } else {
      const raw = sessionStorage.getItem("result");
      if (raw) setResult(JSON.parse(raw));
    }
  }, [mode]);

  if (mode === "battle" && battleResult) {
    const { territory, winner, myId } = battleResult;
    const myCount = territory[myId]?.length ?? 0;
    const total = Object.values(territory).flat().length;
    const opCount = total - myCount;
    const isWin = winner === myId;
    const isDraw = winner === "draw";

    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-rose-400 to-sky-100 p-6">
        <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-sm text-center space-y-6">
          <div className="text-6xl">{isDraw ? "🤝" : isWin ? "🏆" : "😢"}</div>
          <h2 className="text-3xl font-black text-gray-800">
            {isDraw ? "引き分け！" : isWin ? "あなたの勝ち！" : "相手の勝ち…"}
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-2xl p-4">
              <div className="text-3xl font-black text-blue-600">{myCount}</div>
              <div className="text-sm text-gray-500">あなた</div>
            </div>
            <div className="bg-red-50 rounded-2xl p-4">
              <div className="text-3xl font-black text-red-500">{opCount}</div>
              <div className="text-sm text-gray-500">相手</div>
            </div>
          </div>
          <div className="space-y-3">
            <button
              onClick={() => router.push("/battle")}
              className="w-full bg-rose-500 hover:bg-rose-600 text-white font-black text-lg py-4 rounded-xl transition"
            >
              もう一度バトル
            </button>
            <button
              onClick={() => router.push("/")}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl transition"
            >
              トップへ
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (!result) return null;

  const allClear = result.completed >= 47;
  const mins = Math.floor(result.totalTime / 60);
  const secs = result.totalTime % 60;

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-sky-400 to-sky-100 p-6">
      <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-sm text-center space-y-5">
        <div className="text-6xl">{allClear ? "🎉" : "⏱"}</div>
        <h2 className="text-3xl font-black text-gray-800">
          {allClear ? "全制覇！" : result.timeUp ? "タイムアップ！" : "クリア！"}
        </h2>

        <div className="space-y-3">
          <div className="bg-sky-50 rounded-2xl p-4">
            <div className="text-xs text-gray-400 mb-1">制覇数</div>
            <div className="text-4xl font-black text-sky-600">
              {result.completed} <span className="text-xl text-gray-400">/ 47</span>
            </div>
          </div>

          {allClear && (
            <div className="bg-yellow-50 rounded-2xl p-4">
              <div className="text-xs text-gray-400 mb-1">クリアタイム（ペナルティ込み）</div>
              <div className="text-4xl font-black text-yellow-600 tabular-nums">
                {mins}:{secs.toString().padStart(2, "0")}
              </div>
              <div className="text-xs text-gray-400 mt-1">ペナルティ +{result.penalty}秒</div>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <button
            onClick={() => router.push("/solo")}
            className="w-full bg-sky-500 hover:bg-sky-600 text-white font-black text-lg py-4 rounded-xl transition"
          >
            もう一度挑戦
          </button>
          <button
            onClick={() => router.push("/")}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl transition"
          >
            トップへ
          </button>
        </div>
      </div>
    </main>
  );
}

export default function ResultPage() {
  return (
    <Suspense>
      <ResultContent />
    </Suspense>
  );
}
