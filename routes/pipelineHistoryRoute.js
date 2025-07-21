const express = require("express");
const router = express.Router();
const { fetchAllPipeLineHistoryByUserId } = require('../services/pipelineHistoryService');

router.get("/:email", async (req, res) => {
    try {
        const { email } = req.params;
        const items = await fetchAllPipeLineHistoryByUserId(email);
        res.json(items);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch pipeline history data" });
    }
});

module.exports = router;