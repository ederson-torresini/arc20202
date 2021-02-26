const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const PORT = process.env.PORT || 3000;

// Disparar evento quando jogador entrar na partida
io.on("connection", function (socket) {
  socket.broadcast.emit("jogadorEntrou", socket.id);
  console.log("Jogador %s entrou na partida", socket.id);

  // Disparar evento quando jogador sair da partida
  socket.on("disconnect", function () {
    io.emit("jogadorSaiu", socket.id);
    console.log("Usuário %s saiu da partida", socket.id);
  });
});

app.use(express.static("../cliente"));
server.listen(PORT, () => console.log(`Server listening on port ${PORT}!`));
