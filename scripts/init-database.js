const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

async function initDatabase() {
  console.log('🚀 Inizializzazione database...\n');

  try {
    // Connessione senza database per crearlo
    console.log('🔌 Tentativo di connessione a MySQL...');
    console.log('   Host: 127.0.0.1');
    console.log('   User: root');
    console.log('   Port: 3306');
    
    const connection = await mysql.createConnection({
      host: '127.0.0.1',
      port: 3306,
      user: 'root',
      password: '',
      multipleStatements: true
    });

    console.log('✅ Connesso a MySQL');

    // Leggi lo schema SQL
    const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    console.log('📄 Esecuzione schema SQL...');
    
    // Esegui lo schema
    await connection.query(schema);

    console.log('✅ Database e tabelle create con successo');

    // Chiudi la connessione e riconnettiti al database
    await connection.end();

    // Connessione al database appena creato
    const dbConnection = await mysql.createConnection({
      host: '127.0.0.1',
      port: 3306,
      user: 'root',
      password: '',
      database: 'the_old_friend'
    });

    // Crea admin
    const username = 'admin';
    const password = 'admin123';
    const email = 'admin@theoldfriend.com';
    const hashedPassword = await bcrypt.hash(password, 10);

    await dbConnection.execute(
      'INSERT INTO admins (username, password, email) VALUES (?, ?, ?)',
      [username, hashedPassword, email]
    );

    console.log('\n✅ Admin creato con successo!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 CREDENZIALI ADMIN:');
    console.log('   Username: ' + username);
    console.log('   Password: ' + password);
    console.log('   Email: ' + email);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n⚠️  IMPORTANTE: Cambia la password dopo il primo login!\n');

    await dbConnection.end();

    console.log('✅ Inizializzazione completata!\n');
    console.log('🎉 Ora puoi avviare il server con: npm run dev\n');

  } catch (error) {
    console.error('❌ Errore durante l\'inizializzazione:', error.message);
    console.error('   Codice errore:', error.code);
    console.error('   Errno:', error.errno);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n⚠️  MySQL non è in esecuzione!');
      console.error('   Avvia MySQL e riprova.');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\n⚠️  Credenziali MySQL errate!');
      console.error('   Verifica username e password in questo script.');
    } else if (error.code === 'ENOTFOUND') {
      console.error('\n⚠️  Host non trovato!');
      console.error('   Verifica che MySQL sia in ascolto su localhost.');
    }
    
    process.exit(1);
  }
}

initDatabase();