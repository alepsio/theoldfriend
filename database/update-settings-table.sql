-- Update settings table structure
USE the_old_friend;

-- Drop old settings table
DROP TABLE IF EXISTS settings;

-- Create new settings table with proper columns
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
);

-- Insert default settings
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
) VALUES (
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
);