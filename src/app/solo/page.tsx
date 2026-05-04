"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { PREFECTURES, PREFECTURE_MAP } from "@/lib/prefectures";
import HintPanel from "@/components/HintPanel";
import { saveScore } from "@/lib/supabase";

// Web Audio API 効果音
let audioCtx: AudioContext | null = null;
function getCtx() {
  if (!audioCtx) audioCtx = new AudioContext();
  return audioCtx;
}

function playType() {
  const ctx = getCtx();
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.connect(g); g.connect(ctx.destination);
  o.type = "sine";
  o.frequency.setValueAtTime(880, ctx.currentTime);
  o.frequency.exponentialRampToValueAtTime(660, ctx.currentTime + 0.04);
  g.gain.setValueAtTime(0.08, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.07);
  o.start(); o.stop(ctx.currentTime + 0.07);
}

function playCorrect() {
  const ctx = getCtx();
  [523, 659, 784].forEach((freq, i) => {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.type = "triangle";
    const t = ctx.currentTime + i * 0.08;
    o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0.18, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
    o.start(t); o.stop(t + 0.18);
  });
}

function playMiss() {
  const ctx = getCtx();
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.connect(g); g.connect(ctx.destination);
  o.type = "sawtooth";
  o.frequency.setValueAtTime(180, ctx.currentTime);
  o.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.15);
  g.gain.setValueAtTime(0.12, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
  o.start(); o.stop(ctx.currentTime + 0.15);
}

const JapanMap = dynamic(() => import("@/components/JapanMap"), { ssr: false });

const TOTAL_TIME = 300; // 5分
const PASS_PENALTY = 15;
const HINT_PENALTY = { 1: 5, 2: 10, 3: 20 } as const;

// 最初から地図に表示するランドマーク県（タイピング対象外）
const PRE_SHOWN_IDS = new Set(["hokkaido", "tokyo", "aichi", "osaka", "fukuoka", "okinawa"]);
const QUIZ_COUNT = PREFECTURES.length - PRE_SHOWN_IDS.size; // 41

