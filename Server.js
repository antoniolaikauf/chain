const net = require('net') // modulo per rete peer to peer 
const Socket = new net.Socket()

// TODO vedere se un un gia dentro al clients cerca di entrare anche se è gia connesso
let clients = []
const server = net.createServer((socket) => {
    // data dal client
    socket.on('data', (data) => {
        data=data.toString('utf-8')
        clients.push({ 'IP': socket.remoteAddress, data: socket })
        console.log(`client collegati : ${clients.length}`);
        clients.forEach((element,i) => {
            console.log(`client ${element.IP} connesso`);
        });
        socket.write(`Benvenuto ${socket.remoteAddress}`)
    })
    // client disconnessione
    socket.on('end', function () {
        console.log('client disconnesso: ', socket.remoteAddress);
        clients = clients.filter((element) => element.IP != socket.remoteAddress)
    });
    // errori
    socket.on('error', (err) => {
        console.error(`Socket error: ${err.message}`);
    })
})
// porta 3000 indirizzi di ascolto tutti 0.0.0.0
server.listen(3000, '0.0.0.0', () => {
    console.log('server attivo'); 
});


process.on('SIGINT', () => {
    clients.forEach((element, i) => {
       console.log(element);
       
        // element.destroy()
    });
    server.on('close', () => {
        console.log('Server chiuso');
    })
})