import { pool } from "./db";

export async function initializeDatabase() {
  console.log("Initializing database...");
  
  try {
    // Only create tables if they don't exist - NO dropping!
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
        display_order INTEGER NOT NULL DEFAULT 0,
        visible BOOLEAN NOT NULL DEFAULT true
      );

      CREATE TABLE IF NOT EXISTS projects (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        title TEXT NOT NULL,
        description TEXT DEFAULT '',
        images JSONB DEFAULT '[]',
        date TEXT DEFAULT '',
        display_order INTEGER NOT NULL DEFAULT 0,
        visible BOOLEAN NOT NULL DEFAULT true
      );

      CREATE TABLE IF NOT EXISTS page_views (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        page TEXT NOT NULL,
        visited_at TIMESTAMP NOT NULL DEFAULT NOW(),
        user_agent TEXT DEFAULT '',
        referrer TEXT DEFAULT ''
      );

      CREATE TABLE IF NOT EXISTS newsletter_subscribers (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        email TEXT NOT NULL UNIQUE,
        subscribed_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    // Add missing columns to existing tables (safe - won't error if already exists)
    await pool.query(`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'exhibitions' AND column_name = 'visible') THEN
          ALTER TABLE exhibitions ADD COLUMN visible BOOLEAN NOT NULL DEFAULT true;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'visible') THEN
          ALTER TABLE projects ADD COLUMN visible BOOLEAN NOT NULL DEFAULT true;
        END IF;
      END $$;
    `);

    console.log("Database tables ready");
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  }
}
