const express = require("express");
const { fetchSources, patchSources, createSources } = require("../services/SourceService");
const router = express.Router();

router.get("/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const items = await fetchSources(email.split(","), req.body.sourceName, req.body.partitionKey);
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const prompt = req.body.prompt || null;
    const location = req.body.location || null;
    const items = await patchSources(email.split(","), req.body.sourceName, req.body.partitionKey, prompt, location);
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const prompt = req.body.prompt || null;
    const items = await createSources(email.split(","), req.body.sourceName, req.body.sourceType, prompt, req.body.location);
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
