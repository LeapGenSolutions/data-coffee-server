const express = require('express');
const router = express.Router();
const {
    fetchAllPipelineByUserId,
    fetchPipelineById,
    updatePipeline,
    createPipeline,
    clonePipeline,
    deletePipeline
} = require('../services/pipelineService');

router.get("/:email" , async (req, res) => {
    try{
        const { email } = req.params;
        const items = await fetchAllPipelineByUserId(email);
        res.json(items);
    }catch (err) {
        res.status(500).json({ error: "Failed to fetch pipeline data" });
    }
});

router.get("/:email/:id" , async (req, res) => {
    try {
        const { email, id } = req.params;
        const item = await fetchPipelineById(id, email);
        res.json(item);
    }catch (err) {
        res.status(500).json({ error: "Failed to fetch pipeline data" });
    }
});

router.patch("/:email/:id" , async (req, res) => {
    try {
        const { email, id } = req.params;
        const data = req.body.data || null;
        const item = await updatePipeline(id, email, data);
        res.json(item);
    }catch (err) {
        res.status(500).json({ error: "Failed to update pipeline data" });
    }
});

router.post("/:email" , async (req, res) => {
    try {
        const { email } = req.params;
        const data = req.body.data || null;
        const item = await createPipeline(email, data);
        res.json(item);
    }catch (err) {
        res.status(500).json({ error: "Failed to create pipeline", details: err.message || "Internal server error"});
    }
});

router.post("/:email/:id" , async (req, res) => {
    try {
        const { email, id } = req.params;
        const item = await clonePipeline(email, id);
        res.json(item);
    }catch (err) {
        res.status(500).json({ error: "Failed to clone pipeline" });
    }
});

router.delete("/:email/:id" , async (req, res) => {
    try {
        const { email, id } = req.params;
        const item = await deletePipeline(id, email);
        res.json(item);
    }catch(err) {
        res.status(500).json({ error: "Failed to delete pipeline" });
    }
});

module.exports = router;