TENTATIVO BLOCKCHAIN

## procedimento

1. eseguire file server.js per attivare il server

2. Eseguire il file client.js per condividere l'indirizzo IP della macchina sulla rete tramite il protocollo udp4. Quando si riceve un IP, ci si collega al server. Ogni computer si collegherà al proprio server; quando un'altra macchina esegue il file, invierà il proprio IP sulla rete, e chiunque sia in ascolto otterrà il suo IP per potersi collegare al suo server. Tuttavia, la nuova persona collegata non sarà connessa al server degli altri. Per evitare questo, viene inviato un messaggio sulla rete affinché l'ultima persona riceva anche gli IP a cui si è già connessi.

3. eseguire file blockchain (si cambierà il nome più avanti) per eseguire una transazione 
