-- Base de données MySQL pour JDC Auto - Véhicules Spider-VO
-- Créer la base de données (à exécuter dans phpMyAdmin Gandi)

CREATE DATABASE IF NOT EXISTS jdcauto_prod;
USE jdcauto_prod;

-- Table principale des véhicules
CREATE TABLE vehicles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    reference VARCHAR(50) NOT NULL UNIQUE,
    reference_externe VARCHAR(50),
    
    -- Informations générales
    marque VARCHAR(100) NOT NULL,
    modele VARCHAR(100) NOT NULL,
    version TEXT,
    titre TEXT,
    
    -- Caractéristiques
    annee INT,
    kilometrage INT,
    energie VARCHAR(50),
    typeboite VARCHAR(10), -- M=Manuelle, A=Automatique
    nbrvitesse INT,
    couleurexterieur VARCHAR(100),
    couleurinterieur VARCHAR(100),
    carrosserie VARCHAR(100),
    
    -- Prix
    prix_vente DECIMAL(10,2),
    prix_neuf DECIMAL(10,2),
    prix_marchand DECIMAL(10,2),
    
    -- Technique
    puissance_fiscale INT,
    puissancedyn INT,
    puissancekw INT,
    cylindree INT,
    emissions_co2 INT,
    conso_moyenne DECIMAL(4,2),
    nbrplace INT,
    nbrporte INT,
    
    -- Statut et disponibilité
    etat ENUM('Disponible', 'Réservé', 'Vendu', 'En arrivage', 'Sorti') DEFAULT 'Disponible',
    disponibilite VARCHAR(100),
    
    -- Descriptions et SEO
    description TEXT,
    finition VARCHAR(200),
    
    -- Dates
    date_mec DATE,
    date_creation DATETIME,
    date_modif DATETIME,
    
    -- Métadonnées
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_etat (etat),
    INDEX idx_marque (marque),
    INDEX idx_prix (prix_vente),
    INDEX idx_annee (annee),
    INDEX idx_updated (updated_at)
);

-- Table des photos véhicules
CREATE TABLE vehicle_photos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vehicle_id INT NOT NULL,
    photo_url TEXT NOT NULL,
    photo_order INT DEFAULT 0,
    
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
    INDEX idx_vehicle (vehicle_id)
);

-- Table des équipements
CREATE TABLE vehicle_equipements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vehicle_id INT NOT NULL,
    equipement_nom TEXT NOT NULL,
    montant DECIMAL(8,2) DEFAULT 0.00,
    
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
    INDEX idx_vehicle (vehicle_id)
);

-- Table des options
CREATE TABLE vehicle_options (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vehicle_id INT NOT NULL,
    option_nom TEXT NOT NULL,
    montant DECIMAL(8,2) DEFAULT 0.00,
    
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
    INDEX idx_vehicle (vehicle_id)
);

-- Table de logs de synchronisation
CREATE TABLE sync_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sync_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    vehicles_processed INT DEFAULT 0,
    vehicles_added INT DEFAULT 0,
    vehicles_updated INT DEFAULT 0,
    vehicles_removed INT DEFAULT 0,
    status ENUM('SUCCESS', 'ERROR', 'RUNNING') DEFAULT 'RUNNING',
    error_message TEXT,
    execution_time DECIMAL(8,3)
);

-- Vues pour requêtes optimisées
CREATE VIEW vehicles_disponibles AS
SELECT 
    v.*,
    GROUP_CONCAT(vp.photo_url ORDER BY vp.photo_order SEPARATOR '|') as photos_urls,
    COUNT(vp.id) as photos_count
FROM vehicles v
LEFT JOIN vehicle_photos vp ON v.id = vp.vehicle_id
WHERE v.etat = 'Disponible'
GROUP BY v.id;

-- Index full-text pour recherche
ALTER TABLE vehicles ADD FULLTEXT(marque, modele, version, description);
