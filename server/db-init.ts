// FILE: server/db-init.ts

import { pool } from "./db";

export async function initializeDatabase() {
  console.log("Initializing database...");
  
  try {
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
        links JSONB DEFAULT '[]',
        display_order INTEGER NOT NULL DEFAULT 0,
        visible BOOLEAN NOT NULL DEFAULT true
      );

      CREATE TABLE IF NOT EXISTS projects (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        title TEXT NOT NULL,
        description TEXT DEFAULT '',
        images JSONB DEFAULT '[]',
        date TEXT DEFAULT '',
        links JSONB DEFAULT '[]',
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
    `);

    await pool.query(`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'exhibitions' AND column_name = 'visible') THEN
          ALTER TABLE exhibitions ADD COLUMN visible BOOLEAN NOT NULL DEFAULT true;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'visible') THEN
          ALTER TABLE projects ADD COLUMN visible BOOLEAN NOT NULL DEFAULT true;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'exhibitions' AND column_name = 'links') THEN
          ALTER TABLE exhibitions ADD COLUMN links JSONB DEFAULT '[]';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'links') THEN
          ALTER TABLE projects ADD COLUMN links JSONB DEFAULT '[]';
        END IF;
      END $$;
    `);

    console.log("Database tables ready");
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  }
}
