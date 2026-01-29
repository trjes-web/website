import { pool } from "./db";

export async function initializeDatabase() {
  console.log("Initializing database...");
  
  try {
    // First, drop existing tables with wrong schema
    await pool.query(`
      DROP TABLE IF EXISTS exhibition_images CASCADE;
      DROP TABLE IF EXISTS project_images CASCADE;
      DROP TABLE IF EXISTS analytics CASCADE;
    `);

    // Create tables with correct schema
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS slideshow_images (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        image_url TEXT NOT NULL,
        alt_text TEXT DEFAULT '',
        display_order INTEGER NOT NULL DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS site_settings (
        key VARCHAR PRIMARY KEY,
        value TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS exhibitions (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        title TEXT NOT NULL,
        description TEXT DEFAULT '',
        images JSONB DEFAULT '[]',
        date TEXT DEFAULT '',
        location TEXT DEFAULT '',
        floor_plan_url TEXT DEFAULT '',
        display_order INTEGER NOT NULL DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS projects (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        title TEXT NOT NULL,
        description TEXT DEFAULT '',
        images JSONB DEFAULT '[]',
        date TEXT DEFAULT '',
        display_order INTEGER NOT NULL DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS page_views (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        page TEXT NOT NULL,
        visited_at TIMESTAMP NOT NULL DEFAULT NOW(),
        user_agent TEXT DEFAULT '',
        referrer TEXT DEFAULT ''
      );
    `);

    console.log("Database tables created successfully");
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  }
}
