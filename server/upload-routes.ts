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
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const base64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
      const result = await uploadImage(base64);

      res.json({
        url: result.url,
        publicId: result.publicId,
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ error: "Failed to upload image" });
    }
  });
}
