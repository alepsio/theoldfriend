-- The Old Friend Barbershop Database Schema

CREATE DATABASE IF NOT EXISTS the_old_friend CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE the_old_friend;

-- Tabella Admin
CREATE TABLE IF NOT EXISTS admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabella Impostazioni Generali
CREATE TABLE IF NOT EXISTS settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabella Barbieri
CREATE TABLE IF NOT EXISTS barbers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    image_url VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    order_position INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabella Servizi
CREATE TABLE IF NOT EXISTS services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    duration INT NOT NULL COMMENT 'Durata in minuti',
    is_active BOOLEAN DEFAULT TRUE,
    order_position INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabella Associazione Barbiere-Servizi
CREATE TABLE IF NOT EXISTS barber_services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    barber_id INT NOT NULL,
    service_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (barber_id) REFERENCES barbers(id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
    UNIQUE KEY unique_barber_service (barber_id, service_id)
);

-- Tabella Orari di Lavoro
CREATE TABLE IF NOT EXISTS working_hours (
    id INT AUTO_INCREMENT PRIMARY KEY,
    barber_id INT,
    day_of_week TINYINT NOT NULL COMMENT '0=Domenica, 1=Lunedì, ..., 6=Sabato',
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (barber_id) REFERENCES barbers(id) ON DELETE CASCADE
);

-- Tabella Giorni di Chiusura/Ferie
CREATE TABLE IF NOT EXISTS closures (
    id INT AUTO_INCREMENT PRIMARY KEY,
    barber_id INT NULL COMMENT 'NULL = chiusura generale',
    closure_date DATE NOT NULL,
    reason VARCHAR(255),
    FOREIGN KEY (barber_id) REFERENCES barbers(id) ON DELETE CASCADE
);

-- Tabella Clienti
CREATE TABLE IF NOT EXISTS customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabella Prenotazioni
CREATE TABLE IF NOT EXISTS bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    barber_id INT NOT NULL,
    service_id INT NOT NULL,
    booking_date DATE NOT NULL,
    booking_time TIME NOT NULL,
    status ENUM('pending', 'confirmed', 'completed', 'cancelled') DEFAULT 'pending',
    notes TEXT,
    booking_group_id VARCHAR(50) NULL COMMENT 'ID per raggruppare prenotazioni multiple dello stesso cliente',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    FOREIGN KEY (barber_id) REFERENCES barbers(id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
    INDEX idx_booking_date (booking_date),
    INDEX idx_barber_date (barber_id, booking_date),
    INDEX idx_booking_group (booking_group_id)
);

-- Tabella Gallery
CREATE TABLE IF NOT EXISTS gallery (
    id INT AUTO_INCREMENT PRIMARY KEY,
    image_url VARCHAR(255) NOT NULL,
    title VARCHAR(100),
    description TEXT,
    order_position INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inserimento dati iniziali
INSERT INTO settings (setting_key, setting_value) VALUES
('shop_name', 'The Old Friend'),
('shop_address', 'Via Roma 123, 00100 Roma'),
('shop_phone', '+39 123 456 7890'),
('shop_email', 'info@theoldfriend.com'),
('shop_description', 'La tua barberia di fiducia dal 1950. Tradizione, stile e professionalità.'),
('shop_latitude', '41.9028'),
('shop_longitude', '12.4964'),
('booking_slot_duration', '30'),
('advance_booking_days', '30'),
('instagram_url', 'https://instagram.com/theoldfriend'),
('facebook_url', 'https://facebook.com/theoldfriend');

-- Admin di default
-- NOTA: Esegui lo script scripts/create-admin.js per creare l'admin con password corretta
-- Oppure inserisci manualmente un hash bcrypt qui

-- Barbieri di esempio
INSERT INTO barbers (name, description, image_url, order_position) VALUES
('Marco Rossi', 'Master Barber con 20 anni di esperienza', '/images/barbers/marco.jpg', 1),
('Luca Bianchi', 'Specialista in tagli moderni e classici', '/images/barbers/luca.jpg', 2);

-- Servizi di esempio
INSERT INTO services (name, description, price, duration, order_position) VALUES
('Taglio Classico', 'Taglio tradizionale con forbici e rasoio', 15.00, 30, 1),
('Taglio Moderno', 'Taglio contemporaneo con styling', 18.00, 40, 2),
('Barba', 'Rasatura e rifinitura barba', 12.00, 20, 3),
('Taglio + Barba', 'Servizio completo taglio e barba', 25.00, 50, 4),
('Taglio Bambino', 'Taglio per bambini fino a 12 anni', 10.00, 20, 5),
('Trattamento Deluxe', 'Taglio, barba e trattamenti speciali', 35.00, 60, 6);

-- Associazione Barbiere-Servizi di esempio
-- Marco Rossi può fare tutti i servizi
INSERT INTO barber_services (barber_id, service_id) VALUES
(1, 1), (1, 2), (1, 3), (1, 4), (1, 5), (1, 6);
-- Luca Bianchi può fare solo alcuni servizi
INSERT INTO barber_services (barber_id, service_id) VALUES
(2, 1), (2, 2), (2, 3), (2, 5);

-- Orari di lavoro di esempio (Lunedì-Sabato 9:00-19:00)
INSERT INTO working_hours (barber_id, day_of_week, start_time, end_time) VALUES
-- Marco Rossi
(1, 1, '09:00:00', '19:00:00'), -- Lunedì
(1, 2, '09:00:00', '19:00:00'), -- Martedì
(1, 3, '09:00:00', '19:00:00'), -- Mercoledì
(1, 4, '09:00:00', '19:00:00'), -- Giovedì
(1, 5, '09:00:00', '19:00:00'), -- Venerdì
(1, 6, '09:00:00', '13:00:00'), -- Sabato
-- Luca Bianchi
(2, 1, '09:00:00', '19:00:00'),
(2, 2, '09:00:00', '19:00:00'),
(2, 3, '09:00:00', '19:00:00'),
(2, 4, '09:00:00', '19:00:00'),
(2, 5, '09:00:00', '19:00:00'),
(2, 6, '09:00:00', '13:00:00');