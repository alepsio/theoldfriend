const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

async function createAdmin() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '', // Inserisci la tua password MySQL
    database: 'the_old_friend',
  });

  const username = 'admin';
  const password = 'admin123';
  const email = 'admin@theoldfriend.com';

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    // Elimina admin esistente se presente
    await connection.execute('DELETE FROM admins WHERE username = ?', [username]);

    // Crea nuovo admin
    await connection.execute(
      'INSERT INTO admins (username, password, email) VALUES (?, ?, ?)',
      [username, hashedPassword, email]
    );

    console.log('✅ Admin creato con successo!');
    console.log('Username:', username);
    console.log('Password:', password);
    console.log('Email:', email);
    console.log('\n⚠️  IMPORTANTE: Cambia la password dopo il primo login!');
  } catch (error) {
    console.error('❌ Errore durante la creazione dell\'admin:', error);
  } finally {
    await connection.end();
  }
}

createAdmin();