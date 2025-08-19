const { CosmosClient } = require("@azure/cosmos");
require("dotenv").config();
const { v4: uuidv4 } = require("uuid");

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
      query: "SELECT * FROM c WHERE c.owner = @ownerEmail OR ARRAY_CONTAINS(c.subscribers, @ownerEmail, true)",
      parameters: [{ name: "@ownerEmail", value: ownerEmail }]
    };
    const { resources } = await container.items.query(querySpec).fetchAll();
    return resources;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to fetch workspaces by owner or subscriber");
  }
}

async function createWorkspacesByOwner(ownerEmail, data) {
  const database = client.database("data-coffee-configurations");
  const container = database.container("data-coffee-workspaces");

  const item = {
    id: `workspace-${uuidv4()}`,
    workspaceName: data.workspaceName,
    owner: ownerEmail,
    visibility: data.visibility || "private",
    subscribers: Array.isArray(data.subscribers) ? data.subscribers : [],
  }

   try {
        const result = await container.items.upsert(item);
        return result.resource;
    } catch (error) {
        console.error("Create workspace error:", error.message);
        throw new Error("Failed to create workspace");
    }
}

async function deleteWorkspace(id, workspaceName) {
  const database = client.database("data-coffee-configurations");
  const container = database.container("data-coffee-workspaces");
  try {
    await container.item(id, workspaceName).delete();
    return { success: true, message: "Workspace deleted successfully" };
  } catch (error) {
    console.error(error);
    throw new Error("Failed to delete Workspace.");
  }
}

async function renameWorkspace(currentWorkspaceName, id, data) {
  const database = client.database("data-coffee-configurations");
  const container = database.container("data-coffee-workspaces");

  try {
    const { resource: existingDoc } = await container.item(id, currentWorkspaceName).read();
    if (!existingDoc) throw new Error("Workspace not found");

    if (data.workspaceName && data.workspaceName !== existingDoc.workspaceName) {
      const newDoc = { ...existingDoc, workspaceName: data.workspaceName };
      await container.items.create(newDoc, { partitionKey: data.workspaceName });
      await container.item(id, existingDoc.workspaceName).delete();
      return newDoc;
    }
    const patchOps = Object.entries(data).map(([key, value]) => ({
      op: "add",
      path: `/${key}`,
      value
    }));

    const { resource } = await container
      .item(id, existingDoc.workspaceName)
      .patch(patchOps);

    return resource;

  } catch (err) {
    throw new Error(`Failed to update workspace: ${err.message}`);
  }
}

module.exports = { getWorkspaces, getWorkspacesByOwner, createWorkspacesByOwner, deleteWorkspace, renameWorkspace };
