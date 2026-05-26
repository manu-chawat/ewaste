-- ============================================
-- E-WASTE COLLECTION SYSTEM - DATABASE SCHEMA
-- MySQL Workbench mai yeh file run karein
-- ============================================

-- Step 1: Database banao
CREATE DATABASE IF NOT EXISTS ewaste;
USE ewaste;

-- ============================================
-- TABLE 1: users (Login ke liye)
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLE 2: pickup_requests (Sabhi 3 forms ke liye)
-- Commercial, Residential, Collection Event
-- ============================================
CREATE TABLE IF NOT EXISTS pickup_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL,
    address TEXT NOT NULL,
    item_type VARCHAR(200) NOT NULL,
    service_type ENUM('commercial', 'residential', 'collection_event') NOT NULL,
    status ENUM('pending', 'confirmed', 'completed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLE 3: contact_messages (Contact Page form)
-- ============================================
CREATE TABLE IF NOT EXISTS contact_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL,
    phone VARCHAR(20),
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLE 4: collection_events (Events listing)
-- ============================================
CREATE TABLE IF NOT EXISTS collection_events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_name VARCHAR(200) NOT NULL,
    event_date DATE NOT NULL,
    location VARCHAR(300) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- SAMPLE DATA INSERT
-- ============================================

-- Default Admin User (password: Admin@123)
-- Note: Server start karne par auto hash ho jayega
INSERT INTO users (name, email, password) VALUES 
('Admin', 'admin@ewaste.com', '$2b$10$hashedpassword_placeholder');

-- Sample Events
INSERT INTO collection_events (event_name, event_date, location, description) VALUES
('Community Recycling Drive', '2026-06-15', 'City Community Hall', 'Bring your old laptops, mobile phones, batteries for safe recycling.'),
('School Awareness Program', '2026-06-25', 'Green Valley School', 'Learn about e-waste management and eco-friendly recycling activities.'),
('Corporate E-Waste Collection', '2026-07-10', 'Business Tech Park', 'Companies can safely dispose of outdated office electronics.');

-- ============================================
-- VERIFY: Tables check karo
-- ============================================
SHOW TABLES;
SELECT 'Database Setup Complete!' AS Status;
