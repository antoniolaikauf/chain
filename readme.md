TENTATIVO BLOCKCHAIN

sto facendo questo tentativo per imparare la blockchain e non per crearne una reale (per ora)

## procedimento

1. eseguire file server.js per attivare il server

2. Eseguire il file client.js per condividere l'indirizzo IP della macchina sulla rete tramite il protocollo udp4. Quando si riceve un IP, ci si collega al server. Ogni computer si collegherà al proprio server; quando un'altra macchina esegue il file, invierà il proprio IP sulla rete, e chiunque sia in ascolto otterrà il suo IP per potersi collegare al suo server. Tuttavia, la nuova persona collegata non sarà connessa al server degli altri. Per evitare questo, viene inviato un messaggio sulla rete affinché l'ultima persona riceva anche gli IP a cui si è già connessi.

3. eseguire file blockchain (si cambierà il nome più avanti) per eseguire una transazione.
   La transazione viene verificata tramite:

   - **firma**
   - **hash**

   una volta controllata viene trasmessa agli altri nodi collegati tramite il protocollo udp4 e messa dentro al **mempool**

il mining è a scelta se un nodo lo vuole fare o no tramite la **variabile miner_set_up**

## account

l'address viene cretao tramite 128 bits entropia (bit randomici) e usa la curva **(curva secp256k1)** questi vengono messi nel **hash function sha256** per creare la private key. Una volta creata la private key questa viene controllata sulla curva e dopo viene generata la **public key** con la private key. Una volta che si ha la public key questa viene messa in due funzioni hash una **sha256** e l'altra **ripemd_160** e il idgest viene trasformato in **base58** (questo procedimento è lo stesso di bitcoin) e aggiunto una c davanti per riconoscere l'address della blockchain

l'account sarà composto da:

1. balance
2. address
3. nonce

## prossimi passi

creazione del blocco e della blockchain e trasmetterla agli altri nodi cosi che tutti siano sincronizzati
