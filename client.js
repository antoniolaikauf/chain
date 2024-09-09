const net = require('net')
const client = new net.Socket()
// ip computer 
client.connect(3000, '192.168.1.7', () => {
    console.log('client connesso');
    client.write('collegamento')
})
// data ottenuti
client.on('data', (data) => {
    const text= data.toString('utf-8')
    console.log(text);
})
// errori
client.on('error', (err) => {
    console.error(err.message);
})
// chiusura server 
client.on('end', () => {
    console.log('connessione chiusa dal server');
})
// chiusura client forzata
process.on('SIGINT', () => {
    console.log('connessione chiusa');
    client.end(() => { // dato tempo a client di chiudere la connessione settimeout 
        setTimeout(() => {
            process.exit(0); 
        }, 100);
    });
})