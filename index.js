import "dotenv/config";
import express from "express";
import multer from "multer";
import fs from "fs/promises";
import { GoogleGenAI } from "@google/genai";

const extractGeneratedText = (data) => {
  try {
    const text =
      data?.response?.candidates?.[0]?.content?.parts?.[0]?.text ??
      data?.candidates?.[0]?.content?.parts?.[0]?.text ??
      data?.response?.candidates?.[0]?.content?.text;

    return text ?? JSON.stringify(data, null, 2);
  } catch (err) {
    console.error("Gagal ketika mengambil text:", err);
    return JSON.stringify(data, null, 2);
  }
};

const app = express();
app.use(express.json());
const upload = multer();

const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash";

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_AI_STUDIO_KEY,
});

// memanggil middleware untuk bisa terima header dengan Content-Type: application/json

app.get("/", async (req, res) => {
  res.send("Hello World!");
});

app.post("/generate-text", async (req, res) => {
  try {
    const prompt = req.body?.prompt;
    if (!prompt) {
      res.status(400).json({ message: "Prompt is required" });
      return;
    }

    const aiResponse = await ai.models.generateContent({
      model: DEFAULT_GEMINI_MODEL,
      contents: prompt,
    });

    res.json({ result: extractGeneratedText(aiResponse) });
  } catch (err) {
    res.status(500).json({ messsage: err.message });
  }
});

app.post(
  "/generate-text-from-image",
  upload.single("image"),
  async (req, res) => {
    try {
      const prompt = req.body?.prompt;
      if (!prompt) {
        res.status(400).json({ message: "Prompt is required" });
        return;
      }

      const file = req.file;
      if (!file) {
        res.status(400).json({ message: "Image is required" });
        return;
      }

      const imgBase64 = file.buffer.toString("base64");

      const aiResponse = await ai.models.generateContent({
        model: DEFAULT_GEMINI_MODEL,
        contents: [
          { text: prompt },
          { inlineData: { mimeType: file.mimetype, data: imgBase64 } },
        ],
      });
      res.json({ result: extractGeneratedText(aiResponse) });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

app.listen(process.env.DEFAULT_PORT, () => {
  console.log(`Server listening on port ${process.env.DEFAULT_PORT}`);
});
