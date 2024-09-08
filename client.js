const net = require('net')
const client = new net.Socket()

client.connect(3000, '0.0.0.0', () => {
    console.log('connessione');
    client.write('sono client')
})

client.on('data', (data) => {
    console.log(data.toString('utf-8'));
})