export default function SoloPage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  // ゲーム状態
  const [started, setStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const [penalty, setPenalty] = useState(0); // 累計ペナルティ秒
  const [penaltyFlash, setPenaltyFlash] = useState("");

  // 都道府県キュー
  const [queue, setQueue] = useState<string[]>([]);
  const [passQueue, setPassQueue] = useState<string[]>([]);
  const [completed, setCompleted] = useState<string[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);

  // 入力
  const [input, setInput] = useState("");
  const [missFlash, setMissFlash] = useState(false);

  // ヒント
  const [usedHints, setUsedHints] = useState<Set<number>>(new Set());

  // 一時停止
  const [paused, setPaused] = useState(false);
  const pausedRef = useRef(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const pauseStartRef = useRef<number>(0);
  const bgmRef = useRef<HTMLAudioElement | null>(null);

  // カラーマップ
  const colorMap: Record<string, string> = {};
  completed.forEach(id => { colorMap[id] = "#4ade80"; }); // 緑
  passQueue.forEach(id => { if (!colorMap[id]) colorMap[id] = "#fb923c"; }); // オレンジ
  if (currentId) colorMap[currentId] = "#fde047"; // 黄色（ターゲット）

  const showPenaltyFlash = (text: string) => {
    setPenaltyFlash(text);
    setTimeout(() => setPenaltyFlash(""), 1200);
  };

  const endGame = useCallback((timeUp: boolean) => {
    clearInterval(timerRef.current!);
    if (bgmRef.current) {
      const bgm = bgmRef.current;
      const fade = setInterval(() => {
        if (bgm.volume > 0.03) bgm.volume -= 0.03;
        else { bgm.pause(); clearInterval(fade); }
      }, 80);
    }
    const elapsed = Math.round((Date.now() - startTimeRef.current) / 1000) + penalty;
    const completedCount = completed.length + (timeUp ? 0 : 1);
    sessionStorage.setItem("result", JSON.stringify({
      mode: "solo",
      completed: completedCount,
      totalTime: elapsed,
      penalty,
      timeUp,
    }));
    const playerId = sessionStorage.getItem("playerId");
    if (playerId) {
      saveScore({
        player_id: playerId,
        mode: "solo",
        clear_time: elapsed,
        penalty_total: penalty,
        completed_count: completedCount,
        won: null,
      });
    }
    router.push("/result");
  }, [completed, penalty, router]);

  // タイマー
  useEffect(() => {
    if (!started) return;
    timerRef.current = setInterval(() => {
      if (pausedRef.current) return;
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          endGame(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, [started, endGame]);

  const togglePause = () => {
    if (!paused) {
      pausedRef.current = true;
      setPaused(true);
      pauseStartRef.current = Date.now();
      bgmRef.current?.pause();
    } else {
      pausedRef.current = false;
      setPaused(false);
      startTimeRef.current += Date.now() - pauseStartRef.current;
      bgmRef.current?.play();
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const startGame = () => {
    const shuffled = [...PREFECTURES]
      .filter(p => !PRE_SHOWN_IDS.has(p.id))
      .sort(() => Math.random() - 0.5)
      .map(p => p.id);
    setQueue(shuffled.slice(1));
    setCurrentId(shuffled[0]);
    setStarted(true);
    startTimeRef.current = Date.now();
    setTimeout(() => inputRef.current?.focus(), 100);
    // BGM開始
    const bgm = new Audio("/47bgm.mp3");
    bgm.loop = true;
    bgm.volume = 0.1;
    bgm.play();
    bgmRef.current = bgm;
  };

  const nextPref = useCallback((fromPassQueue = false) => {
    setUsedHints(new Set());
    setInput("");

    // passQueueから先に消費
    if (!fromPassQueue && passQueue.length > 0) {
      const [next, ...rest] = passQueue;
      setPassQueue(rest);
      setCurrentId(next);
      return;
    }
    if (queue.length > 0) {
      const [next, ...rest] = queue;
      setQueue(rest);
      setCurrentId(next);
    } else if (passQueue.length > 0) {
      const [next, ...rest] = passQueue;
      setPassQueue(rest);
      setCurrentId(next);
    } else {
      // 全制覇！
      endGame(false);
    }
  }, [queue, passQueue, endGame]);

  const normalizeRomaji = (s: string) =>
    s.toLowerCase().replace(/\s/g, "")
      .replace(/si/g, "shi")
      .replace(/ti/g, "chi")
      .replace(/tu/g, "tsu")
      .replace(/nn/g, "n")
      .replace(/oo/g, "o")
      .replace(/ou/g, "o");

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!currentId) return;
    const val = normalizeRomaji(e.target.value);
    setInput(val);

    const pref = PREFECTURE_MAP[currentId];
    if (!pref) return;

    if (val === pref.romaji) {
      // 正解
      playCorrect();
      setCompleted(prev => [...prev, currentId]);
      nextPref();
      if (completed.length + 1 >= QUIZ_COUNT) endGame(false);
    } else if (!pref.romaji.startsWith(val)) {
      // ミス
      playMiss();
      setMissFlash(true);
      setTimeout(() => setMissFlash(false), 300);
      setTimeout(() => setInput(""), 50);
    } else {
      // 正しい入力途中
      playType();
    }
  };

  const handlePass = () => {
    if (!currentId) return;
    setPassQueue(prev => [...prev, currentId]);
    setPenalty(p => p + PASS_PENALTY);
    showPenaltyFlash(`⏭ パス +${PASS_PENALTY}秒`);
    nextPref(true);
  };

  const handleHint = (lv: 1 | 2 | 3) => {
    const pen = HINT_PENALTY[lv];
    setUsedHints(prev => new Set([...prev, lv]));
    setPenalty(p => p + pen);
    showPenaltyFlash(`💡 ヒント Lv${lv} +${pen}秒`);
  };

  const currentPref = currentId ? PREFECTURE_MAP[currentId] : null;
  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const isUrgent = timeLeft <= 60;

  if (!started) {
    return (
      <main className="min-h-screen flex flex-col lg:flex-row bg-gradient-to-b from-sky-500 to-sky-100">
        {/* 地図プレビュー */}
        <div className="flex-1 p-4 min-h-0" style={{ minHeight: "50vh" }}>
          <JapanMap colorMap={{}} targetId={null} preShownIds={PRE_SHOWN_IDS} />
        </div>

        {/* 説明エリア */}
        <div className="w-full lg:w-80 flex flex-col justify-center items-center gap-5 p-6 bg-white/80 backdrop-blur shadow-xl">
          <div className="text-center">
            <div className="text-5xl mb-2">🗾</div>
            <h1 className="text-2xl font-black text-sky-800 mb-1">都道府県タイピング</h1>
            <p className="text-sky-600 text-sm">制限時間5分・{QUIZ_COUNT}県を制覇しよう！</p>
          </div>

          <div className="w-full bg-sky-50 border border-sky-200 rounded-2xl p-4 text-sm text-gray-600">
            <div className="font-bold text-sky-700 mb-2">📍 ランドマーク（水色・最初から表示）</div>
            <div className="flex flex-wrap gap-1 mb-2">
              {[...PRE_SHOWN_IDS].map(id => (
                <span key={id} className="bg-sky-200 text-sky-800 px-2 py-0.5 rounded text-xs font-bold">
                  {PREFECTURE_MAP[id]?.name}
                </span>
              ))}
            </div>
            <p className="text-xs text-gray-400">これらを目印に、地図の光っている県を探してタイピング！</p>
          </div>

          <div className="w-full text-xs text-gray-500 space-y-1">
            <p>⏱ 制限時間 <strong>5分</strong></p>
            <p>💡 ヒント3段階（ペナルティあり）</p>
            <p>⏭ パスして後回しもOK</p>
          </div>

          <button
            onClick={startGame}
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-black text-xl py-4 rounded-2xl shadow-lg transition hover:scale-105 active:scale-95"
          >
            スタート！
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className={`h-screen flex flex-col lg:flex-row ${missFlash ? "bg-red-50" : "bg-sky-50"} transition-colors duration-150 overflow-hidden`}>

      {/* 一時停止オーバーレイ */}
      {paused && (
        <div className="fixed inset-0 z-40 bg-black/50 flex items-center justify-center" onClick={togglePause}>
          <div className="bg-white rounded-3xl p-10 text-center shadow-2xl">
            <div className="text-5xl mb-3">⏸</div>
            <div className="text-2xl font-black text-gray-700 mb-1">一時停止中</div>
            <div className="text-sm text-gray-400 mb-5">タップして再開</div>
            <button
              onClick={togglePause}
              className="bg-sky-500 hover:bg-sky-600 text-white font-black text-lg px-10 py-3 rounded-2xl transition"
            >
              ▶ 再開
            </button>
          </div>
        </div>
      )}

      {/* ペナルティフラッシュ */}
      {penaltyFlash && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-red-500 text-white font-black text-lg px-6 py-3 rounded-2xl shadow-xl animate-bounce">
          {penaltyFlash}
        </div>
      )}

      {/* 左：地図 */}
      <div className="flex-1 p-2 min-h-0 overflow-hidden">
        <JapanMap colorMap={colorMap} targetId={currentId} preShownIds={PRE_SHOWN_IDS} />
      </div>

      {/* 右：操作パネル */}
      <div className="w-full lg:w-80 flex flex-col gap-4 p-4 bg-white shadow-xl">

        {/* タイマー */}
        <div className={`rounded-2xl p-4 text-center ${isUrgent && !paused ? "bg-red-100 border-2 border-red-400" : paused ? "bg-gray-100 border-2 border-gray-300" : "bg-sky-100"}`}>
          <div className="text-xs font-bold text-gray-500 mb-1">のこり時間</div>
          <div className={`text-5xl font-black tabular-nums ${isUrgent && !paused ? "text-red-600 animate-pulse" : paused ? "text-gray-400" : "text-sky-700"}`}>
            {mins}:{secs.toString().padStart(2, "0")}
          </div>
          <div className="text-xs text-gray-400 mt-1">ペナルティ累計 +{penalty}秒</div>
          <button
            onClick={togglePause}
            className={`mt-2 w-full py-1.5 rounded-xl font-bold text-sm transition ${paused ? "bg-sky-500 hover:bg-sky-600 text-white" : "bg-gray-200 hover:bg-gray-300 text-gray-700"}`}
          >
            {paused ? "▶ 再開" : "⏸ 一時停止"}
          </button>
        </div>

        {/* 進捗 */}
        <div className="bg-gray-100 rounded-2xl p-3 text-center">
          <div className="text-2xl font-black text-gray-700">{completed.length} <span className="text-base font-normal text-gray-400">/ {QUIZ_COUNT}</span></div>
          <div className="text-xs text-gray-400">制覇済み</div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div
              className="bg-green-400 h-2 rounded-full transition-all"
              style={{ width: `${(completed.length / QUIZ_COUNT) * 100}%` }}
            />
          </div>
          {passQueue.length > 0 && (
            <div className="text-xs text-orange-500 mt-1">後回し: {passQueue.length}県</div>
          )}
        </div>

        {/* 問題エリア */}
        {currentPref && (
          <div className="flex-1 flex flex-col gap-3">
            <div className="bg-yellow-50 border-2 border-yellow-300 rounded-2xl p-4 text-center">
              <div className="text-xs text-gray-400 mb-1">地図の光っている県をタイピング！</div>
              <div className="text-3xl font-black text-gray-800">？？？</div>
            </div>

            {/* 入力 */}
            <div className={`relative rounded-2xl border-4 ${missFlash ? "border-red-400 bg-red-50" : "border-sky-300 bg-white"} transition-colors`}>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={handleInput}
                placeholder="ローマ字で入力..."
                className="w-full px-4 py-4 text-xl font-mono rounded-2xl outline-none bg-transparent"
                autoComplete="off"
              />
              {/* 入力プレビュー（正解文字数のみ表示） */}
              <div className="px-4 pb-2 font-mono text-sm">
                {currentPref.romaji.split("").map((ch, i) => (
                  <span key={i} className={i < input.length ? "text-green-500 font-bold" : "text-gray-300"}>
                    {i < input.length ? ch : "○"}
                  </span>
                ))}
              </div>
            </div>

            {/* パスボタン */}
            <button
              onClick={handlePass}
              className="w-full bg-orange-100 hover:bg-orange-200 border-2 border-orange-300 rounded-xl py-3 font-bold text-orange-700 transition"
            >
              ⏭ パス（+{PASS_PENALTY}秒）
            </button>

            {/* ヒント */}
            <HintPanel
              pref={currentPref}
              onHintUse={handleHint}
              usedLevels={usedHints}
            />
          </div>
        )}
      </div>
    </main>
  );
}
