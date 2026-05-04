"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { PREFECTURE_MAP } from "@/lib/prefectures";
import { getSocket } from "@/lib/socket";
import HintPanel from "@/components/HintPanel";

const JapanMap = dynamic(() => import("@/components/JapanMap"), { ssr: false });

const PASS_PENALTY = 15;
const HINT_PENALTY = { 1: 5, 2: 10, 3: 20 } as const;
const PLAYER_COLORS = ["#3b82f6", "#ef4444"]; // 自分=青, 相手=赤

export default function BattlePage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [phase, setPhase] = useState<"lobby" | "game" | "end">("lobby");
  const [roomCode, setRoomCode] = useState("");
  const [inputCode, setInputCode] = useState("");
  const [joinError, setJoinError] = useState("");
  const [playerIndex, setPlayerIndex] = useState(0); // 0=先攻(青) 1=後攻(赤)

  const [currentId, setCurrentId] = useState<string | null>(null);
  const [territory, setTerritory] = useState<Record<string, string[]>>({});
  const [endTime, setEndTime] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState(600);

  const [input, setInput] = useState("");
  const [missFlash, setMissFlash] = useState(false);
  const [penaltyFlash, setPenaltyFlash] = useState("");
  const [usedHints, setUsedHints] = useState<Set<number>>(new Set());

  const roomCodeRef = useRef("");
  const playerIdsRef = useRef<string[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const myColor = PLAYER_COLORS[playerIndex];
  const opColor = PLAYER_COLORS[1 - playerIndex];

  // カラーマップ構築
  const colorMap: Record<string, string> = {};
  const socket = getSocket();
  Object.entries(territory).forEach(([pid, ids]) => {
    const isMe = pid === socket.id;
    ids.forEach(id => { colorMap[id] = isMe ? myColor : opColor; });
  });
  if (currentId && !colorMap[currentId]) colorMap[currentId] = "#fde047";

  const showPenalty = (text: string) => {
    setPenaltyFlash(text);
    setTimeout(() => setPenaltyFlash(""), 1200);
  };

  useEffect(() => {
    const sock = getSocket();

    sock.on("room_created", ({ code }: { code: string }) => {
      setRoomCode(code);
      roomCodeRef.current = code;
    });

    sock.on("join_error", ({ message }: { message: string }) => {
      setJoinError(message);
    });

    sock.on("game_start", ({ current, territory: t, endTime: et, playerIndex: pi }: {
      current: string; territory: Record<string, string[]>; endTime: number; playerIndex: number;
    }) => {
      setCurrentId(current);
      setTerritory(t);
      setEndTime(et);
      setPlayerIndex(pi);
      setPhase("game");
      setTimeLeft(Math.round((et - Date.now()) / 1000));
      setTimeout(() => inputRef.current?.focus(), 100);
    });

    sock.on("game_update", ({ territory: t, current }: {
      territory: Record<string, string[]>; current: Record<string, string>;
    }) => {
      setTerritory(t);
      setCurrentId((sock.id ? current[sock.id] : null) ?? null);
      setInput("");
      setUsedHints(new Set());
      setTimeout(() => inputRef.current?.focus(), 50);
    });

    sock.on("time_up", ({ territory: t, winner }: { territory: Record<string, string[]>; winner: string }) => {
      clearInterval(timerRef.current!);
      setTerritory(t);
      sessionStorage.setItem("battleResult", JSON.stringify({
        territory: t, winner, myId: sock.id, playerIndex,
      }));
      router.push("/result?mode=battle");
    });

    sock.on("all_clear", ({ territory: t, winner }: { territory: Record<string, string[]>; winner: string }) => {
      clearInterval(timerRef.current!);
      sessionStorage.setItem("battleResult", JSON.stringify({
        territory: t, winner, myId: sock.id, playerIndex,
      }));
      router.push("/result?mode=battle");
    });

    sock.on("player_disconnected", () => {
      alert("相手が切断しました");
      router.push("/");
    });

    return () => {
      sock.off("room_created"); sock.off("join_error"); sock.off("game_start");
      sock.off("game_update"); sock.off("time_up"); sock.off("all_clear");
      sock.off("player_disconnected");
    };
  }, [router, playerIndex]);

  // タイマー
  useEffect(() => {
    if (phase !== "game") return;
    timerRef.current = setInterval(() => {
      setTimeLeft(Math.max(0, Math.round((endTime - Date.now()) / 1000)));
    }, 500);
    return () => clearInterval(timerRef.current!);
  }, [phase, endTime]);

  const createRoom = () => getSocket().emit("create_room");
  const joinRoom = () => {
    if (!inputCode.trim()) return;
    getSocket().emit("join_room", { code: inputCode.trim().toUpperCase() });
    roomCodeRef.current = inputCode.trim().toUpperCase();
  };

  const normalizeRomaji = (s: string) =>
    s.toLowerCase().replace(/\s/g, "")
      .replace(/si/g, "shi")
      .replace(/ti/g, "chi")
      .replace(/tu/g, "tsu")
      .replace(/nn/g, "n")
      .replace(/oo/g, "o")
      .replace(/ou/g, "o");

  const isValidPrefix = (input: string, target: string): boolean => {
    const normalized = normalizeRomaji(input);
    if (target.startsWith(normalized)) return true;
    if (input.length === 0) return false;
    const last = input[input.length - 1];
    const stemNorm = normalizeRomaji(input.slice(0, -1));
    if (!target.startsWith(stemNorm)) return false;
    const nextChar = target[stemNorm.length];
    const pending: Record<string, string[]> = {
      t: ["c", "t"],
      s: ["s"],
      n: ["n"],
      o: ["o"],
    };
    return (pending[last] ?? []).includes(nextChar);
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!currentId) return;
    const val = normalizeRomaji(e.target.value);
    setInput(val);
    const pref = PREFECTURE_MAP[currentId];
    if (!pref) return;
    if (val === pref.romaji) {
      getSocket().emit("answer_correct", { code: roomCodeRef.current });
    } else if (!isValidPrefix(e.target.value.toLowerCase().replace(/\s/g, ""), pref.romaji)) {
      setMissFlash(true);
      setTimeout(() => setMissFlash(false), 300);
      setTimeout(() => setInput(""), 50);
    }
  };

  const handlePass = () => {
    if (!currentId) return;
    getSocket().emit("answer_pass", { code: roomCodeRef.current });
    showPenalty(`⏭ パス +${PASS_PENALTY}秒`);
    setInput(""); setUsedHints(new Set());
  };

  const handleHint = (lv: 1 | 2 | 3) => {
    setUsedHints(prev => new Set([...prev, lv]));
    showPenalty(`💡 ヒント Lv${lv} +${HINT_PENALTY[lv]}秒`);
  };

  const currentPref = currentId ? PREFECTURE_MAP[currentId] : null;
  const myCount = Object.entries(territory).find(([pid]) => pid === socket.id)?.[1].length ?? 0;
  const opCount = Object.values(territory).reduce((s, v, i) => {
    const pid = Object.keys(territory)[i];
    return pid !== socket.id ? s + v.length : s;
  }, 0);
  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;

  // ロビー画面
  if (phase === "lobby") {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-rose-400 to-sky-100 p-6">
        <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-sm space-y-6">
          <div className="text-center">
            <div className="text-4xl mb-2">⚔️</div>
            <h2 className="text-2xl font-black text-gray-800">2人バトル</h2>
          </div>

          {/* ルーム作成 */}
          <div>
            <button
              onClick={createRoom}
              className="w-full bg-rose-500 hover:bg-rose-600 text-white font-black text-lg py-4 rounded-xl transition"
            >
              ルームを作る
            </button>
            {roomCode && (
              <div className="mt-3 text-center bg-rose-50 rounded-xl p-3">
                <div className="text-xs text-gray-500 mb-1">フレンドコードを相手に伝えよう</div>
                <div className="text-3xl font-black text-rose-600 tracking-widest">{roomCode}</div>
                <div className="text-xs text-gray-400 mt-1">相手の参加を待っています...</div>
              </div>
            )}
          </div>

          <div className="border-t border-gray-100" />

          {/* ルーム参加 */}
          <div className="space-y-2">
            <input
              type="text"
              value={inputCode}
              onChange={e => setInputCode(e.target.value.toUpperCase())}
              placeholder="フレンドコードを入力"
              maxLength={6}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-xl font-mono text-center tracking-widest focus:border-sky-400 outline-none"
            />
            <button
              onClick={joinRoom}
              className="w-full bg-sky-500 hover:bg-sky-600 text-white font-black text-lg py-4 rounded-xl transition"
            >
              参加する
            </button>
            {joinError && <p className="text-red-500 text-sm text-center">{joinError}</p>}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className={`min-h-screen flex flex-col lg:flex-row ${missFlash ? "bg-red-50" : "bg-sky-50"} transition-colors duration-150`}>
      {penaltyFlash && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-red-500 text-white font-black text-lg px-6 py-3 rounded-2xl shadow-xl animate-bounce">
          {penaltyFlash}
        </div>
      )}

      {/* 地図 */}
      <div className="flex-1 p-4 min-h-[50vh]">
        <div className="text-xs text-center mb-1 flex justify-center gap-4">
          <span style={{ color: myColor }}>■ あなた（{myCount}県）</span>
          <span style={{ color: opColor }}>■ 相手（{opCount}県）</span>
        </div>
        <JapanMap colorMap={colorMap} targetId={currentId} />
      </div>

      {/* 操作パネル */}
      <div className="w-full lg:w-80 flex flex-col gap-4 p-4 bg-white shadow-xl">
        <div className={`rounded-2xl p-4 text-center ${timeLeft <= 60 ? "bg-red-100" : "bg-sky-100"}`}>
          <div className="text-xs font-bold text-gray-500 mb-1">のこり時間</div>
          <div className={`text-5xl font-black tabular-nums ${timeLeft <= 60 ? "text-red-600 animate-pulse" : "text-sky-700"}`}>
            {mins}:{secs.toString().padStart(2, "0")}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-xl p-3 text-center" style={{ background: myColor + "22", border: `2px solid ${myColor}` }}>
            <div className="text-2xl font-black" style={{ color: myColor }}>{myCount}</div>
            <div className="text-xs text-gray-500">あなた</div>
          </div>
          <div className="rounded-xl p-3 text-center" style={{ background: opColor + "22", border: `2px solid ${opColor}` }}>
            <div className="text-2xl font-black" style={{ color: opColor }}>{opCount}</div>
            <div className="text-xs text-gray-500">相手</div>
          </div>
        </div>

        {currentPref && (
          <div className="flex-1 flex flex-col gap-3">
            <div className="bg-yellow-50 border-2 border-yellow-300 rounded-2xl p-4 text-center">
              <div className="text-xs text-gray-400 mb-1">この県をタイピング！</div>
              <div className="text-3xl font-black text-gray-800">{currentPref.name}</div>
            </div>

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
              <div className="px-4 pb-2 font-mono text-sm">
                {currentPref.romaji.split("").map((ch, i) => (
                  <span key={i} className={i < input.length ? "text-green-500 font-bold" : "text-gray-300"}>
                    {ch}
                  </span>
                ))}
              </div>
            </div>

            <button
              onClick={handlePass}
              className="w-full bg-orange-100 hover:bg-orange-200 border-2 border-orange-300 rounded-xl py-3 font-bold text-orange-700 transition"
            >
              ⏭ パス（+{PASS_PENALTY}秒）
            </button>

            <HintPanel pref={currentPref} onHintUse={handleHint} usedLevels={usedHints} />
          </div>
        )}
      </div>
    </main>
  );
}
