// FILE: server/upload-routes.ts

import type { Express } from "express";
import { uploadImage } from "./cloudinary";
import multer from "multer";

const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
});

export function registerUploadRoutes(app: Express): void {
  app.post("/api/uploads/image", upload.single("file"), async (req, res) => {
    try {
      if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
        console.error("Missing Cloudinary credentials");
        return res.status(500).json({ error: "Cloudinary not configured" });
      }

      if (!req.file) {
        console.error("No file in request");
        return res.status(400).json({ error: "No file uploaded" });
      }

      console.log(`Uploading file: ${req.file.originalname}, size: ${req.file.size}, type: ${req.file.mimetype}`);

      const base64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
      const result = await uploadImage(base64);

      console.log(`Upload successful: ${result.url}`);
      res.json({
        url: result.url,
        publicId: result.publicId,
      });
    } catch (error: any) {
      console.error("Upload error:", error?.message || error);
      console.error("Full error:", JSON.stringify(error, null, 2));
      res.status(500).json({ error: error?.message || "Failed to upload image" });
    }
  });
}
