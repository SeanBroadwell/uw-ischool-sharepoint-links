require("dotenv").config();
console.log("ENV FILE LOADED:", process.env.MONGO_URI ? "YES" : "NO");


const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());
app.use(express.static(path.join(__dirname, "public")));

// ===============================
// DATABASE CONNECTION
// ===============================
const uri = process.env.MONGO_URI;

if (!uri) {
  console.error("❌ MONGO_URI environment variable is missing");
  process.exit(1);
}

mongoose
  .connect(uri)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

// ===============================
// SCHEMA + MODEL
// ===============================
const cardSchema = new mongoose.Schema(
  {
    title: String,
    desc: String,
    link: String
  },
  { timestamps: true }
);

const Card = mongoose.model("Card", cardSchema);

// ===============================
// API ROUTES
// ===============================

// Get all cards
app.get("/api/cards", async (req, res) => {
  try {
    const cards = await Card.find().sort({ createdAt: 1 });
    res.json(cards);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch cards" });
  }
});

// Add new card
app.post("/api/cards", async (req, res) => {
  try {
    const card = new Card(req.body);
    await card.save();
    res.json(card);
  } catch (err) {
    res.status(500).json({ error: "Failed to create card" });
  }
});

// Update card
app.put("/api/cards/:id", async (req, res) => {
  try {
    const updated = await Card.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update card" });
  }
});

// Delete card
app.delete("/api/cards/:id", async (req, res) => {
  try {
    await Card.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete card" });
  }
});

// ===============================
// FRONTEND FALLBACK
// ===============================
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});


// ===============================
// SERVER START
// ===============================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
