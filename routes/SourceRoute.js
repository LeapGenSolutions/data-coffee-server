const express = require("express");
const { fetchSource, deleteSources, fetchSourcesByUserId, patchSources, createSources } = require("../services/SourceService");
const e = require("express");
const router = express.Router();

router.get("/:email/:workspaceID", async (req, res) => {
  try {
    const { email, workspaceID } = req.params;
    if (!workspaceID) {
      return res.status(400).json({ error: "workspaceID is mandatory" });
    }
    const items = await fetchSourcesByUserId(email, workspaceID);
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:email/:id", async (req, res) => {
  try {
    const { email, id } = req.params;
    const items = await fetchSource(id, email);
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message || "Internal server error" });
  }
});


router.patch("/:email/:id", async (req, res) => {
  try {
    const { email, id } = req.params;
    const data = req.body.data || null;
    const items = await patchSources(id, email, data);
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const data = req.body || null;
    const items = await createSources(email, data);
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:email/:id", async (req, res) => {
  try {
    const { email, id } = req.params;
    const items = await deleteSources(id, email);
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
