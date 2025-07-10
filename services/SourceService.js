const { CosmosClient } = require("@azure/cosmos");
const { v4: uuidv4 } = require('uuid');
require("dotenv").config();

const endpoint = process.env.COSMOS_ENDPOINT;
const key = process.env.COSMOS_KEY;
const client = new CosmosClient({ endpoint, key });

async function fetchSourcesByUserId(userID) {
  const database = client.database(process.env.COSMOS_SOURCE);
  const container = database.container("data-coffee-source-configurations");
  
  try {
    const querySpec = {
      query: "SELECT * FROM c WHERE c.user_id = @userID",
      parameters: [{ name: "@userID", value: userID }]
    };
    
    const { resources } = await container.items.query(querySpec).fetchAll();
    return resources;
  } catch (error) {
    throw new Error("Failed to fetch sources for user");
  }
}

async function fetchSource(id, partitionIdentifier) {
  const database = client.database(process.env.COSMOS_SOURCE);
  const container = database.container("data-coffee-source-configurations");
  try {
    const { resource } = await container.item(id, partitionIdentifier).read();

    if (!resource) {
      throw new Error("Item not found");
    }

    return resource;
  } catch (error) {
    console.error("Fetch source error:", error.message);
    throw new Error("Failed to fetch source");
  }
}


async function patchSources(id, partitionIdentifier, newData) {
  const database = client.database(process.env.COSMOS_SOURCE);
  const container = database.container("data-coffee-source-configurations");
  try { 
    const { resource : item } = await container.item(id, partitionIdentifier).read();

    if (!item) {
      throw new Error("Item not found");
    }
    
    const updatedItem = {
      id: item.id,
      partitionIdentifier: item.partitionIdentifier || partitionIdentifier,
      user_id: item.user_id || partitionIdentifier,
      configuration : newData?.configuration ? {
        ...newData.configuration,
        step : undefined
      } : item.configuration,
      data_selection_mode: newData?.dataSelectionMode || item.data_selection_mode,
      selected_tables: newData?.selectedTables || item.selected_tables,
      selected_columns: newData?.selectedColumns || item.selected_columns,
      custom_query: newData?.customQuery || item.custom_query,
      status: newData?.status || item.status,
      last_sync: newData?.lastSync || new Date().toISOString(),
      created_at: item.created_at,
      updated_at: new Date().toISOString(),
    };
    
    await container.item(item.id, partitionIdentifier).replace(updatedItem);
  } catch (err) {
    console.error(err);
    throw new Error({ error: "Failed to update item" });
  }
}

async function createSources(userID, data) {
  const database = client.database(process.env.COSMOS_SOURCE);
  const container = database.container("data-coffee-source-configurations");
  
  const item = {
    id: `source-${data.id}-${uuidv4()}`,
    partitionIdentifier: userID,
    user_id: userID,
    configuration : {
      ...data.configuration
    },
    data_selection_mode: data.dataSelectionMode || "all",
    selected_tables: data.selectedTables || [],
    selected_columns: data.selectedColumns || [],
    custom_query: data.customQuery || "",
    status: data.status || "Active",
    last_sync: data.lastSync || new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  
  try {
    const { resource: createdItem } = await container.items.create(item);
    return createdItem;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to create doctor notes");
  }
}

async function deleteSources(id, userID) {
  const database = client.database(process.env.COSMOS_SOURCE);
  const container = database.container("data-coffee-source-configurations");
  try {
    await container.item(id, userID).delete();
    return { success: true, message: "Source deleted successfully" };
  } catch (error) {
    console.error(error);
    throw new Error("Failed to delete source");
  }
}

module.exports = {
    fetchSourcesByUserId,
    fetchSource,
    patchSources,
    createSources,
    deleteSources
};
