const { CosmosClient } = require("@azure/cosmos");
require("dotenv").config();

const endpoint = process.env.COSMOS_ENDPOINT;
const key = process.env.COSMOS_KEY;
const client = new CosmosClient({ endpoint, key });

const sourceDb = client.database(process.env.COSMOS_SOURCE);
const pipelineDb = client.database(process.env.COSMOS_PIPELINE);
const configDb = client.database(process.env.COSMOS_CONFIG);

async function getDashboardKpis({ email, from, to }) {
  // Convert date filters to ISO if present (future enhancement)
  const dateFilter = from && to
    ? ` AND c.pipeline_start_time >= "${new Date(from).toISOString()}" AND c.pipeline_start_time <= "${new Date(to).toISOString()}"`
    : "";

  // 1. Data Sources
  const sourcesContainer = sourceDb.container("data-coffee-source-configurations");
  const { resources: [dataSources] } = await sourcesContainer.items.query({
    query: "SELECT VALUE COUNT(1) FROM c WHERE c.user_id = @userID",
    parameters: [{ name: "@userID", value: email }],
  }).fetchAll();

  // 2. Total Pipelines
  const pipelineContainer = pipelineDb.container("data-coffee-pipeline-config");
  const { resources: [totalPipelines] } = await pipelineContainer.items.query({
    query: "SELECT VALUE COUNT(1) FROM c WHERE c.user_id = @userID",
    parameters: [{ name: "@userID", value: email }],
  }).fetchAll();

  // 3. Successful Pipelines
  const pipelineHistoryContainer = pipelineDb.container("data-coffee-pipeline-history");
  const { resources: [successPipelines] } = await pipelineHistoryContainer.items.query({
    query: `SELECT VALUE COUNT(1) FROM c WHERE c.user_id = @userID AND LOWER(c.pipeline_status) IN ('success', 'completed')${dateFilter}`,
    parameters: [{ name: "@userID", value: email }],
  }).fetchAll();

  // 4. Accessible Workspaces
  const workspaceContainer = configDb.container("data-coffee-workspaces");
  const { resources: [accessibleWorkspaces] } = await workspaceContainer.items.query({
    query: "SELECT VALUE COUNT(1) FROM c WHERE ARRAY_CONTAINS(c.subscribers, @userID)",
    parameters: [{ name: "@userID", value: email }],
  }).fetchAll();

  return {
    dataSources,
    totalPipelines,
    successPipelines,
    accessibleWorkspaces,
  };
}

module.exports = { getDashboardKpis };
