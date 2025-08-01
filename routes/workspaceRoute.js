const express = require("express");
const router = express.Router();
const { getWorkspaces, getWorkspacesByOwner, createWorkspacesByOwner } = require("../services/workspaceService");
// GET /api/workspaces/owner/:ownerEmail
router.get("/owner/:ownerEmail", async (req, res) => {
  try {
    const { ownerEmail } = req.params;
    const workspaces = await getWorkspacesByOwner(ownerEmail);
    res.json(workspaces);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch workspaces by owner" });
  }
});

// GET /api/workspaces
router.get("/", async (req, res) => {
  try {
    const workspaces = await getWorkspaces();
    res.json(workspaces);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch workspaces" });
  }
});

// POST /api/workspaces/:ownerEmail
router.post("/:ownerEmail", async (req, res) => {
  try {
    const { ownerEmail } = req.params;
    const data = req.body || null;
    const items = await createWorkspacesByOwner(ownerEmail, data);
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
