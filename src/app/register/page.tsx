"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

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

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode") ?? "solo";
  const [nickname, setNickname] = useState("");
  const [grade, setGrade] = useState("");
  const [area, setArea] = useState("");
  const [error, setError] = useState("");

  const handleStart = () => {
    if (!nickname.trim()) { setError("ニックネームを入力してください"); return; }
    if (!grade) { setError("学年を選んでください"); return; }
    if (!area) { setError("区を選んでください"); return; }

    sessionStorage.setItem("nickname", nickname.trim());
    sessionStorage.setItem("grade", grade);
    sessionStorage.setItem("area", area);

    router.push(mode === "battle" ? "/battle" : "/solo");
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-sky-400 to-sky-100 p-6">
      <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-sm">
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
            className="w-full bg-sky-500 hover:bg-sky-600 text-white font-black text-xl rounded-xl py-4 transition hover:scale-105 active:scale-95 mt-2"
          >
            スタート！
          </button>
        </div>
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
