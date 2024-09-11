const dgram = require('dgram');
const listen_server = dgram.createSocket('udp4');

const port = 41234;
const address = '255.255.255.255'; // Broadcast address

let partecipanti = [];

// Quando il server riceve un messaggio
listen_server.on('message', (msg, rinfo) => {
    // Converti il buffer in una stringa e poi in JSON
    let nuoviPartecipanti;
    try {
        nuoviPartecipanti = JSON.parse(msg.toString());
    } catch (err) {
        console.error('Error parsing message:', err.message);
        return;
    }
console.log(nuoviPartecipanti);

    // Aggiungi l'indirizzo del mittente se non è già presente
    if (!nuoviPartecipanti.includes(rinfo.address)) {
        nuoviPartecipanti.push(rinfo.address);
        partecipanti = nuoviPartecipanti;

        // Converti l'array in JSON e poi in buffer
        const updatedMessage = Buffer.from(JSON.stringify(partecipanti));
        
        // Invia il messaggio aggiornato a tutti
        listen_server.send(updatedMessage, port, address, (err) => {
            if (err) {
                console.error('Error sending message:', err.message);
            }
        });
    }
});

// Avvia il server e invia un messaggio di benvenuto
listen_server.bind(port, () => {
    listen_server.setBroadcast(true);
    console.log(`Server listening on ${listen_server.address().address}:${listen_server.address().port}`);

    // Invia un messaggio iniziale con la lista dei partecipanti
    const initialMessage = Buffer.from(JSON.stringify(partecipanti));
    listen_server.send(initialMessage, port, address, (err) => {
        if (err) {
            console.error('Error sending initial message:', err.message);
        }
    });
});
