const express = require("express");
const router = express.Router();
const { getWorkspaces, getWorkspacesByOwner, createWorkspacesByOwner, deleteWorkspace, renameWorkspace } = require("../services/workspaceService");
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

router.delete("/:workspaceName/:id", async (req, res) => {
  try {
    const workspaceName = decodeURIComponent(req.params.workspaceName);
    const { id } = req.params;
    const items = await deleteWorkspace(id, workspaceName);
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/:workspaceName/:id", async (req, res) => {
  try {
    const workspaceName = decodeURIComponent(req.params.workspaceName).trim();
    const { id } = req.params;
    const newData = req.body;

    const updated = await renameWorkspace(workspaceName, id, newData);
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
