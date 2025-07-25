const { CosmosClient } = require("@azure/cosmos");
const e = require("express");
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');
require("dotenv").config();

const endpoint = process.env.COSMOS_ENDPOINT;
const key = process.env.COSMOS_KEY;
const client = new CosmosClient({ endpoint, key });

async function fetchAllPipelineByUserId(userID) {
    const datebase = client.database(process.env.COSMOS_PIPELINE);
    const container = datebase.container("data-coffee-pipeline-config");

    try {
        const querySpec = {
            query: "SELECT * FROM c WHERE c.user_id = @userID",
            parameters: [{ name: "@userID", value: userID }]
        };

        const { resources } = await container.items.query(querySpec).fetchAll();
        return resources;
    } catch (error) {
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

async function fetchPipelineByWorkspaceId(userID, workspaceId) {
    const datebase = client.database(process.env.COSMOS_PIPELINE);
    const container = datebase.container("data-coffee-pipeline-config");

    try {
        const querySpec = {
            query: "Select * FROM c WHERE c.user_id = @userID and c.workspaceId = @workspaceId",
            parameters: [
                { name: "@userID", value: userID },
                { name: "@workspaceId", value: workspaceId }
            ]
        };

        const { resources: items } = await container.items.query(querySpec).fetchAll();

        if (!items) {
            throw new Error("No pipelines found for this workspace");
        }
        if (items.length === 0) {
            return [];
        }
        return items;
    } catch (err) {
        console.error("Fetch pipeline by workspace ID error:", err.message);
        throw new Error("Failed to fetch pipelines for workspace");
    }
}

async function updatePipeline(id, userID, newData) {
    const databse = client.database(process.env.COSMOS_PIPELINE);
    const container = databse.container("data-coffee-pipeline-config");
    try {
        const { resource: item } = await container.item(id, userID).read();
        if (!item) {
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
            sourceDatabaseId: newData?.sourceDatabaseId || item.sourceDatabaseId,
            destinationDatabaseId: newData?.destinationDatabaseId || item.destinationDatabaseId,
            technique: newData?.technique || item.technique,
            processing_agent: item.processingAgent,
            schedule: newData?.schedule || item.schedule,
            notifications: newData?.notifications || item.notifications,
            auto_close: newData?.autoClose || item.auto_close,
            enable_surround_AI: newData?.enableSurroundAI || item.enable_surround_AI,
            status: newData?.status || item.status,
            last_updated: new Date().toISOString(),
            created_at: item.created_at,
            ...newData
        }
        await container.item(id, userID).replace(updatedItem);
        return updatedItem;
    } catch (error) {
        console.error("Update pipeline error:", error.message);
        throw new Error("Failed to update pipeline");
    }
}

async function createPipeline(userId, data) {
    const database = client.database(process.env.COSMOS_PIPELINE);
    const container = database.container("data-coffee-pipeline-config");

    const item = {
        id: `pipeline-${Date.now()}-${uuidv4()}`,
        user_id: userId,
        name: data.name,
        source: data.source,
        sourceDatabaseId: data.sourceDatabaseId,
        destination: data.destination,
        destinationDatabaseId: data.destinationDatabaseId,
        technique: data.technique,
        workspaceName: data.workspaceName,
        workspaceId: data.workspaceID,
        processing_agent: data.processingAgent,
        schedule: data.schedule,
        notifications: data.notifications,
        customPrompt: data.customPrompt,
        enable_surround_AI: data.enableSurroundAI,
        status: data.status || "new",
        last_updated: new Date().toISOString(),
        created_at: new Date().toISOString()
    };

    try {
        await container.items.upsert(item);
        return item;
    } catch (error) {
        console.error("Create pipeline error:", error.message);
        throw new Error("Failed to create pipeline");
    }
}

async function clonePipeline(userId, id) {
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

async function deletePipeline(id, userId) {
    const database = client.database(process.env.COSMOS_PIPELINE);
    const container = database.container("data-coffee-pipeline-config");

    try {
        await container.item(id, userId).delete();
        return { message: "Pipeline deleted successfully" };
    } catch (err) {
        console.error("Delete pipeline error:", err.message);
        throw new Error("Failed to delete pipeline");
    }
}

async function runPipelineJob(pipeline_id, pipeline_name, user_id) {
    console.log("Running pipeline job with ID:", pipeline_id, "and name:", pipeline_name);
    console.log("User ID:", user_id);
    
    
    const DATABRICKS_URL = process.env.DATABRICKS_URL;
    const DATABRICKS_TOKEN = process.env.DATABRICKS_AUTH_TOKEN;
    const DATABRICKS_JOB_ID = process.env.DATABRICKS_JOB_ID;
    if (!DATABRICKS_URL || !DATABRICKS_TOKEN) {
        throw new Error("DATABRICKS_URL and DATABRICKS_TOKEN must be set in environment variables");
    }
    const url = `${DATABRICKS_URL}/api/2.2/jobs/run-now`;
    const body = {
        job_id: DATABRICKS_JOB_ID,
        notebook_params: {
            pipeline_id,
            "pipeline_partition_key": user_id,
        }
    };
    const headers = {
        'Authorization': `Bearer ${DATABRICKS_TOKEN}`,
        'Content-Type': 'application/json'
    };
    const response = await axios.post(url, body, { headers });
    
    const database = client.database(process.env.COSMOS_PIPELINE);
    const container = database.container("data-coffee-pipeline-history");
    const run_id = response.data["run_id"];
    console.log("Pipeline run ID:", run_id);
    const item = {
        id: run_id.toString(),
        user_id,
        "pipeline_id": pipeline_id,
        "pipeline_name": pipeline_name,
        "pipeline_start_time": new Date().toISOString(),
        "pipeline_end_time": null,
        "pipeline_status": "running",
        "pipeline_message": null,
        "pipeline_logs": "",
        "status": "running",
        created_at: new Date().toISOString()
    };
    console.log("Pipeline History item to be created:", item);

    try {
        await container.items.upsert(item);
        return item;
    } catch (error) {
        console.error("Create pipeline History error:", error.message);
        throw new Error("Failed to create pipeline History");
    }
}

async function fetchAllPipelineHistoryByUserId(userID) {
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
    fetchAllPipelineByUserId,
    fetchPipelineById,
    fetchPipelineByWorkspaceId,
    updatePipeline,
    createPipeline,
    clonePipeline,
    deletePipeline,
    runPipelineJob,
    fetchAllPipelineHistoryByUserId
}