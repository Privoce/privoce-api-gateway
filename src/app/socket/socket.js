const socketIo = require('socket.io');
const { whitelist } = require('../../config/cors');

const socketClients = [];

function socketStart(server) {
  const io = socketIo(server, {
    cors: {
      origin: whitelist,
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log('New client connected');

    // Store user on users array
    socket.on('storeClientInfo', (data) => {
      const clientInfo = {
        customId: data._id,
        nickname: data.nickname,
        clientId: socket.id,
      };

      socketClients.push(clientInfo);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected');

      // Remove user from array
      for (let i = 0; i < socketClients.length; i += 1) {
        const c = socketClients[i];

        if (c.clientId === socket.id) {
          socketClients.splice(i, 1);
          break;
        }
      }
    });
  });

  global.io = io;
  global.socketClients = socketClients;
}

module.exports = { socketStart, socketClients };
