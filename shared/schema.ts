import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const exhibitionImageSchema = z.object({
  url: z.string(),
  caption: z.string().optional(),
});

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const slideshowImages = pgTable("slideshow_images", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  imageUrl: text("image_url").notNull(),
  altText: text("alt_text").default(""),
  displayOrder: integer("display_order").notNull().default(0),
});

export const insertSlideshowImageSchema = createInsertSchema(slideshowImages).omit({
  id: true,
});

export type InsertSlideshowImage = z.infer<typeof insertSlideshowImageSchema>;
export type SlideshowImage = typeof slideshowImages.$inferSelect;

export const siteSettings = pgTable("site_settings", {
  key: varchar("key").primaryKey(),
  value: text("value").notNull(),
});

export const insertSiteSettingSchema = createInsertSchema(siteSettings);

export type InsertSiteSetting = z.infer<typeof insertSiteSettingSchema>;
export type SiteSetting = typeof siteSettings.$inferSelect;

export const exhibitions = pgTable("exhibitions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").default(""),
  images: jsonb("images").$type<{ url: string; caption?: string }[]>().default([]),
  date: text("date").default(""),
  location: text("location").default(""),
  floorPlanUrl: text("floor_plan_url").default(""),
  displayOrder: integer("display_order").notNull().default(0),
  visible: boolean("visible").notNull().default(true),
});

export const insertExhibitionSchema = createInsertSchema(exhibitions).omit({
  id: true,
}).extend({
  images: z.array(exhibitionImageSchema).optional(),
});

export type InsertExhibition = z.infer<typeof insertExhibitionSchema>;
export type Exhibition = typeof exhibitions.$inferSelect;
export type ExhibitionImage = z.infer<typeof exhibitionImageSchema>;

export const projectImageSchema = z.object({
  url: z.string(),
  caption: z.string().optional(),
});

export const projects = pgTable("projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").default(""),
  images: jsonb("images").$type<{ url: string; caption?: string }[]>().default([]),
  date: text("date").default(""),
  displayOrder: integer("display_order").notNull().default(0),
  visible: boolean("visible").notNull().default(true),
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
}).extend({
  images: z.array(projectImageSchema).optional(),
});

export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;
export type ProjectImage = z.infer<typeof projectImageSchema>;

export const pageViews = pgTable("page_views", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  page: text("page").notNull(),
  visitedAt: timestamp("visited_at").notNull().defaultNow(),
  userAgent: text("user_agent").default(""),
  referrer: text("referrer").default(""),
});

export const insertPageViewSchema = createInsertSchema(pageViews).omit({
  id: true,
  visitedAt: true,
});

export type InsertPageView = z.infer<typeof insertPageViewSchema>;
export type PageView = typeof pageViews.$inferSelect;
