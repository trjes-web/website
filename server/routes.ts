// FILE: server/routes.ts

import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { insertSlideshowImageSchema } from "@shared/schema";
import { z } from "zod";

const updateSlideshowImageSchema = z.object({
  imageUrl: z.string().optional(),
  altText: z.string().optional(),
  displayOrder: z.number().optional(),
});

const updateExhibitionSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  images: z.array(z.object({ url: z.string(), caption: z.string().optional() })).optional(),
  date: z.string().optional(),
  location: z.string().optional(),
  floorPlanUrl: z.string().optional(),
  links: z.array(z.object({ url: z.string(), text: z.string() })).optional(),
  displayOrder: z.number().optional(),
  visible: z.boolean().optional(),
});

const updateProjectSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  images: z.array(z.object({ url: z.string(), caption: z.string().optional() })).optional(),
  date: z.string().optional(),
  links: z.array(z.object({ url: z.string(), text: z.string() })).optional(),
  displayOrder: z.number().optional(),
  visible: z.boolean().optional(),
});

export async function registerRoutes(server: Server, app: Express): Promise<void> {
  app.post("/api/admin/verify", async (req, res) => {
    const { password } = req.body;
    const adminPassword = process.env.ADMIN_PASSWORD || "artist2024";
    
    if (password === adminPassword) {
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
        return res.status(400).json({ error: "Invalid data" });
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
        return res.status(400).json({ error: "Invalid data" });
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
        return res.status(400).json({ error: "Invalid data" });
      }

      await storage.reorderSlideshowImages(parsed.data.orderedIds);
      res.json({ success: true });
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
      const { key } = req.params;
      const value = await storage.getSetting(key);
      res.json({ value });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch setting" });
    }
  });

  app.put("/api/settings/:key", async (req, res) => {
    try {
      const { key } = req.params;
      const { value } = req.body;
      
      if (typeof value !== "string") {
        return res.status(400).json({ error: "Value must be a string" });
      }
      
      await storage.setSetting(key, value);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to save setting" });
    }
  });

  app.get("/api/exhibitions", async (req, res) => {
    try {
      const includeHidden = req.query.includeHidden === 'true';
      const exhibitions = await storage.getExhibitions(includeHidden);
      res.json(exhibitions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch exhibitions" });
    }
  });

  app.post("/api/exhibitions", async (req, res) => {
    try {
      const exhibition = await storage.createExhibition(req.body);
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
        return res.status(400).json({ error: "Invalid data" });
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

  app.post("/api/exhibitions/reorder", async (req, res) => {
    try {
      const schema = z.object({
        orderedIds: z.array(z.string()),
      });
      
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid data" });
      }

      await storage.reorderExhibitions(parsed.data.orderedIds);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to reorder exhibitions" });
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

  app.get("/api/projects", async (req, res) => {
    try {
      const includeHidden = req.query.includeHidden === 'true';
      const projects = await storage.getProjects(includeHidden);
      res.json(projects);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch projects" });
    }
  });

  app.post("/api/projects", async (req, res) => {
    try {
      const project = await storage.createProject(req.body);
      res.status(201).json(project);
    } catch (error) {
      res.status(500).json({ error: "Failed to create project" });
    }
  });

  app.patch("/api/projects/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const parsed = updateProjectSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid data" });
      }
      
      const project = await storage.updateProject(id, parsed.data);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      res.status(500).json({ error: "Failed to update project" });
    }
  });

  app.post("/api/projects/reorder", async (req, res) => {
    try {
      const schema = z.object({
        orderedIds: z.array(z.string()),
      });
      
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid data" });
      }

      await storage.reorderProjects(parsed.data.orderedIds);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to reorder projects" });
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

  app.post("/api/analytics/pageview", async (req, res) => {
    try {
      const { page, userAgent, referrer } = req.body;
      await storage.recordPageView({ page, userAgent, referrer });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to record page view" });
    }
  });

  app.get("/api/analytics/stats", async (req, res) => {
    try {
      const stats = await storage.getAnalyticsStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch analytics" });
    }
  });
}
