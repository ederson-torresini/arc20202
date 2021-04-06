const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const PORT = process.env.PORT || 3000;
var jogadores = {
  primeiro: undefined,
  segundo: undefined,
};

// Disparar evento quando jogador entrar na partida
io.on("connection", function (socket) {
  if (jogadores.primeiro === undefined) {
    jogadores.primeiro = socket.id;
  } else if (jogadores.segundo === undefined) {
    jogadores.segundo = socket.id;
  }
  io.emit("jogadores", jogadores);
  console.log("+Lista de jogadores: %s", jogadores);

  // Sinalização de áudio: oferta
  socket.on("offer", (socketId, description) => {
    socket.to(socketId).emit("offer", socket.id, description);
  });

  // Sinalização de áudio: atendimento da oferta
  socket.on("answer", (socketId, description) => {
    socket.to(socketId).emit("answer", description);
  });

  // Sinalização de áudio: envio dos candidatos de caminho
  socket.on("candidate", (socketId, signal) => {
    socket.to(socketId).emit("candidate", signal);
  });

  // Disparar evento quando jogador sair da partida
  socket.on("disconnect", function () {
    if (jogadores.primeiro === socket.id) {
      jogadores.primeiro = undefined;
    }
    if (jogadores.segundo === socket.id) {
      jogadores.segundo = undefined;
    }
    io.emit("jogadores", jogadores);
    console.log("-Lista de jogadores: %s", jogadores);
  });

  socket.on("estadoDoJogador", function (estado) {
    socket.broadcast.emit("desenharOutroJogador", estado);
  });
});

// Dois tipos de cliente: com Phaser 3 e com Twine
app.use("/phaser3/", express.static("../cliente-phaser3"));
app.use("/twine/", express.static("../cliente-twine"));

// O cliente feito em Phaser 3 é o padrão
app.use("/", (req, res) => {
  res.redirect("/phaser3");
});

server.listen(PORT, () => console.log(`Server listening on port ${PORT}!`));
