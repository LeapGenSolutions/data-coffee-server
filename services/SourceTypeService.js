const { CosmosClient } = require("@azure/cosmos");
require("dotenv").config();
const { v4: uuidv4 } = require("uuid");

const endpoint = process.env.COSMOS_ENDPOINT;
const key = process.env.COSMOS_KEY;
const client = new CosmosClient({ endpoint, key });

const database = client.database(process.env.COSMOS_SOURCE);
const container = database.container("data-coffee-types");

async function fetchSourceTypesBySourceKey(sourceKey) {
  const querySpec = {
    query: "SELECT * FROM c WHERE c.sourceKey = @sourceKey",
    parameters: [{ name: "@sourceKey", value: sourceKey }],
  };

  try {
    const { resources } = await container.items.query(querySpec).fetchAll();
    return resources;
  } catch (error) {
    console.error("Fetch error:", error.message);
    throw new Error("Failed to fetch source types");
  }
}

async function fetchSourceType(id, sourceKey) {
  try {
    const { resource } = await container.item(id, sourceKey).read();
    if (!resource) throw new Error("Item not found");
    return resource;
  } catch (error) {
    console.error("Fetch error:", error.message);
    throw new Error("Failed to fetch source type");
  }
}

async function createSourceType(data) {
  const item = {
    id: `source-type-${uuidv4()}`,
    sourceType: data.sourceType,
    sourceKey: data.sourceKey,
  };

  try {
    const { resource } = await container.items.create(item);
    return resource;
  } catch (error) {
    console.error("Create error:", error.message);
    throw new Error("Failed to create source type");
  }
}

async function deleteSourceType(id, sourceKey) {
  try {
    await container.item(id, sourceKey).delete();
    return { success: true, message: "Source type deleted successfully" };
  } catch (error) {
    console.error("Delete error:", error.message);
    throw new Error("Failed to delete source type");
  }
}

module.exports = {
  fetchSourceTypesBySourceKey,
  fetchSourceType,
  createSourceType,
  deleteSourceType,
};
