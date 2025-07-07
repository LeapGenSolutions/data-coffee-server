const { CosmosClient } = require("@azure/cosmos");
const {
  getValidationSchema,
  getPatchValidationSchema,
} = require("../utils/validationSchemas");
require("dotenv").config();

const endpoint = process.env.COSMOS_ENDPOINT;
const key = process.env.COSMOS_KEY;
const client = new CosmosClient({ endpoint, key });
const database = client.database(process.env.COSMOS_SOURCE);
const container = database.container("data-coffee-source-configurations");

function cleanIrrelevantFields(item, sourceType, location) {
  const fieldMap = {
    sql: {
      cloud: ["host", "port", "dbName", "username", "password"],
      "on-prem": ["connectionString", "cloudProvider", "authMethod"],
    },
    oracle: {
      cloud: ["host", "port", "sid", "username", "password"],
      "on-prem": ["connectionString", "cloudProvider", "authMethod"],
    },
    postgresql: {
      cloud: ["host", "port", "dbName", "username", "password"],
      "on-prem": ["connectionString", "cloudProvider", "authMethod"],
    },
    mongodb: {
      cloud: ["host", "port", "database", "username", "password"],
      "on-prem": ["atlasUri", "authMethod"],
    },
    files: {
      cloud: ["filePath", "fileFormat"],
      "on-prem": ["containerName", "fileFormat", "authType"],
    },
    blob: {
      cloud: ["uncPath", "fileAuth"],
      "on-prem": ["blobUri", "accessKey", "sasToken"],
    },
    rest: {
      cloud: ["baseUrl", "headers", "authType", "proxy"],
      "on-prem": ["baseUrl", "authType", "region"],
    },
    datawarehouse: {
      cloud: ["host", "port", "dbName", "username", "password"],
      "on-prem": ["cloudDwUri", "authKey", "oauthToken", "region"],
    },
  };

  const fieldsToRemove = fieldMap[sourceType]?.[location] || [];
  fieldsToRemove.forEach((field) => delete item[field]);

  return item;
}

async function createSource(userId, sourceData) {
  const { sourceName, sourceType, location } = sourceData;

  const schema = getValidationSchema(
    sourceType.toLowerCase(),
    location.toLowerCase()
  );
  schema.parse(sourceData);

  const id = `${userId}_${sourceName}_source`;

  const item = {
    id,
    partitionIdentifier: sourceName,
    ...sourceData,
    dataSelectionMode: sourceData.dataSelectionMode || "all",
    selectedTables: sourceData.selectedTables || [],
    selectedColumns: sourceData.selectedColumns || {},
    customQuery: sourceData.customQuery || "",
    status: true,
    lastSync: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };

  try {
    const { resource } = await container.items.create(item, {
      partitionKey: item.partitionIdentifier,
    });
    return resource;
  } catch (error) {
    console.error("Create error:", error);
    throw new Error("Failed to create source");
  }
}

async function fetchSource(userId, sourceName) {
  const id = `${userId}_${sourceName}_source`;

  try {
    const { resource } = await container.item(id, sourceName).read();
    if (!resource) throw new Error(`${sourceName} not found`);
    return resource;
  } catch (error) {
    console.error("Fetch error:", error);
    throw new Error("Source not found");
  }
}

async function patchSource(userId, sourceName, updates) {
  const id = `${userId}_${sourceName}_source`;

  try {
    const { resource: existingItem } = await container
      .item(id, sourceName)
      .read();

    const newSourceType = (
      updates.sourceType ?? existingItem.sourceType
    ).toLowerCase();
    const newLocation = (
      updates.location ?? existingItem.location
    ).toLowerCase();

    let updatedItem = {
      ...existingItem,
      ...updates,
      sourceType: newSourceType,
      location: newLocation,
      dataSelectionMode:
        updates.dataSelectionMode ?? existingItem.dataSelectionMode ?? "all",
      selectedTables:
        updates.selectedTables ?? existingItem.selectedTables ?? [],
      selectedColumns:
        updates.selectedColumns ?? existingItem.selectedColumns ?? {},
      customQuery: updates.customQuery ?? existingItem.customQuery ?? "",
    };

    updatedItem = cleanIrrelevantFields(
      updatedItem,
      newSourceType,
      newLocation
    );

    const schema = getPatchValidationSchema(newSourceType, newLocation);
    schema.parse(updatedItem);

    await container.item(id, sourceName).replace(updatedItem);
    return updatedItem;
  } catch (error) {
    console.error("Patch error:", error);
    throw new Error("Failed to update source");
  }
}

async function deleteSource(userId, sourceName) {
  const id = `${userId}_${sourceName}_source`;

  try {
    const { resource } = await container.item(id, sourceName).delete();
    return resource;
  } catch (error) {
    console.error("Delete error:", error);
    throw new Error("Failed to delete source");
  }
}

module.exports = {
  createSource,
  fetchSource,
  patchSource,
  deleteSource,
};
