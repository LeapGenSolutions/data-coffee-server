const { BlobServiceClient } = require('@azure/storage-blob');

async function testAzureBlobConnection(connectionString, containerName) {
  if (!connectionString || !containerName) {
    throw new Error('Missing connectionString or containerName');
  }
  try {
    const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    const containerClient = blobServiceClient.getContainerClient(containerName);
    await containerClient.getProperties();
    return { success: true, message: 'Connection to Azure Blob Storage successful!' };
  } catch (error) {
    return { success: false, message: 'Failed to connect to Azure Blob Storage', error: error.message };
  }
}

module.exports = { testAzureBlobConnection };
