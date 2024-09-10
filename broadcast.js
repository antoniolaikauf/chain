// UDP è un protocollo di rete che consente l'invio di pacchetti di dati
// tra host in una rete senza stabilire una connessione formale 
const dgram = require('dgram')
const listen_client = new dgram.createSocket('udp4')
const { Buffer } = require('buffer');

const message = Buffer.from('Some bytes');
const port = 41234
const address = '255.255.255.255'

listen_client.on('listening', () => {
    listen_client.setBroadcast(true)
    listen_client.send(message, port, address, (err) => {
        console.log('messaggio inviato');
    })
})

listen_client.on('error', (err) => {
    console.error(err.message);
})

listen_client.on('message', (msg, rinfo) => {
    console.log(`messaggio ${msg} da ${rinfo.address} porta ${rinfo.port}`);
})
listen_client.bind(port)
//192.168.0.255