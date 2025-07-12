const express = require("express");
const router = express.Router();
const { getWorkspaces, getWorkspacesByOwner } = require("../services/workspaceService");
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

module.exports = router;
