import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertSlideshowImageSchema, insertExhibitionSchema, insertProjectSchema, insertRecentEntrySchema, insertContactMessageSchema } from "@shared/schema";
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

const updateRecentEntrySchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  images: z.array(z.object({ url: z.string(), caption: z.string().optional() })).optional(),
  displayOrder: z.number().int().min(0).optional(),
  visible: z.boolean().optional(),
});

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "artist2024";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Trust proxy for correct IP detection behind Railway/reverse proxies
  app.set('trust proxy', true);
  
  // Security Headers
  app.use((req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("X-XSS-Protection", "1; mode=block");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader(
      "Content-Security-Policy",
      "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
      "font-src 'self' https://fonts.gstatic.com; " +
      "img-src 'self' data: blob: https://res.cloudinary.com https://*.cloudinary.com; " +
      "media-src 'self' blob: https://res.cloudinary.com; " +
      "connect-src 'self' https://res.cloudinary.com; " +
      "frame-ancestors 'none';"
    );
    next();
  });

  // Rate Limiting
  const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
  const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
  const RATE_LIMIT_MAX_REQUESTS = 100; // 100 requests per minute per IP

  app.use("/api/", (req, res, next) => {
    const clientIp = String(req.ip || req.headers["x-forwarded-for"] || "unknown");
    const now = Date.now();
    
    let rateData = rateLimitMap.get(clientIp);
    
    if (!rateData || now > rateData.resetTime) {
      rateData = { count: 1, resetTime: now + RATE_LIMIT_WINDOW };
      rateLimitMap.set(clientIp, rateData);
    } else {
      rateData.count++;
    }

    res.setHeader("X-RateLimit-Limit", RATE_LIMIT_MAX_REQUESTS.toString());
    res.setHeader("X-RateLimit-Remaining", Math.max(0, RATE_LIMIT_MAX_REQUESTS - rateData.count).toString());
    res.setHeader("X-RateLimit-Reset", Math.ceil(rateData.resetTime / 1000).toString());

    if (rateData.count > RATE_LIMIT_MAX_REQUESTS) {
      return res.status(429).json({ error: "Too many requests. Please slow down." });
    }

    next();
  });

  // Clean up old rate limit entries every 5 minutes
  setInterval(() => {
    const now = Date.now();
    Array.from(rateLimitMap.entries()).forEach(([ip, data]) => {
      if (now > data.resetTime) {
        rateLimitMap.delete(ip);
      }
    });
  }, 5 * 60 * 1000);

  registerUploadRoutes(app);

  const loginAttemptsMap = new Map<string, { count: number; lockedUntil: Date | null; code: string | null; codeExpires: Date | null }>();
  const MAX_ATTEMPTS = 3;
  const LOCKOUT_MINUTES = 30;
  const ARTIST_EMAIL = "jesaja.trummer@gmail.com";

  function generateCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  async function sendUnlockEmail(code: string): Promise<boolean> {
    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    if (!RESEND_API_KEY) return false;
    
    try {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Portfolio <onboarding@resend.dev>",
          to: [ARTIST_EMAIL],
          subject: "Admin Login Unlock Code",
          text: `Someone tried to log into your admin panel multiple times.\n\nYour unlock code is: ${code}\n\nThis code expires in 30 minutes.\n\nIf this wasn't you, please ignore this email.`,
        }),
      });
      return true;
    } catch {
      return false;
    }
  }

  app.post("/api/admin/verify", async (req, res) => {
    const { password, unlockCode } = req.body;
    const clientIp = req.ip || req.headers["x-forwarded-for"] || "unknown";
    const ipKey = String(clientIp);

    let attempt = loginAttemptsMap.get(ipKey) || { count: 0, lockedUntil: null, code: null, codeExpires: null };

    // Check if locked and code required
    if (attempt.lockedUntil && new Date() < attempt.lockedUntil) {
      if (!unlockCode) {
        return res.status(423).json({ 
          error: "Too many attempts. Check your email for unlock code.",
          locked: true,
          requiresCode: true
        });
      }
      
      // Verify unlock code
      if (attempt.code && attempt.codeExpires && new Date() < attempt.codeExpires) {
        if (unlockCode.toUpperCase() === attempt.code) {
          // Code correct - reset attempts
          attempt = { count: 0, lockedUntil: null, code: null, codeExpires: null };
          loginAttemptsMap.set(ipKey, attempt);
        } else {
          return res.status(401).json({ error: "Invalid unlock code", locked: true, requiresCode: true });
        }
      } else {
        return res.status(401).json({ error: "Code expired. Try again.", locked: true });
      }
    }

    // Verify password
    if (password === ADMIN_PASSWORD) {
      // Success - reset attempts
      loginAttemptsMap.set(ipKey, { count: 0, lockedUntil: null, code: null, codeExpires: null });
      res.json({ success: true });
    } else {
      // Failed attempt
      attempt.count += 1;
      
      if (attempt.count >= MAX_ATTEMPTS) {
        const code = generateCode();
        attempt.lockedUntil = new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000);
        attempt.code = code;
        attempt.codeExpires = new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000);
        loginAttemptsMap.set(ipKey, attempt);
        
        await sendUnlockEmail(code);
        
        return res.status(423).json({ 
          error: "Too many attempts. Unlock code sent to admin email.",
          locked: true,
          requiresCode: true
        });
      }
      
      loginAttemptsMap.set(ipKey, attempt);
      res.status(401).json({ 
        error: "Invalid password",
        attemptsRemaining: MAX_ATTEMPTS - attempt.count
      });
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
      const count = await storage.getSlideshowImageCount();
      if (count >= 5) {
        return res.status(400).json({ error: "Maximum 5 images allowed" });
      }

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
      await storage.createPageView({ 
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
      const stats = await storage.getPageViewStats(30);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch analytics" });
    }
  });

  app.post("/api/newsletter/subscribe", async (req, res) => {
    try {
      const { email } = req.body;
      if (!email || typeof email !== "string" || !email.includes("@")) {
        return res.status(400).json({ error: "Valid email required" });
      }
      const subscriber = await storage.subscribeNewsletter(email.toLowerCase().trim());
      res.status(201).json({ success: true, subscriber });
    } catch (error: any) {
      if (error?.code === "23505") {
        return res.status(400).json({ error: "Already subscribed" });
      }
      res.status(500).json({ error: "Failed to subscribe" });
    }
  });

  app.post("/api/newsletter/subscribers", async (req, res) => {
    try {
      const { password } = req.body;
      if (password !== ADMIN_PASSWORD) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const subscribers = await storage.getNewsletterSubscribers();
      res.json(subscribers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch subscribers" });
    }
  });

  app.delete("/api/newsletter/unsubscribe", async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ error: "Email required" });
      }
      const deleted = await storage.unsubscribeNewsletter(email.toLowerCase().trim());
      if (!deleted) {
        return res.status(404).json({ error: "Email not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to unsubscribe" });
    }
  });

  // Recent entries routes
  app.get("/api/recent", async (req, res) => {
    try {
      const includeHidden = req.query.includeHidden === "true";
      const entries = await storage.getRecentEntries(includeHidden);
      res.json(entries);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch recent entries" });
    }
  });

  app.post("/api/recent", async (req, res) => {
    try {
      const { password, ...data } = req.body;
      if (password !== ADMIN_PASSWORD) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const parsed = insertRecentEntrySchema.safeParse(data);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.message });
      }
      const entry = await storage.createRecentEntry(parsed.data);
      res.status(201).json(entry);
    } catch (error) {
      res.status(500).json({ error: "Failed to create recent entry" });
    }
  });

  app.patch("/api/recent/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { password, ...data } = req.body;
      if (password !== ADMIN_PASSWORD) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const parsed = updateRecentEntrySchema.safeParse(data);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.message });
      }
      const entry = await storage.updateRecentEntry(id, parsed.data);
      if (!entry) {
        return res.status(404).json({ error: "Entry not found" });
      }
      res.json(entry);
    } catch (error) {
      res.status(500).json({ error: "Failed to update recent entry" });
    }
  });

  app.delete("/api/recent/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { password } = req.body;
      if (password !== ADMIN_PASSWORD) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const deleted = await storage.deleteRecentEntry(id);
      if (!deleted) {
        return res.status(404).json({ error: "Entry not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete recent entry" });
    }
  });

  app.post("/api/recent/reorder", async (req, res) => {
    try {
      const { orderedIds, password } = req.body;
      if (password !== ADMIN_PASSWORD) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      if (!Array.isArray(orderedIds)) {
        return res.status(400).json({ error: "orderedIds must be an array" });
      }
      await storage.reorderRecentEntries(orderedIds);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to reorder recent entries" });
    }
  });

  // Contact messages routes
  app.post("/api/contact/message", async (req, res) => {
    try {
      const parsed = insertContactMessageSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.message });
      }
      const message = await storage.createContactMessage(parsed.data);
      
      // Send email notification
      const RESEND_API_KEY = process.env.RESEND_API_KEY;
      const ARTIST_EMAIL = "jesaja.trummer@gmail.com";
      
      if (RESEND_API_KEY) {
        try {
          const emailBody = `
New message from ${parsed.data.name}:

${parsed.data.message}

${parsed.data.entryTitle ? `Entry: ${parsed.data.entryTitle}` : ''}
${parsed.data.imageCaption ? `Image caption: ${parsed.data.imageCaption}` : ''}
${parsed.data.imageUrl ? `Image URL: ${parsed.data.imageUrl}` : ''}
          `.trim();

          await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${RESEND_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: "Portfolio <onboarding@resend.dev>",
              to: [ARTIST_EMAIL],
              subject: `New message from ${parsed.data.name} on Recent`,
              text: emailBody,
            }),
          });
        } catch (emailError) {
          console.error("Failed to send email notification:", emailError);
        }
      }
      
      res.status(201).json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to send message" });
    }
  });

  app.post("/api/contact/messages", async (req, res) => {
    try {
      const { password } = req.body;
      if (password !== ADMIN_PASSWORD) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const messages = await storage.getContactMessages();
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  // Backup/Export endpoint
  app.post("/api/admin/export", async (req, res) => {
    try {
      const { password } = req.body;
      if (password !== ADMIN_PASSWORD) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const [
        slideshowImages,
        exhibitions,
        projects,
        recentEntries,
        settings,
        subscribers,
        messages,
      ] = await Promise.all([
        storage.getSlideshowImages(),
        storage.getExhibitions(),
        storage.getProjects(),
        storage.getRecentEntries(),
        storage.getAllSettings(),
        storage.getNewsletterSubscribers(),
        storage.getContactMessages(),
      ]);

      const backup = {
        exportedAt: new Date().toISOString(),
        version: "1.0",
        data: {
          slideshowImages,
          exhibitions,
          projects,
          recentEntries,
          settings,
          subscribers,
          messages,
        },
      };

      res.json(backup);
    } catch (error) {
      res.status(500).json({ error: "Failed to export data" });
    }
  });

  // Analytics/Statistics endpoints
  app.post("/api/pageview", async (req, res) => {
    try {
      const { page, userAgent, referrer } = req.body;
      await storage.createPageView({ page, userAgent, referrer });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to track page view" });
    }
  });

  app.post("/api/admin/stats", async (req, res) => {
    try {
      const { password, days = 30 } = req.body;
      if (password !== ADMIN_PASSWORD) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const stats = await storage.getPageViewStats(days);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch statistics" });
    }
  });

  // robots.txt - Block AI crawlers
  app.get("/robots.txt", (req, res) => {
    const robotsTxt = `# robots.txt for jesajaaljoschatrummer.studio

User-agent: *
Allow: /

# Disallow admin areas
Disallow: /admin
Disallow: /api/

# Block AI/ML crawlers from using content
User-agent: GPTBot
Disallow: /

User-agent: ChatGPT-User
Disallow: /

User-agent: Google-Extended
Disallow: /

User-agent: CCBot
Disallow: /

User-agent: anthropic-ai
Disallow: /

User-agent: Claude-Web
Disallow: /

User-agent: Bytespider
Disallow: /

User-agent: Omgilibot
Disallow: /

User-agent: FacebookBot
Disallow: /

User-agent: Diffbot
Disallow: /

User-agent: Applebot-Extended
Disallow: /

User-agent: PerplexityBot
Disallow: /

User-agent: YouBot
Disallow: /

Sitemap: https://jesajaaljoschatrummer.studio/sitemap.xml
`;
    res.type("text/plain").send(robotsTxt);
  });

  // Dynamic sitemap.xml - only shows enabled/visible pages
  app.get("/sitemap.xml", async (req, res) => {
    try {
      const baseUrl = "https://jesajaaljoschatrummer.studio";
      const enabledPagesData = await storage.getSetting("enabledPages");
      let enabledPages = ["portfolio", "cv", "projects", "contact", "archive", "recent"];
      
      if (enabledPagesData) {
        try {
          enabledPages = JSON.parse(enabledPagesData);
        } catch {}
      }

      const [exhibitions, projects] = await Promise.all([
        storage.getExhibitions(false),
        storage.getProjects(false),
      ]);

      const staticPages = [
        { url: "/", priority: "1.0", changefreq: "weekly" },
      ];

      const pageMapping: Record<string, { url: string; priority: string }> = {
        portfolio: { url: "/portfolio", priority: "0.9" },
        archive: { url: "/archive", priority: "0.8" },
        projects: { url: "/projects", priority: "0.8" },
        contact: { url: "/contact", priority: "0.7" },
        cv: { url: "/cv", priority: "0.6" },
        recent: { url: "/recent", priority: "0.8" },
      };

      let urls = staticPages.map(
        (p) => `  <url>
    <loc>${baseUrl}${p.url}</loc>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`
      );

      enabledPages.forEach((page: string) => {
        const mapping = pageMapping[page];
        if (mapping) {
          urls.push(`  <url>
    <loc>${baseUrl}${mapping.url}</loc>
    <changefreq>monthly</changefreq>
    <priority>${mapping.priority}</priority>
  </url>`);
        }
      });

      if (enabledPages.includes("archive")) {
        exhibitions.forEach((ex) => {
          urls.push(`  <url>
    <loc>${baseUrl}/archive/${ex.id}</loc>
    <changefreq>yearly</changefreq>
    <priority>0.6</priority>
  </url>`);
        });
      }

      if (enabledPages.includes("projects")) {
        projects.forEach((proj) => {
          urls.push(`  <url>
    <loc>${baseUrl}/projects/${proj.id}</loc>
    <changefreq>yearly</changefreq>
    <priority>0.6</priority>
  </url>`);
        });
      }

      const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`;

      res.type("application/xml").send(sitemap);
    } catch (error) {
      res.status(500).send("Error generating sitemap");
    }
  });

  // JSON-LD structured data endpoint
  app.get("/api/structured-data", async (req, res) => {
    try {
      const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Person",
        "name": "Jesaja Aljoscha Trummer",
        "jobTitle": "Visual Artist",
        "url": "https://jesajaaljoschatrummer.studio",
        "sameAs": [],
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "Vienna",
          "addressCountry": "Austria"
        },
        "knowsAbout": ["Visual Art", "Contemporary Art", "Installation Art", "Exhibition"]
      };
      res.json(jsonLd);
    } catch (error) {
      res.status(500).json({ error: "Failed to generate structured data" });
    }
  });

  return httpServer;
}
