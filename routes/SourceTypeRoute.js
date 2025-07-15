const express = require("express");
const {
  fetchSourceTypesBySourceKey,
  fetchSourceType,
  createSourceType,
  deleteSourceType,
  fetchSourcesTypes,
} = require("../services/sourceTypeService");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const item = await fetchSourcesTypes();
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", async (req, res) => {
  try {
    const data = req.body;
    const item = await createSourceType(data);
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:sourceKey", async (req, res) => {
  try {
    const { sourceKey } = req.params;
    const items = await fetchSourceTypesBySourceKey(sourceKey);
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:sourceKey/:id", async (req, res) => {
  try {
    const { sourceKey, id } = req.params;
    const item = await fetchSourceType(id, sourceKey);
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});


router.delete("/:sourceKey/:id", async (req, res) => {
  try {
    const { sourceKey, id } = req.params;
    const result = await deleteSourceType(id, sourceKey);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
