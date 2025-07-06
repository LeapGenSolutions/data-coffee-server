const express = require('express');
const router = express.Router();
const { testAzureBlobConnection, listFilesInBlobPath } = require('../services/azureBlobService');

// POST /api/connection/abs/files
router.post('/abs/files', async (req, res) => {
  const { connectionString, containerName, blobPath, fileType } = req.body;
  if (!connectionString || !containerName || !blobPath || !fileType) {
    return res.status(400).json({ success: false, message: 'Missing required parameters' });
  }
  try {
    const result = await listFilesInBlobPath(connectionString, containerName, blobPath, fileType);
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
});

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
