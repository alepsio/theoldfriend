-- Migration: Aggiunta sistema barbiere-servizi e prenotazioni multiple
-- Esegui questo script sul database esistente

USE the_old_friend;

-- 1. Crea tabella associazione barbiere-servizi
CREATE TABLE IF NOT EXISTS barber_services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    barber_id INT NOT NULL,
    service_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (barber_id) REFERENCES barbers(id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
    UNIQUE KEY unique_barber_service (barber_id, service_id)
);

-- 2. Aggiungi campo booking_group_id alla tabella bookings
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS booking_group_id VARCHAR(50) NULL COMMENT 'ID per raggruppare prenotazioni multiple dello stesso cliente' AFTER notes,
ADD INDEX IF NOT EXISTS idx_booking_group (booking_group_id);

-- 3. Popola la tabella barber_services con tutti i barbieri che possono fare tutti i servizi
-- (puoi modificare questo comportamento dall'admin in seguito)
INSERT IGNORE INTO barber_services (barber_id, service_id)
SELECT b.id, s.id
FROM barbers b
CROSS JOIN services s
WHERE b.is_active = TRUE AND s.is_active = TRUE;

-- Verifica
SELECT 'Migration completata con successo!' AS status;
SELECT COUNT(*) AS total_associations FROM barber_services;