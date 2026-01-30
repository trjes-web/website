import { users, slideshowImages, siteSettings, exhibitions, projects, pageViews, type User, type InsertUser, type SlideshowImage, type InsertSlideshowImage, type SiteSetting, type Exhibition, type InsertExhibition, type Project, type InsertProject, type InsertPageView, type PageView } from "@shared/schema";
import { db } from "./db";
import { eq, asc, desc, sql, gte } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getSlideshowImages(): Promise<SlideshowImage[]>;
  getSlideshowImage(id: string): Promise<SlideshowImage | undefined>;
  createSlideshowImage(image: InsertSlideshowImage): Promise<SlideshowImage>;
  updateSlideshowImage(id: string, image: Partial<InsertSlideshowImage>): Promise<SlideshowImage | undefined>;
  deleteSlideshowImage(id: string): Promise<boolean>;
  getSlideshowImageCount(): Promise<number>;
  reorderSlideshowImages(orderedIds: string[]): Promise<void>;

  getSetting(key: string): Promise<string | undefined>;
  setSetting(key: string, value: string): Promise<SiteSetting>;

  getExhibitions(): Promise<Exhibition[]>;
  getExhibition(id: string): Promise<Exhibition | undefined>;
  createExhibition(exhibition: InsertExhibition): Promise<Exhibition>;
  updateExhibition(id: string, exhibition: Partial<InsertExhibition>): Promise<Exhibition | undefined>;
  deleteExhibition(id: string): Promise<boolean>;
  getExhibitionCount(): Promise<number>;
  reorderExhibitions(orderedIds: string[]): Promise<void>;

  getProjects(): Promise<Project[]>;
  getProject(id: string): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: string, project: Partial<InsertProject>): Promise<Project | undefined>;
  deleteProject(id: string): Promise<boolean>;
  reorderProjects(orderedIds: string[]): Promise<void>;

  recordPageView(data: InsertPageView): Promise<PageView>;
  getPageViewStats(): Promise<{ page: string; views: number }[]>;
  getTotalPageViews(): Promise<number>;
  getRecentPageViews(days: number): Promise<number>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getSlideshowImages(): Promise<SlideshowImage[]> {
    return await db.select().from(slideshowImages).orderBy(asc(slideshowImages.displayOrder));
  }

  async getSlideshowImage(id: string): Promise<SlideshowImage | undefined> {
    const [image] = await db.select().from(slideshowImages).where(eq(slideshowImages.id, id));
    return image || undefined;
  }

  async createSlideshowImage(image: InsertSlideshowImage): Promise<SlideshowImage> {
    const [newImage] = await db
      .insert(slideshowImages)
      .values(image)
      .returning();
    return newImage;
  }

  async updateSlideshowImage(id: string, image: Partial<InsertSlideshowImage>): Promise<SlideshowImage | undefined> {
    const [updated] = await db
      .update(slideshowImages)
      .set(image)
      .where(eq(slideshowImages.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteSlideshowImage(id: string): Promise<boolean> {
    const result = await db.delete(slideshowImages).where(eq(slideshowImages.id, id)).returning();
    return result.length > 0;
  }

  async getSlideshowImageCount(): Promise<number> {
    const images = await db.select().from(slideshowImages);
    return images.length;
  }

  async reorderSlideshowImages(orderedIds: string[]): Promise<void> {
    for (let i = 0; i < orderedIds.length; i++) {
      await db
        .update(slideshowImages)
        .set({ displayOrder: i })
        .where(eq(slideshowImages.id, orderedIds[i]));
    }
  }

  async getSetting(key: string): Promise<string | undefined> {
    const [setting] = await db.select().from(siteSettings).where(eq(siteSettings.key, key));
    return setting?.value;
  }

  async setSetting(key: string, value: string): Promise<SiteSetting> {
    const [existing] = await db.select().from(siteSettings).where(eq(siteSettings.key, key));
    if (existing) {
      const [updated] = await db
        .update(siteSettings)
        .set({ value })
        .where(eq(siteSettings.key, key))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(siteSettings)
        .values({ key, value })
        .returning();
      return created;
    }
  }

  async getExhibitions(): Promise<Exhibition[]> {
    return await db.select().from(exhibitions).orderBy(asc(exhibitions.displayOrder));
  }

  async getExhibition(id: string): Promise<Exhibition | undefined> {
    const [exhibition] = await db.select().from(exhibitions).where(eq(exhibitions.id, id));
    return exhibition || undefined;
  }

  async createExhibition(exhibition: InsertExhibition): Promise<Exhibition> {
    const [newExhibition] = await db
      .insert(exhibitions)
      .values(exhibition)
      .returning();
    return newExhibition;
  }

  async updateExhibition(id: string, exhibition: Partial<InsertExhibition>): Promise<Exhibition | undefined> {
    const [updated] = await db
      .update(exhibitions)
      .set(exhibition)
      .where(eq(exhibitions.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteExhibition(id: string): Promise<boolean> {
    const result = await db.delete(exhibitions).where(eq(exhibitions.id, id)).returning();
    return result.length > 0;
  }

  async getExhibitionCount(): Promise<number> {
    const items = await db.select().from(exhibitions);
    return items.length;
  }

  async reorderExhibitions(orderedIds: string[]): Promise<void> {
    for (let i = 0; i < orderedIds.length; i++) {
      await db
        .update(exhibitions)
        .set({ displayOrder: i })
        .where(eq(exhibitions.id, orderedIds[i]));
    }
  }

  async getProjects(): Promise<Project[]> {
    return await db.select().from(projects).orderBy(asc(projects.displayOrder));
  }

  async getProject(id: string): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project || undefined;
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const [project] = await db
      .insert(projects)
      .values(insertProject)
      .returning();
    return project;
  }

  async updateProject(id: string, updateData: Partial<InsertProject>): Promise<Project | undefined> {
    const [updated] = await db
      .update(projects)
      .set(updateData)
      .where(eq(projects.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteProject(id: string): Promise<boolean> {
    const result = await db.delete(projects).where(eq(projects.id, id)).returning();
    return result.length > 0;
  }

  async reorderProjects(orderedIds: string[]): Promise<void> {
    for (let i = 0; i < orderedIds.length; i++) {
      await db
        .update(projects)
        .set({ displayOrder: i })
        .where(eq(projects.id, orderedIds[i]));
    }
  }

  async recordPageView(data: InsertPageView): Promise<PageView> {
    const [view] = await db
      .insert(pageViews)
      .values(data)
      .returning();
    return view;
  }

  async getPageViewStats(): Promise<{ page: string; views: number }[]> {
    const result = await db
      .select({
        page: pageViews.page,
        views: sql<number>`count(*)::int`,
      })
      .from(pageViews)
      .groupBy(pageViews.page)
      .orderBy(desc(sql`count(*)`));
    return result;
  }

  async getTotalPageViews(): Promise<number> {
    const result = await db.select().from(pageViews);
    return result.length;
  }

  async getRecentPageViews(days: number): Promise<number> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    const result = await db
      .select()
      .from(pageViews)
      .where(gte(pageViews.visitedAt, cutoff));
    return result.length;
  }
}

export const storage = new DatabaseStorage();
