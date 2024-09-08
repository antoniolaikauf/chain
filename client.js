const net = require('net')
const client = net.createConnection({port:9000}, () => {
    console.log('connessione con server');
    client.write('ciaaoaoaooao')

    client.on('data', (data) => {
        text = data.toString('utf-8')
        console.log(text);
        
    })
    client.on(('end'), () => {
        console.log('connesione chiusa');
        
    })
})
// client.connect(9000, "localhost", () => { console.log('connesso'); })

