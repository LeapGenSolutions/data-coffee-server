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

async function listFilesInBlobPath(connectionString, containerName, blobPath, fileType) {
  if (!connectionString || !containerName || !blobPath || !fileType) {
    throw new Error('Missing required parameters');
  }
  try {
    const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const fileList = [];
    for await (const blob of containerClient.listBlobsFlat({ prefix: blobPath })) {
      if (blob.name.endsWith('.' + fileType)) {
        fileList.push(blob.name);
      }
    }
    return { success: true, files: fileList };
  } catch (error) {
    return { success: false, message: 'Failed to list files', error: error.message };
  }
}

module.exports = { testAzureBlobConnection, listFilesInBlobPath };
