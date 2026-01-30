// FILE: server/routes.ts

import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertSlideshowImageSchema, insertExhibitionSchema, insertProjectSchema } from "@shared/schema";
import { z } from "zod";
import { registerUploadRoutes } from "./upload-routes";

const updateSlideshowImageSchema = z.object({
  imageUrl: z.string().optional(),
  altText: z.string().optional(),
  displayOrder: z.number().int().min(0).optional(),
});

const updateExhibitionSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  images: z.array(z.object({ url: z.string(), caption: z.string().optional() })).optional(),
  date: z.string().optional(),
  location: z.string().optional(),
  floorPlanUrl: z.string().optional(),
  links: z.array(z.object({ url: z.string(), text: z.string() })).optional(),
  displayOrder: z.number().int().min(0).optional(),
  visible: z.boolean().optional(),
});

const updateProjectSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  images: z.array(z.object({ url: z.string(), caption: z.string().optional() })).optional(),
  date: z.string().optional(),
  links: z.array(z.object({ url: z.string(), text: z.string() })).optional(),
  displayOrder: z.number().int().min(0).optional(),
  visible: z.boolean().optional(),
});

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "artist2024";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  registerUploadRoutes(app);

  app.post("/api/admin/verify", (req, res) => {
    const { password } = req.body;
    if (password === ADMIN_PASSWORD) {
      res.json({ success: true });
    } else {
      res.status(401).json({ error: "Invalid password" });
    }
  });
  
  app.get("/api/slideshow", async (req, res) => {
    try {
      const images = await storage.getSlideshowImages();
      res.json(images);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch slideshow images" });
    }
  });

  app.post("/api/slideshow", async (req, res) => {
    try {
      const parsed = insertSlideshowImageSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.message });
      }

      const image = await storage.createSlideshowImage(parsed.data);
      res.status(201).json(image);
    } catch (error) {
      res.status(500).json({ error: "Failed to create slideshow image" });
    }
  });

  app.patch("/api/slideshow/:id", async (req, res) => {
    try {
      const { id } = req.params;
      
      const parsed = updateSlideshowImageSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.message });
      }

      const image = await storage.updateSlideshowImage(id, parsed.data);
      if (!image) {
        return res.status(404).json({ error: "Image not found" });
      }
      res.json(image);
    } catch (error) {
      res.status(500).json({ error: "Failed to update slideshow image" });
    }
  });

  app.post("/api/slideshow/reorder", async (req, res) => {
    try {
      const schema = z.object({
        orderedIds: z.array(z.string()),
      });
      
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.message });
      }

      await storage.reorderSlideshowImages(parsed.data.orderedIds);
      const images = await storage.getSlideshowImages();
      res.json(images);
    } catch (error) {
      res.status(500).json({ error: "Failed to reorder images" });
    }
  });

  app.delete("/api/slideshow/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteSlideshowImage(id);
      if (!deleted) {
        return res.status(404).json({ error: "Image not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete slideshow image" });
    }
  });

  app.get("/api/settings/:key", async (req, res) => {
    try {
      const value = await storage.getSetting(req.params.key);
      res.json({ value: value || null });
    } catch (error) {
      res.status(500).json({ error: "Failed to get setting" });
    }
  });

  app.post("/api/settings/:key", async (req, res) => {
    try {
      const { value } = req.body;
      if (typeof value !== "string") {
        return res.status(400).json({ error: "Value must be a string" });
      }
      const setting = await storage.setSetting(req.params.key, value);
      res.json(setting);
    } catch (error) {
      res.status(500).json({ error: "Failed to save setting" });
    }
  });

  app.get("/api/exhibitions", async (req, res) => {
    try {
      const includeHidden = req.query.includeHidden === 'true';
      const items = await storage.getExhibitions(includeHidden);
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch exhibitions" });
    }
  });

  app.post("/api/exhibitions", async (req, res) => {
    try {
      const parsed = insertExhibitionSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.message });
      }

      const exhibition = await storage.createExhibition(parsed.data);
      res.status(201).json(exhibition);
    } catch (error) {
      res.status(500).json({ error: "Failed to create exhibition" });
    }
  });

  app.patch("/api/exhibitions/:id", async (req, res) => {
    try {
      const { id } = req.params;
      
      const parsed = updateExhibitionSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.message });
      }

      const exhibition = await storage.updateExhibition(id, parsed.data);
      if (!exhibition) {
        return res.status(404).json({ error: "Exhibition not found" });
      }
      res.json(exhibition);
    } catch (error) {
      res.status(500).json({ error: "Failed to update exhibition" });
    }
  });

  app.delete("/api/exhibitions/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteExhibition(id);
      if (!deleted) {
        return res.status(404).json({ error: "Exhibition not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete exhibition" });
    }
  });

  app.post("/api/exhibitions/reorder", async (req, res) => {
    try {
      const { orderedIds } = req.body;
      if (!Array.isArray(orderedIds)) {
        return res.status(400).json({ error: "orderedIds must be an array" });
      }
      await storage.reorderExhibitions(orderedIds);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to reorder exhibitions" });
    }
  });

  app.get("/api/projects", async (req, res) => {
    try {
      const includeHidden = req.query.includeHidden === 'true';
      const items = await storage.getProjects(includeHidden);
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch projects" });
    }
  });

  app.post("/api/projects", async (req, res) => {
    try {
      const parseResult = insertProjectSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ error: "Invalid project data", details: parseResult.error.errors });
      }
      const project = await storage.createProject(parseResult.data);
      res.status(201).json(project);
    } catch (error) {
      res.status(500).json({ error: "Failed to create project" });
    }
  });

  app.patch("/api/projects/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const parseResult = updateProjectSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ error: "Invalid update data", details: parseResult.error.errors });
      }
      const updated = await storage.updateProject(id, parseResult.data);
      if (!updated) {
        return res.status(404).json({ error: "Project not found" });
      }
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update project" });
    }
  });

  app.delete("/api/projects/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteProject(id);
      if (!deleted) {
        return res.status(404).json({ error: "Project not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete project" });
    }
  });

  app.post("/api/projects/reorder", async (req, res) => {
    try {
      const { orderedIds } = req.body;
      if (!Array.isArray(orderedIds)) {
        return res.status(400).json({ error: "orderedIds must be an array" });
      }
      await storage.reorderProjects(orderedIds);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to reorder projects" });
    }
  });

  app.post("/api/analytics/pageview", async (req, res) => {
    try {
      const { page, referrer } = req.body;
      const userAgent = req.headers["user-agent"] || "";
      await storage.recordPageView({ 
        page: page || "/", 
        userAgent: userAgent.substring(0, 200),
        referrer: referrer?.substring(0, 500) || ""
      });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to record page view" });
    }
  });

  app.get("/api/analytics/stats", async (req, res) => {
    try {
      const [stats, total, last7Days, last30Days] = await Promise.all([
        storage.getPageViewStats(),
        storage.getTotalPageViews(),
        storage.getRecentPageViews(7),
        storage.getRecentPageViews(30),
      ]);
      res.json({ stats, total, last7Days, last30Days });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch analytics" });
    }
  });

  return httpServer;
}
