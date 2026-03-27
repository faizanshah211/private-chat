const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

const PASSWORD = "541953";   // change if you want
let messages = [];
let nextUnknownId = 1;

app.use(express.static('.'));

io.on('connection', (socket) => {
  socket.on('join', (pw) => {
    if (pw !== PASSWORD) return socket.emit('joinFailed', 'Wrong password');
    const name = `Unknown ${nextUnknownId++}`;
    socket.emit('joined', { yourName: name, history: messages });
  });

  socket.on('chat message', (text) => {
    const msg = {
      id: Date.now() + '-' + Math.random().toString(36).substring(2,8),
      sender: `Unknown ${nextUnknownId-1}`,
      text: text
    };
    messages.push(msg);
    if (messages.length > 100) messages.shift();
    io.emit('chat message', msg);
  });

  socket.on('deleteMessage', (id) => {
    messages = messages.filter(m => m.id !== id);
    io.emit('messageDeleted', id);
  });
});

server.listen(process.env.PORT || 3000);