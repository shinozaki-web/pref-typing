"use client";

import { useState } from "react";
import { Prefecture } from "@/lib/prefectures";

interface Props {
  pref: Prefecture;
  onHintUse: (level: 2 | 3) => void;
  usedLevels: Set<number>;
}

const PENALTIES = { 2: 10, 3: 20 };

export default function HintPanel({ pref, onHintUse, usedLevels }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="w-full space-y-2">
      {/* lv1: 常時表示・ペナルティなし */}
      <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-2">
        <div className="text-xs font-bold text-emerald-700 mb-1">📖 豆知識</div>
        <p className="text-sm text-gray-700">{pref.hints.lv1}</p>
      </div>

      {/* lv2・lv3: ボタンで開く */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full py-2 px-4 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-xl text-sm font-bold text-amber-800 transition"
      >
        💡 ヒントを見る
      </button>

      {open && (
        <div className="space-y-2">
          {([2, 3] as const).map((lv) => (
            <div key={lv} className="rounded-xl border border-amber-200 bg-white overflow-hidden">
              <div className="flex items-center justify-between px-3 py-2 bg-amber-50">
                <span className="text-xs font-bold text-amber-700">
                  ヒント Lv{lv}
                  <span className="ml-2 text-red-500 font-normal">+{PENALTIES[lv]}秒</span>
                </span>
                {!usedLevels.has(lv) && (
                  <button
                    onClick={() => onHintUse(lv)}
                    className="text-xs bg-amber-400 hover:bg-amber-500 text-white px-3 py-1 rounded-lg font-bold transition"
                  >
                    開く
                  </button>
                )}
              </div>
              {usedLevels.has(lv) && (
                <p className="px-3 py-2 text-sm text-gray-700">
                  {lv === 2 && pref.hints.lv2}
                  {lv === 3 && (
                    <span className="text-lg font-bold tracking-widest text-indigo-700">
                      {pref.hints.lv3}
                    </span>
                  )}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
