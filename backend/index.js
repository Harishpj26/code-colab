require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const axios = require("axios");
const ACTIONS = require("./Actions");

const app = express();
const server = http.createServer(app);

// Check if JDoodle credentials are loaded
console.log("JDoodle Client ID:", process.env.JDOODLE_CLIENTID);
console.log("JDoodle Client Secret:", process.env.JDOODLE_CLIENTSECRET);

// Language Configuration for JDoodle
const languageConfig = {
  python3: { versionIndex: "3" },
  java: { versionIndex: "3" },
  cpp14: { versionIndex: "4" },  // C++14
  cpp17: { versionIndex: "5" },  // C++17
  c: { versionIndex: "4" },
};

// Language Configuration for Judge0
const judge0Languages = {
  python3: 71,
  java: 62,
  cpp: 54,  // C++17
  cpp14: 52,
  cpp17: 54,
  c: 50,
};

// Enable CORS & JSON Parsing
app.use(cors());
app.use(express.json());

// Setup WebSocket Server
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "*", // Allow env var or allow all
    methods: ["GET", "POST"],
  },
});
app.get("/", (req, res) => {
  res.send("Server is running!");
});

// Manage Users in Rooms
const userSocketMap = {};
const roomMemberCounters = {}; // Track the next member ID for each room

const getAllConnectedClients = (roomId) => {
  return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map(
    (socketId) => {
      const userData = userSocketMap[socketId] || {};
      return {
        socketId,
        username: userData.username,
        memberId: userData.memberId, // Include memberId in client list
      };
    }
  );
};

// WebSocket Events
io.on("connection", (socket) => {
  socket.on(ACTIONS.JOIN, ({ roomId, username }) => {
    // Initialize room counter if it doesn't exist
    if (!roomMemberCounters[roomId]) {
      roomMemberCounters[roomId] = 1;
    }

    // Assign member ID
    const memberId = roomMemberCounters[roomId];

    // Update counter for next user (even if this user leaves, the next one gets a new number)
    roomMemberCounters[roomId]++;

    userSocketMap[socket.id] = { username, memberId };
    socket.join(roomId);
    const clients = getAllConnectedClients(roomId);
    clients.forEach(({ socketId }) => {
      io.to(socketId).emit(ACTIONS.JOINED, {
        clients,
        username,
        socketId: socket.id,
      });
    });
  });

  socket.on(ACTIONS.CODE_CHANGE, ({ roomId, code }) => {
    socket.in(roomId).emit(ACTIONS.CODE_CHANGE, { code });
  });

  socket.on(ACTIONS.SYNC_CODE, ({ socketId, code }) => {
    io.to(socketId).emit(ACTIONS.CODE_CHANGE, { code });
  });

  // Chat message handler - broadcast to ALL users in room
  socket.on(ACTIONS.CHAT_MESSAGE, ({ roomId, username, message, timestamp }) => {
    // Broadcast to ALL users in the room (including sender)
    io.to(roomId).emit(ACTIONS.CHAT_MESSAGE, { username, message, timestamp });
  });

  // Typing indicators
  socket.on(ACTIONS.TYPING_START, ({ roomId, username }) => {
    socket.in(roomId).emit(ACTIONS.TYPING_START, { username });
  });

  socket.on(ACTIONS.TYPING_STOP, ({ roomId, username }) => {
    socket.in(roomId).emit(ACTIONS.TYPING_STOP, { username });
  });

  // Cursor tracking
  socket.on(ACTIONS.CURSOR_MOVE, ({ roomId, position, username }) => {
    socket.in(roomId).emit(ACTIONS.CURSOR_MOVE, { position, username, socketId: socket.id });
  });

  // User presence
  socket.on(ACTIONS.USER_IDLE, ({ roomId }) => {
    socket.in(roomId).emit(ACTIONS.USER_IDLE, { socketId: socket.id });
  });

  socket.on(ACTIONS.USER_ACTIVE, ({ roomId }) => {
    socket.in(roomId).emit(ACTIONS.USER_ACTIVE, { socketId: socket.id });
  });

  // Sync Code Output
  socket.on(ACTIONS.SYNC_OUTPUT, ({ roomId, output }) => {
    io.to(roomId).emit(ACTIONS.SYNC_OUTPUT, { output });
  });

  // Handle disconnection
  socket.on("disconnecting", () => {
    const rooms = [...socket.rooms];
    rooms.forEach((roomId) => {
      socket.in(roomId).emit(ACTIONS.DISCONNECTED, {
        socketId: socket.id,
        username: userSocketMap[socket.id]?.username,
      });
    });
    delete userSocketMap[socket.id];
  });
});

// Compilation Endpoint (JDoodle & Judge0)
app.post("/compile", async (req, res) => {
  const { code, language, method } = req.body;
  console.log("Received compilation request:", { code, language, method });

  try {
    let response;

    // JDoodle Compiler
    if (method === "jdoodle") {
      if (!languageConfig[language]) {
        return res.status(400).json({ error: "Invalid language for JDoodle" });
      }

      console.log("JDoodle request data:", {
        script: code,
        language: language,
        versionIndex: languageConfig[language].versionIndex,
        clientId: process.env.JDOODLE_CLIENTID,
        clientSecret: process.env.JDOODLE_CLIENTSECRET,
      });

      response = await axios.post("https://api.jdoodle.com/v1/execute", {
        script: code,
        language: language,
        versionIndex: languageConfig[language].versionIndex,
        clientId: process.env.JDOODLE_CLIENTID,
        clientSecret: process.env.JDOODLE_CLIENTSECRET,
      });

      if (response.data.error) {
        return res.status(500).json({ error: response.data.error });
      }

      console.log("JDoodle response:", response.data);
      res.json(response.data);
    }

    // Judge0 Compiler
    else if (method === "judge0") {
      if (!judge0Languages[language]) {
        return res.status(400).json({ error: "Invalid language for Judge0" });
      }

      console.log("Sending request to Judge0");

      const judge0Response = await axios.post(
        "https://ce.judge0.com/submissions/?base64_encoded=false&wait=true",
        {
          source_code: code,
          language_id: judge0Languages[language],
          stdin: "",
        }
      );

      console.log("Judge0 response:", judge0Response.data);

      res.json({
        output: judge0Response.data.stdout || judge0Response.data.stderr,
        status: judge0Response.data.status.description,
      });
    }

    else {
      res.status(400).json({ error: "Invalid compilation method" });
    }
  } catch (error) {
    console.error("Compilation error:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to compile code" });
  }
});

// Start the Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));