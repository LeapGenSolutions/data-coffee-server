const { CosmosClient } = require("@azure/cosmos");
const e = require("express");
const { v4: uuidv4 } = require('uuid');
require("dotenv").config();

const endpoint = process.env.COSMOS_ENDPOINT;
const key = process.env.COSMOS_KEY;
const client = new CosmosClient({ endpoint, key });

async function fetchAllPipelineByUserId(userID) {
    const datebase = client.database(process.env.COSMOS_PIPELINE);
    const container = datebase.container("data-coffee-pipeline-config");

    try{
        const querySpec = {
            query: "SELECT * FROM c WHERE c.user_id = @userID",
            parameters: [{ name: "@userID", value: userID }]
        };

        const { resources } = await container.items.query(querySpec).fetchAll();
        return resources;
    }catch (error) {
        throw new Error("Failed to fetch pipelines for user");
    }
}

async function fetchPipelineById(id, userID) {
    const database = client.database(process.env.COSMOS_PIPELINE);
    const container = database.container("data-coffee-pipeline-config");

    try {
        const { resource } = await container.item(id, userID).read();

        if (!resource) {
            throw new Error("Item not found");
        }

        return resource;
    } catch (error) {
        console.error("Fetch pipeline error:", error.message);
        throw new Error("Failed to fetch pipeline");
    }
}

async function updatePipeline(id, userID, newData) {
    const databse = client.database(process.env.COSMOS_PIPELINE);
    const container = databse.container("data-coffee-pipeline-config");
    try{
        const { resource: item } = await container.item(id, userID).read();
        if(!item) {
            throw new Error("Item not found");
        }
        const updatedItem = {
            id: item.id,
            user_id: item.user_id || userID,
            name: newData?.name || item.name,
            source: newData?.source || item.source,
            workspaceName: newData?.workspaceName || item.workspaceName,
            workspaceId: newData?.workspaceId || item.workspaceId,
            destination_type: newData?.destinationType || item.destination_type,
            destination: newData?.destination || item.destination,
            techinque: newData?.technique || item.technique,
            processing_agent: item.processingAgent, 
            schedule: newData?.schedule || item.schedule,
            notifications: newData?.notifications || item.notifications,
            auto_close: newData?.autoClose || item.auto_close,
            enable_surround_AI: newData?.enableSurroundAI || item.enable_surround_AI,
            status: newData?.status || item.status,
            last_updated: new Date().toISOString(),
            created_at: item.created_at
        }
        await container.item(id, userID).replace(updatedItem);
        return updatedItem;
    }catch (error) {
        console.error("Update pipeline error:", error.message);
        throw new Error("Failed to update pipeline");
    }
}

async function createPipeline(userId, data){
    const database = client.database(process.env.COSMOS_PIPELINE);
    const container = database.container("data-coffee-pipeline-config");

    const item = {
        id: `pipeline-${Date.now()}-${uuidv4()}`,
        user_id: userId,
        name: data.name,
        source: data.source,
        destination_type: data.destinationType,
        destination: data.destination,
        technique: data.technique,
        workspaceName: data.workspaceName,
        workspaceId: data.workspaceId,
        processing_agent: data.processingAgent,
        schedule: data.schedule,
        notifications: data.notifications,
        auto_close: data.autoClose,
        enable_surround_AI: data.enableSurroundAI,
        status: data.status || "new",
        last_updated: new Date().toISOString(),
        created_at: new Date().toISOString()
    };

    try {
        await container.items.create(item);
        return item;
    } catch (error) {
        console.error("Create pipeline error:", error.message);
        throw new Error("Failed to create pipeline");
    }
}

async function clonePipeline(userId, id){
    const database = client.database(process.env.COSMOS_PIPELINE);
    const container = database.container("data-coffee-pipeline-config");

    try {
        const { resource: item } = await container.item(id, userId).read();
        if (!item) {
            throw new Error("Item not found");
        }

        const clonedItem = {
            ...item,
            id: `pipeline-${Date.now()}-${uuidv4()}`,
            created_at: new Date().toISOString(),
            last_updated: new Date().toISOString()
        };

        await container.items.create(clonedItem);
        return clonedItem;
    } catch (error) {
        console.error("Clone pipeline error:", error.message);
        throw new Error("Failed to clone pipeline");
    }
}

async function deletePipeline(id, userId){
    const database = client.database(process.env.COSMOS_PIPELINE);
    const container = database.container("data-coffee-pipeline-config");
    
    try{
        await container.item(id, userId).delete();
        return { message: "Pipeline deleted successfully" };
    }catch (err) {
        console.error("Delete pipeline error:", err.message);
        throw new Error("Failed to delete pipeline");
    }
}

module.exports = {
    fetchAllPipelineByUserId,
    fetchPipelineById,
    updatePipeline,
    createPipeline,
    clonePipeline,
    deletePipeline
}