const { CosmosClient } = require("@azure/cosmos");
require("dotenv").config();

const endpoint = process.env.COSMOS_ENDPOINT;
const key = process.env.COSMOS_KEY;
const client = new CosmosClient({ endpoint, key });

async function getWorkspaces() {
  const database = client.database("data-coffee-configurations");
  const container = database.container("data-coffee-workspaces");
  try {
    const querySpec = {
      query: "SELECT * FROM c"
    };
    const { resources } = await container.items.query(querySpec).fetchAll();
    return resources;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to fetch workspaces");
  }
}

async function getWorkspacesByOwner(ownerEmail) {
  const database = client.database("data-coffee-configurations");
  const container = database.container("data-coffee-workspaces");
  try {
    const querySpec = {
      query: "SELECT * FROM c WHERE c.owner = @ownerEmail",
      parameters: [{ name: "@ownerEmail", value: ownerEmail }]
    };
    const { resources } = await container.items.query(querySpec).fetchAll();
    return resources;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to fetch workspaces by owner");
  }
}

module.exports = { getWorkspaces, getWorkspacesByOwner };
