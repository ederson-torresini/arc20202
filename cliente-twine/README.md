# Cliente a base de Twine

Este cliente é uma modificação do [cliente feito com Phaser 3](../cliente-phaser3).

## Modificações no Twine

Durante a produção da história, deve-se adicionar o seguinte código no Javascript da história:

```js
var ice_servers = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};
var localConnection;
var remoteConnection;
var midias;
const audio = document.querySelector("audio");
var socket = io();

socket.on("jogadores", function (jogadores) {
  if (jogadores.primeiro === socket.id) {
    navigator.mediaDevices
      .getUserMedia({ video: false, audio: true })
      .then((stream) => {
        midias = stream;
      })
      .catch((error) => console.log(error));
  } else if (jogadores.segundo === socket.id) {
    navigator.mediaDevices
      .getUserMedia({ video: false, audio: true })
      .then((stream) => {
        midias = stream;
        localConnection = new RTCPeerConnection(ice_servers);
        midias
          .getTracks()
          .forEach((track) => localConnection.addTrack(track, midias));
        localConnection.onicecandidate = ({ candidate }) => {
          candidate && socket.emit("candidate", jogadores.primeiro, candidate);
        };
        console.log(midias);
        localConnection.ontrack = ({ streams: [midias] }) => {
          audio.srcObject = midias;
        };
        localConnection
          .createOffer()
          .then((offer) => localConnection.setLocalDescription(offer))
          .then(() => {
            socket.emit(
              "offer",
              jogadores.primeiro,
              localConnection.localDescription
            );
          });
      })
      .catch((error) => console.log(error));
  }
});

socket.on("offer", (socketId, description) => {
  remoteConnection = new RTCPeerConnection(ice_servers);
  midias
    .getTracks()
    .forEach((track) => remoteConnection.addTrack(track, midias));
  remoteConnection.onicecandidate = ({ candidate }) => {
    candidate && socket.emit("candidate", socketId, candidate);
  };
  remoteConnection.ontrack = ({ streams: [midias] }) => {
    audio.srcObject = midias;
  };
  remoteConnection
    .setRemoteDescription(description)
    .then(() => remoteConnection.createAnswer())
    .then((answer) => remoteConnection.setLocalDescription(answer))
    .then(() => {
      socket.emit("answer", socketId, remoteConnection.localDescription);
    });
});

socket.on("answer", (description) => {
  localConnection.setRemoteDescription(description);
});

socket.on("candidate", (candidate) => {
  const conn = localConnection || remoteConnection;
  conn.addIceCandidate(new RTCIceCandidate(candidate));
});
```

## Modificações após a exportação da história em formato HTML

É preciso modificar manualmente o arquivo HTML logo após a exportação pela ferramenta.
No código HTML, após o marcador (_tag_) `title`, adicionar:

```html
<meta name="author" content="Ederson Torresini" />
<meta name="mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black" />
<meta name="application-name" content="ARC/TIP 2020.2" />
<meta name="apple-mobile-web-app-title" content="ARC/TIP 2020.2" />
<meta name="theme-color" content="#000000" />
<meta name="msapplication-navbutton-color" content="#000000" />
<meta name="msapplication-starturl" content="./index.html" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<link rel="manifest" href="./manifest.json" />
<link rel="icon" sizes="128x128" href="./assets/logo-128.png" />
<link rel="apple-touch-icon" sizes="128x128" href="./assets/logo-128.png" />
<link rel="icon" sizes="192x192" href="./assets/logo-192.png" />
<link rel="apple-touch-icon" sizes="192x192" href="./assets/logo-192.png" />
<link rel="icon" sizes="256x256" href="./assets/logo-256.png" />
<link rel="apple-touch-icon" sizes="256x256" href="./assets/logo-256.png" />
<link rel="icon" sizes="384x384" href="./assets/logo-384.png" />
<link rel="apple-touch-icon" sizes="384x384" href="./assets/logo-384.png" />
<link rel="icon" sizes="512x512" href="./assets/logo-512.png" />
<link rel="apple-touch-icon" sizes="512x512" href="./assets/logo-512.png" />
<script type="text/javascript">
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .register("./sw.js")
      .then((reg) => console.info("Service worker registered: ", reg))
      .catch((err) =>
        console.error("Error registering service worker: ", err)
      );
  }
</script>
````

Lembrando, claro, de personalizar os marcadores `author`, `application-name`, `apple-mobile-web-app-title` e outros que desejar.

Além disso, é preciso adicionar o seguinte código após `<body>`:

```html
<script src="/socket.io/socket.io.js"></script>
<audio id="audio" autoplay></audio>
```

A primeira linha, como se percebe, carrega o código do [Socket.IO](https://socket.io), enquanto que a segunda cria um objeto de áudio para reproduzir a mídia remota.
