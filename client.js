const net = require('net')
const client = new net.Socket()
client.connect(9000, "localhost", () => { console.log('connesso'); })