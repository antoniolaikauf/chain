// nesuna instanza socket con il server perchè il node crea un collegamento socket con il client collegato 
const net = require('net') // modulo per rete peer to peer

let clients = []
const server = net.createServer((socket) => {
    
    const client = { 'IP': socket.remoteAddress, data: socket }
    const check = clients.some(element =>  element.IP === client.IP )
    if (check) socket.destroy()
    
    // data dal client
    socket.on('data', (data) => {
        data=data.toString('utf-8')
        clients.push(client)
        console.log(`client collegati : ${clients.length}`);
        clients.forEach((element,i) => {
            console.log(`client ${element.IP} connesso`);
        });
        socket.write(`Benvenuto ${socket.remoteAddress}`)
    })
    // client disconnessione
    socket.on('end', function () {    
        clients = clients.filter(element => element.IP != socket.remoteAddress)
        console.log(`client: ${socket.remoteAddress} scollegato\nclients collegati ${clients.length}`);
    });
    // errori 
    socket.on('error', (err) => {
        console.error(`Socket error: ${err.message}`);
    })
})
// porta 3000 indirizzi di ascolto tutti 0.0.0.0
server.listen(3000, '0.0.0.0', () => {
    console.log(`server dati: ${JSON.stringify(server.address())}`);
});

process.on('SIGINT', () => {
    console.log('server chiuso');
    clients.forEach((client,i) => { // chiudi connessione con client 
        client.data.destroy();
        clients.splice(i)
    });
    if (clients.length === 0) process.exit(0)
})