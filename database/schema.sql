-- Database schema for identity_reflection

-- Users table (id matches user_id from handshake)
CREATE TABLE IF NOT EXISTS users (
    id BIGINT PRIMARY KEY,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Constellations table
CREATE TABLE IF NOT EXISTS constellations (
    id UUID PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Stars table
CREATE TABLE IF NOT EXISTS stars (
    id SERIAL PRIMARY KEY,
    star_index INT NOT NULL,
    constellation_id UUID NOT NULL REFERENCES constellations(id) ON DELETE CASCADE,
    x FLOAT NOT NULL,
    y FLOAT NOT NULL,
    label TEXT NOT NULL,
    UNIQUE(constellation_id, star_index)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_constellations_user_id ON constellations(user_id);
CREATE INDEX IF NOT EXISTS idx_stars_constellation_id ON stars(constellation_id);
