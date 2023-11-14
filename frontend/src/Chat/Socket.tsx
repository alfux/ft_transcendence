import io from 'socket.io-client';

export const chat_socket = io('http://localhost:3001', {transports: ['websocket']});

export function chatSocketAuth(token:string) {
  chat_socket.emit('authentification', token)
}
