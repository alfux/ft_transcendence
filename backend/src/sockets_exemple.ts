//import io from 'socket.io-client'
//
//const socket = io('http://localhost:3001', {transports: ['websocket']})
//
//function chatSocketAuth(token:string) {
//  socket.emit('authentification', token)
//}
//
//function send_sock_message() {
//  socket.emit('send_message', {a:1, b:2, c: { a: [] } })
//}
//
//function register_sock_message() {
//  socket.on('receive_message', (msg) => { console.log(msg) })
//}