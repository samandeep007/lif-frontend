import { io } from 'socket.io-client';
import { getItemAsync } from './secureStore';

let socket;

const initSocket = async () => {
  if (socket) return socket;

  const token = await getItemAsync('authToken');
  if (!token) {
    console.error('No auth token found for Socket.IO connection');
    return null;
  }

  socket = io('https://lif-backend-awv3.onrender.com', {
    auth: { token },
    transports: ['websocket'],
  });

  socket.on('connect', () => {
    console.log('Socket.IO connected');
  });

  socket.on('connect_error', error => {
    console.error('Socket.IO connection error:', error);
  });

  socket.on('disconnect', () => {
    console.log('Socket.IO disconnected');
  });

  return socket;
};

const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export { initSocket, disconnectSocket };
