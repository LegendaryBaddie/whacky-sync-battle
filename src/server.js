const http = require('http');

const fs = require('fs');

const socketio = require('socket.io');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

const index = fs.readFileSync(`${__dirname}/../client/index.html`);

const onRequest = (request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/html' });
  response.write(index);
  response.end();
};

const app = http.createServer(onRequest).listen(port);

console.log(`Listening on 127.0.0.1: ${port}`);

const io = socketio(app);
let users = 0;
let clicks = 0;
let msg;
let alive = true;
const boxPos = {
  x: 0,
  y: 0,
};
const onJoined = (sock) => {
  const socket = sock;
  socket.join('room');
  msg = {
    text: 'Here lies a button',
    count: clicks,
    pos: boxPos,
  };
  alive = true;
  io.sockets.in('room').emit('restart', msg);
  socket.on('clicked', () => {
    clicks ++;
    console.log(`${clicks} clicked`);
    if (clicks === 1) {
      msg = 'Your clicking has awoken me from my slumber!';
      io.sockets.in('room').emit('msgUpdate', msg);
    } else if (clicks === (users * 10)) {
      msg = 'You will not succeed, everytime someone leaves or joins your damage gets nulled!';
      io.sockets.in('room').emit('msgUpdate', msg);
    } else if (clicks === (users * 50)) {
      msg = 'Your group is more commited than any before you, but you sill can\'t defeat me!';
      io.sockets.in('room').emit('msgUpdate', msg);
    } else if (clicks === (users * 100)) {
      msg = 'I\'M INVINCIBLE!!!!!!';
      io.sockets.in('room').emit('msgUpdate', msg);
    } else if (clicks === (users * 110)) {
      msg = 'I am become death.';
      io.sockets.in('room').emit('msgUpdate', msg);
      io.sockets.in('room').emit('killButton', msg);
      alive = false;
    }
    if (alive) {
      boxPos.x = Math.floor(Math.random() * 600);
      boxPos.y = Math.floor(Math.random() * 400);
      const data = {
        pos: boxPos,
        count: clicks,
      };
      io.sockets.in('room').emit('update', data);
    }
  });
};

io.sockets.on('connection', (socket) => {
  users ++;
  clicks = 0;
  onJoined(socket);
  socket.on('disconnect', () => {
    users --;
    clicks = 0;
    socket.leave('room');
  });
});

