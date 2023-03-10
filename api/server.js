const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");

const checkEnvVars = require("./beforeRun/checkEnvVars");
const logger = require("./debug/logger");
//const rootRouter = require("./routes");

checkEnvVars();
const NODE_ENV = process.env.NODE_ENV;
const PORT = process.env.PUBLIC_CHAT_API_PORT;
const SOCKET_IO_PATH = process.env.PUBLIC_CHAT_SOCKET_IO_PATH;

const app = express();
const httpServer = http.Server(app);
const ioServer = new socketIo.Server(httpServer, {
  ...(NODE_ENV === "development" && {
    cors: { origin: "http://localhost:3000" },
  }),
  path: SOCKET_IO_PATH,
});

// app.use(cors());

app.use(express.json({ limit: "10mb" }));
/*
app.use((req, res, next) => {
  logger.debug(`got request: ${req.method} ${req.url}`);
  next();
});
*/

//app.use("/", rootRouter);

const allMessages = [];

ioServer.on("connection", (socket) => {
  logger.info("a user connected");

  ioServer.of("");

  socket.on("chat message", (message) => {
    logger.info("chat message received:", message);
    allMessages.push(message.content);
    logger.info("messages:", allMessages);
    ioServer.emit("chat message", message);
  });

  socket.on("disconnect", () => {
    logger.info("a user disconnected");
  });
});

httpServer.listen(PORT, () => logger.info(`server started on port: ${PORT}`));

module.exports = httpServer;
