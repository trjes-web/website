import { pool } from "./db";

export async function initializeDatabase() {
  console.log("Initializing database...");
  
  try {
    // Drop ALL existing tables to ensure clean state
    await pool.query(`
      DROP TABLE IF EXISTS exhibition_images CASCADE;
      DROP TABLE IF EXISTS project_images CASCADE;
      DROP TABLE IF EXISTS analytics CASCADE;
      DROP TABLE IF EXISTS page_views CASCADE;
      DROP TABLE IF EXISTS slideshow_images CASCADE;
      DROP TABLE IF EXISTS site_settings CASCADE;
      DROP TABLE IF EXISTS exhibitions CASCADE;
      DROP TABLE IF EXISTS projects CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
    `);

    console.log("Dropped existing tables");

    // Create tables with correct schema
    await pool.query(`
      CREATE TABLE users (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
      );

      CREATE TABLE slideshow_images (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        image_url TEXT NOT NULL,
        alt_text TEXT DEFAULT '',
        display_order INTEGER NOT NULL DEFAULT 0
      );

      CREATE TABLE site_settings (
        key VARCHAR PRIMARY KEY,
        value TEXT NOT NULL
      );

      CREATE TABLE exhibitions (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        title TEXT NOT NULL,
        description TEXT DEFAULT '',
        images JSONB DEFAULT '[]',
        date TEXT DEFAULT '',
        location TEXT DEFAULT '',
        floor_plan_url TEXT DEFAULT '',
        display_order INTEGER NOT NULL DEFAULT 0
      );

      CREATE TABLE projects (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        title TEXT NOT NULL,
        description TEXT DEFAULT '',
        images JSONB DEFAULT '[]',
        date TEXT DEFAULT '',
        display_order INTEGER NOT NULL DEFAULT 0
      );

      CREATE TABLE page_views (
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
