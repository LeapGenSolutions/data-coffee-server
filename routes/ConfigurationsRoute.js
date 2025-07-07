const express = require("express");
const router = express.Router();

const {
  createSource,
  fetchSource,
  patchSource,
  deleteSource,
} = require("../services/ConfigurationService");

router.get("/:userId/:sourceName", async (req, res) => {
  try {
    const { userId, sourceName } = req.params;
    const source = await fetchSource(userId, sourceName);
    res.json(source);
  } catch (error) {
    res.status(404).json({ error: error.message || "Source not found" });
  }
});

router.post("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const sourceData = req.body;

    if (
      !sourceData.sourceName ||
      !sourceData.sourceType ||
      !sourceData.location
    ) {
      return res
        .status(400)
        .json({ error: "sourceName, sourceType, and location are required" });
    }

    let existingSource;
    try {
      existingSource = await fetchSource(userId, sourceData.sourceName);
    } catch (err) {
      existingSource = null;
    }

    if (existingSource) {
      return res.status(409).json({ error: "Source name already exists" });
    }

    const createdSource = await createSource(userId, sourceData);
    res.status(201).json(createdSource);
  } catch (error) {
    res.status(400).json({ error: error.message || "Failed to create source" });
  }
});

router.patch("/:userId/:sourceName", async (req, res) => {
  try {
    const { userId, sourceName } = req.params;
    const updates = req.body;

    if (Object.keys(updates).length === 0) {
      return res
        .status(400)
        .json({ error: "At least one field required to update" });
    }

    const updatedSource = await patchSource(userId, sourceName, updates);
    res.json(updatedSource);
  } catch (error) {
    console.error("Patch error:", error);
    if (error.errors) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(400).json({ error: error.message || "Failed to update source" });
  }
});

router.delete("/:userId/:sourceName", async (req, res) => {
  try {
    const { userId, sourceName } = req.params;
    await deleteSource(userId, sourceName);
    res.json({ message: "Source deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message || "Failed to delete source" });
  }
});

module.exports = router;
