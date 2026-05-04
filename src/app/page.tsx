"use client";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const go = (mode: "solo" | "battle") => {
    sessionStorage.setItem("mode", mode);
    router.push("/register");
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-sky-400 to-sky-100 p-6">
      <div className="text-center mb-10">
        <div className="text-6xl mb-3">🗾</div>
        <h1 className="text-4xl font-black text-white drop-shadow-md tracking-wide">
          都道府県タイピング
        </h1>
        <p className="text-sky-100 mt-2 text-lg">日本地図を全部塗りつくせ！</p>
      </div>

      <div className="flex flex-col gap-5 w-full max-w-xs">
        <button
          onClick={() => go("solo")}
          className="bg-white hover:bg-yellow-50 border-4 border-yellow-400 rounded-2xl py-5 text-xl font-black text-yellow-700 shadow-lg transition hover:scale-105 active:scale-95"
        >
          🏆 ひとりで挑戦
          <div className="text-sm font-normal text-gray-400 mt-1">47都道府県 制覇タイムを競おう</div>
        </button>

        <button
          onClick={() => go("battle")}
          className="bg-white hover:bg-rose-50 border-4 border-rose-400 rounded-2xl py-5 text-xl font-black text-rose-600 shadow-lg transition hover:scale-105 active:scale-95"
        >
          ⚔️ 2人バトル
          <div className="text-sm font-normal text-gray-400 mt-1">陣取り合戦！多く制覇した方が勝ち</div>
        </button>
      </div>

      <div className="mt-10 bg-white/60 rounded-2xl p-4 text-sm text-gray-600 max-w-xs text-center">
        <p>⏱ 制限時間 <strong>10分</strong></p>
        <p>💡 ヒント3段階（ペナルティあり）</p>
        <p>⏭ パスして後回しもOK</p>
      </div>
    </main>
  );
}
