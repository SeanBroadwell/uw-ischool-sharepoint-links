require("dotenv").config();
console.log("ENV FILE LOADED:", process.env.MONGO_URI ? "YES" : "NO");

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const app = express();

// ===============================
// MIDDLEWARE
// ===============================
app.use(express.json());
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
  .then(() => console.log("MongoDB connected"))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

// ===============================
// SCHEMAS + MODEL (UNIT)
// ===============================
const siteSchema = new mongoose.Schema(
  {
    title: { type: String, default: "" },
    description: { type: String, default: "" },
    url: { type: String, default: "" },
  },
  { _id: true }
);

const contactSchema = new mongoose.Schema(
  {
    name: { type: String, default: "" },
    email: { type: String, default: "" },
    role: { type: String, default: "" },
  },
  { _id: true }
);

const mailmanSchema = new mongoose.Schema(
  {
    name: { type: String, default: "" },
    address: { type: String, default: "" },
    description: { type: String, default: "" },
  },
  { _id: true }
);

const unitSchema = new mongoose.Schema(
  {
    name: { type: String, default: "" },
    description: { type: String, default: "" },
    managers: { type: String, default: "" },

    // 3-column page data:
    sites: { type: [siteSchema], default: [] },
    contacts: { type: [contactSchema], default: [] },
    mailmanLists: { type: [mailmanSchema], default: [] },
  },
  { timestamps: true }
);

const Unit = mongoose.model("Unit", unitSchema);

// ===============================
// API ROUTES (UNITS)
// ===============================

// Get all units
app.get("/api/units", async (req, res) => {
  try {
    const units = await Unit.find().sort({ createdAt: 1 });
    res.json(units);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch units" });
  }
});

// Create a new unit
app.post("/api/units", async (req, res) => {
  try {
    const unit = new Unit(req.body);
    await unit.save();
    res.json(unit);
  } catch (err) {
    res.status(500).json({ error: "Failed to create unit" });
  }
});

// Get one unit (for unit.html)
app.get("/api/units/:id", async (req, res) => {
  try {
    const unit = await Unit.findById(req.params.id);
    if (!unit) return res.status(404).json({ error: "Unit not found" });
    res.json(unit);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch unit" });
  }
});

// Update unit (name/description/managers)
app.put("/api/units/:id", async (req, res) => {
  try {
    const updated = await Unit.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update unit" });
  }
});

// Delete unit
app.delete("/api/units/:id", async (req, res) => {
  try {
    await Unit.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete unit" });
  }
});

// ===============================
// SUB-ROUTES for 3-column content
// ===============================

// Add SharePoint site to a unit
app.post("/api/units/:id/sites", async (req, res) => {
  try {
    const { title, url, description } = req.body;
    const updated = await Unit.findByIdAndUpdate(
      req.params.id,
      { $push: { sites: { title, url, description } } },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to add site" });
  }
});

// Add contact to a unit
app.post("/api/units/:id/contacts", async (req, res) => {
  try {
    const { name, email, role } = req.body;
    const updated = await Unit.findByIdAndUpdate(
      req.params.id,
      { $push: { contacts: { name, email, role } } },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to add contact" });
  }
});

// Add mailman list to a unit
app.post("/api/units/:id/mailman", async (req, res) => {
  try {
    const { name, address, description } = req.body;
    const updated = await Unit.findByIdAndUpdate(
      req.params.id,
      { $push: { mailmanLists: { name, address, description } } },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to add mailman list" });
  }
});

// (Optional) delete a specific site/contact/list by subdocument id
app.delete("/api/units/:unitId/sites/:siteId", async (req, res) => {
  try {
    const updated = await Unit.findByIdAndUpdate(
      req.params.unitId,
      { $pull: { sites: { _id: req.params.siteId } } },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to delete site" });
  }
});

app.delete("/api/units/:unitId/contacts/:contactId", async (req, res) => {
  try {
    const updated = await Unit.findByIdAndUpdate(
      req.params.unitId,
      { $pull: { contacts: { _id: req.params.contactId } } },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to delete contact" });
  }
});

app.delete("/api/units/:unitId/mailman/:listId", async (req, res) => {
  try {
    const updated = await Unit.findByIdAndUpdate(
      req.params.unitId,
      { $pull: { mailmanLists: { _id: req.params.listId } } },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to delete mailman list" });
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
  console.log(`Server running on port ${PORT}`);
});
