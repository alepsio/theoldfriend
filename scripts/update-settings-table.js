const mysql = require('mysql2/promise');

async function updateSettingsTable() {
  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'the_old_friend',
  });

  try {
    console.log('🔄 Aggiornamento tabella settings...');

    // Drop old settings table
    await connection.query('DROP TABLE IF EXISTS settings');
    console.log('✅ Vecchia tabella settings eliminata');

    // Create new settings table
    await connection.query(`
      CREATE TABLE settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        shop_name VARCHAR(255) NOT NULL DEFAULT 'The Old Friend',
        shop_description TEXT,
        phone VARCHAR(50),
        email VARCHAR(100),
        address VARCHAR(255),
        city VARCHAR(100),
        postal_code VARCHAR(20),
        booking_advance_days INT DEFAULT 30,
        booking_slot_duration INT DEFAULT 30,
        max_bookings_per_slot INT DEFAULT 3,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Nuova tabella settings creata');

    // Insert default settings
    await connection.query(`
      INSERT INTO settings (
        shop_name, 
        shop_description, 
        phone, 
        email, 
        address, 
        city, 
        postal_code,
        booking_advance_days,
        booking_slot_duration,
        max_bookings_per_slot
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      'The Old Friend Barbershop',
      'La tua barberia di fiducia dal 1950. Tradizione, stile e professionalità.',
      '+39 123 456 7890',
      'info@theoldfriend.it',
      'Via Roma 123',
      'Milano',
      '20100',
      30,
      30,
      3
    ]);
    console.log('✅ Impostazioni predefinite inserite');

    console.log('\n✨ Tabella settings aggiornata con successo!');
  } catch (error) {
    console.error('❌ Errore durante l\'aggiornamento:', error);
  } finally {
    await connection.end();
  }
}

updateSettingsTable();