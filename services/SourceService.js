const { CosmosClient } = require("@azure/cosmos");
require("dotenv").config();

const endpoint = process.env.COSMOS_ENDPOINT;
const key = process.env.COSMOS_KEY;
const client = new CosmosClient({ endpoint, key });

async function fetchSources(userID, sourceName, partitionKey) {
  const database = client.database(process.env.COSMOS_SOURCE);
  const container = database.container("data_coffee_source_type");
  const newId = `${userID}_${sourceName}_${partitionKey}_source`;
  try {
    const { resource } = await container.item(newId, partitionKey).read();
    return resource;
  } catch (error) {
    throw new Error("Item not found");
  }
}

async function patchSources(userID, sourceName, partitionKey, prompt, location) {
  const database = client.database(process.env.COSMOS_SOURCE);
  const container = database.container("data_coffee_source_type");
  const newId = `${userID}_${sourceName}_${partitionKey}_source`;
  try {
    const { resource: item } = await container.item(newId, partitionKey).read();
    console.log(item.location, "__", location);
    
    const updatedItem = {
      ...item,
      prompt: prompt === null ? item.prompt : prompt,
      location: location === null ? item.location : location,
    };
    await container.item(newId, partitionKey).replace(updatedItem);
  } catch (err) {
    console.error(err);
    throw new Error({ error: "Failed to update item" });
  }
}

async function createSources(userID, sourceName, sourceType, prompt, location) {
  const database = client.database(process.env.COSMOS_SOURCE);
  const container = database.container("data_coffee_source_type");
  const item = {
    id: `${userID}_${sourceName}_${sourceType}_source`,
    source_type_identifier : sourceType,
    source_name_value: sourceName,
    source_type_value: sourceType,
    prompt: prompt,
    location: location
  };
  try {
    const { resource: createdItem } = await container.items.create(item);
    return createdItem;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to create doctor notes");
  }
}

module.exports = {
  fetchSources,
    patchSources,
    createSources,
};
