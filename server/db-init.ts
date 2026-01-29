import { pool } from "./db";

export async function initializeDatabase() {
  console.log("Initializing database...");
  
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS slideshow_images (
        id SERIAL PRIMARY KEY,
        url TEXT NOT NULL,
        alt TEXT,
        display_order INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS exhibitions (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        year TEXT,
        location TEXT,
        description TEXT,
        display_order INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS exhibition_images (
        id SERIAL PRIMARY KEY,
        exhibition_id INTEGER NOT NULL REFERENCES exhibitions(id) ON DELETE CASCADE,
        url TEXT NOT NULL,
        alt TEXT,
        display_order INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS projects (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        year TEXT,
        description TEXT,
        display_order INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS project_images (
        id SERIAL PRIMARY KEY,
        project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        url TEXT NOT NULL,
        alt TEXT,
        display_order INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS site_settings (
        id SERIAL PRIMARY KEY,
        key TEXT NOT NULL UNIQUE,
        value TEXT
      );

      CREATE TABLE IF NOT EXISTS page_views (
        id SERIAL PRIMARY KEY,
        page TEXT NOT NULL,
        timestamp TIMESTAMP DEFAULT NOW(),
        session_id TEXT
      );

      CREATE TABLE IF NOT EXISTS analytics (
        id SERIAL PRIMARY KEY,
        date DATE NOT NULL UNIQUE,
        total_views INTEGER DEFAULT 0,
        unique_sessions INTEGER DEFAULT 0
      );
    `);

    console.log("Database tables created successfully");
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  }
}
