const net = require('net') // modulo per rete peer to peer 
const Socket = new net.Socket()

let clients = []
const server = net.createServer((socket) => {
    
    clients.push({ 'IP': socket.remoteAddress, data: socket })
    socket.on('data', (data) => {
        let text =data.toString('utf-8')
        console.log(text);
        console.log(clients.length);
        
        clients.forEach((element,i) => {
            console.log(element.IP);
        });
        socket.write('benvenuto')
    })
    socket.on('end', function () {
        console.log('client disconnesso: ', socket.remoteAddress);
        clients = clients.filter((element) => element.IP != socket.remoteAddress)
        console.log(clients);
        
    });
    socket.on('error', (err) => {
        console.error(`Socket error: ${err.message}`);
    })
})

server.listen(3000,'0.0.0.0', () => {
    console.log('server attivo'); 
});