const net = require('net')
const client = new net.Socket()

client.connect(3000, '192.168.1.2', () => {
    console.log('connessione');
    client.write('sono client')
})

client.on('data', (data) => {
    console.log(data.toString('utf-8'));
})