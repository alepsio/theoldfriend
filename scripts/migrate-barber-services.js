const mysql = require('mysql2/promise');

async function migrate() {
  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'the_old_friend',
  });

  try {
    console.log('🔄 Inizio migration...\n');

    // 1. Crea tabella barber_services
    console.log('📝 Creazione tabella barber_services...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS barber_services (
        id INT AUTO_INCREMENT PRIMARY KEY,
        barber_id INT NOT NULL,
        service_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (barber_id) REFERENCES barbers(id) ON DELETE CASCADE,
        FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
        UNIQUE KEY unique_barber_service (barber_id, service_id)
      )
    `);
    console.log('✅ Tabella barber_services creata\n');

    // 2. Aggiungi campo booking_group_id
    console.log('📝 Aggiunta campo booking_group_id...');
    try {
      await connection.execute(`
        ALTER TABLE bookings 
        ADD COLUMN booking_group_id VARCHAR(50) NULL COMMENT 'ID per raggruppare prenotazioni multiple dello stesso cliente' AFTER notes
      `);
      console.log('✅ Campo booking_group_id aggiunto\n');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('ℹ️  Campo booking_group_id già esistente\n');
      } else {
        throw error;
      }
    }

    // 3. Aggiungi indice
    console.log('📝 Aggiunta indice idx_booking_group...');
    try {
      await connection.execute(`
        ALTER TABLE bookings ADD INDEX idx_booking_group (booking_group_id)
      `);
      console.log('✅ Indice aggiunto\n');
    } catch (error) {
      if (error.code === 'ER_DUP_KEYNAME') {
        console.log('ℹ️  Indice già esistente\n');
      } else {
        throw error;
      }
    }

    // 4. Popola barber_services (tutti i barbieri possono fare tutti i servizi)
    console.log('📝 Popolamento tabella barber_services...');
    await connection.execute(`
      INSERT IGNORE INTO barber_services (barber_id, service_id)
      SELECT b.id, s.id
      FROM barbers b
      CROSS JOIN services s
      WHERE b.is_active = TRUE AND s.is_active = TRUE
    `);

    const [rows] = await connection.execute('SELECT COUNT(*) as count FROM barber_services');
    console.log(`✅ ${rows[0].count} associazioni barbiere-servizi create\n`);

    console.log('🎉 Migration completata con successo!');
  } catch (error) {
    console.error('❌ Errore durante la migration:', error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

migrate();