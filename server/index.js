const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.FRONTEND_URL || "http://localhost:3000", methods: ["GET", "POST"] },
});

const PREF_IDS = Array.from({ length: 47 }, (_, i) =>
  String(i + 1).padStart(2, "0")
);

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function generateCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

const rooms = {};

function getRemainingFor(room, playerId) {
  const claimed = new Set([
    ...Object.values(room.territory).flat(),
  ]);
  return PREF_IDS.filter(id => !claimed.has(id) && !room.passQueue[playerId]?.includes(id));
}

function pickNext(room, playerId) {
  // まずpassキューの先頭
  if (room.passQueue[playerId]?.length > 0) {
    return room.passQueue[playerId].shift();
  }
  // 未取得・未割当の中からランダム
  const taken = new Set(Object.values(room.territory).flat());
  const inProgress = new Set(Object.values(room.current));
  const pool = PREF_IDS.filter(id => !taken.has(id) && !inProgress.has(id));
  if (pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}

io.on("connection", (socket) => {
  console.log("接続:", socket.id);

  socket.on("create_room", () => {
    const code = generateCode();
    rooms[code] = {
      players: [socket.id],
      code,
      started: false,
      territory: { [socket.id]: [] },
      current: {},
      passQueue: { [socket.id]: [] },
      startTime: null,
      endTime: null,
    };
    socket.join(code);
    socket.emit("room_created", { code });
    console.log("ルーム作成:", code);
  });

  socket.on("join_room", ({ code }) => {
    const room = rooms[code];
    if (!room) { socket.emit("join_error", { message: "ルームが見つかりません" }); return; }
    if (room.players.length >= 2) { socket.emit("join_error", { message: "満員です" }); return; }

    room.players.push(socket.id);
    room.territory[socket.id] = [];
    room.passQueue[socket.id] = [];
    socket.join(code);
    socket.emit("join_success", { code });

    // ゲーム開始
    room.started = true;
    room.startTime = Date.now();
    room.endTime = room.startTime + 10 * 60 * 1000; // 10分

    room.players.forEach(pid => {
      room.current[pid] = pickNext(room, pid);
    });

    room.players.forEach(pid => {
      io.to(pid).emit("game_start", {
        current: room.current[pid],
        territory: room.territory,
        endTime: room.endTime,
        playerIndex: room.players.indexOf(pid),
      });
    });

    // タイムアップ
    room.timeoutId = setTimeout(() => {
      if (!rooms[code]) return;
      const p0 = room.players[0], p1 = room.players[1];
      const c0 = room.territory[p0]?.length ?? 0;
      const c1 = room.territory[p1]?.length ?? 0;
      const result = c0 === c1 ? "draw" : c0 > c1 ? p0 : p1;
      io.to(code).emit("time_up", { territory: room.territory, winner: result });
      delete rooms[code];
    }, 10 * 60 * 1000);

    console.log(`ルーム ${code} バトル開始`);
  });

  socket.on("answer_correct", ({ code }) => {
    const room = rooms[code];
    if (!room?.started) return;

    const prefId = room.current[socket.id];
    if (!prefId) return;

    // 陣地に追加
    room.territory[socket.id].push(prefId);
    room.current[socket.id] = null;

    // 全47制覇チェック
    const total = Object.values(room.territory).flat().length;
    if (total >= 47) {
      clearTimeout(room.timeoutId);
      const p0 = room.players[0], p1 = room.players[1];
      const c0 = room.territory[p0]?.length ?? 0;
      const c1 = room.territory[p1]?.length ?? 0;
      const result = c0 === c1 ? "draw" : c0 > c1 ? p0 : p1;
      io.to(code).emit("all_clear", { territory: room.territory, winner: result });
      delete rooms[code];
      return;
    }

    // 次の都道府県
    const next = pickNext(room, socket.id);
    room.current[socket.id] = next;

    room.players.forEach(pid => {
      io.to(pid).emit("game_update", {
        territory: room.territory,
        current: room.current,
      });
    });
  });

  socket.on("answer_pass", ({ code }) => {
    const room = rooms[code];
    if (!room?.started) return;

    const prefId = room.current[socket.id];
    if (!prefId) return;

    // passキューに入れる
    room.passQueue[socket.id].push(prefId);
    const next = pickNext(room, socket.id);
    room.current[socket.id] = next;

    io.to(socket.id).emit("game_update", {
      territory: room.territory,
      current: room.current,
    });
  });

  socket.on("disconnect", () => {
    for (const code in rooms) {
      const room = rooms[code];
      if (room.players.includes(socket.id)) {
        clearTimeout(room.timeoutId);
        io.to(code).emit("player_disconnected");
        delete rooms[code];
      }
    }
    console.log("切断:", socket.id);
  });
});

const PORT = process.env.PORT || 4001;
server.listen(PORT, () => console.log(`バトルサーバー起動: port ${PORT}`));
