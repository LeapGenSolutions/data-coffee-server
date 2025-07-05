const express = require('express');
const router = express.Router();
const { testAzureBlobConnection } = require('../services/azureBlobService');

// POST /api/connection/abs
router.post('/abs', async (req, res) => {
  const { connectionString, containerName } = req.body;
  if (!connectionString || !containerName) {
    return res.status(400).json({ success: false, message: 'Missing connectionString or containerName' });
  }
  const result = await testAzureBlobConnection(connectionString, containerName);
  if (result.success) {
    res.json(result);
  } else {
    res.status(400).json(result);
  }
});

module.exports = router;
