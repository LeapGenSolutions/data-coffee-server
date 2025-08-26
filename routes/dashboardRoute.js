const express = require("express");
const router = express.Router();
const { getDashboardKpis } = require("../services/DashboardService");

router.get("/kpis", async (req, res) => {
  try {
    const { email, from, to } = req.query;

    if (!email) {
      return res.status(400).json({ error: "Missing email parameter" });
    }

    const kpis = await getDashboardKpis({ email, from, to });

    res.json(kpis);
  } catch (error) {
    console.error("Failed to fetch dashboard KPIs:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
