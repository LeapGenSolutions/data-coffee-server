const { CosmosClient } = require("@azure/cosmos");
const axios = require('axios');
require("dotenv").config();

const endpoint = process.env.COSMOS_ENDPOINT;
const key = process.env.COSMOS_KEY;
const client = new CosmosClient({ endpoint, key });

async function fetchAllPipeLineHistoryByUserId(userID) {
    const database = client.database(process.env.COSMOS_PIPELINE);
    const container = database.container("data-coffee-pipeline-history");
    try {
        const querySpec = {
            query: "SELECT * FROM c WHERE c.user_id = @userID",
            parameters: [{ name: "@userID", value: userID }]
        };

        const { resources } = await container.items.query(querySpec).fetchAll();
        return resources;
    } catch (error) {
        throw new Error("Failed to fetch pipeline history for user");
    }
}

module.exports = {
    fetchAllPipeLineHistoryByUserId
};