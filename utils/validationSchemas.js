const { z } = require("zod");

const baseSchema = z.object({
  sourceName: z.string().min(1, "Source name is required"),
  sourceType: z.string().min(1, "Source type is required"),
  location: z.string().min(1, "Location is required"),
  prompt: z.string().optional(),
});

const getValidationSchema = (sourceType, location) => {
  let schema = baseSchema;

  if (sourceType === "sql" && location === "on-prem") {
    return schema.extend({
      host: z.string().min(1, "Host is required"),
      port: z.string().min(1, "Port is required"),
      dbName: z.string().min(1, "Database name is required"),
      username: z.string().min(1, "Username is required"),
      password: z.string().min(1, "Password is required"),
    });
  }

  if (sourceType === "sql" && location === "cloud") {
    return schema.extend({
      connectionString: z.string().min(1, "Connection string is required"),
      cloudProvider: z.string().min(1, "Cloud provider is required"),
      authMethod: z.string().min(1, "Auth method is required"),
    });
  }

  if (sourceType === "oracle" && location === "on-prem") {
    return schema.extend({
      host: z.string().min(1, "Host is required"),
      port: z.string().min(1, "Port is required"),
      sid: z.string().min(1, "SID/Service name is required"),
      username: z.string().min(1, "Username is required"),
      password: z.string().min(1, "Password is required"),
    });
  }

  if (sourceType === "oracle" && location === "cloud") {
    return schema.extend({
      connectionString: z.string().min(1, "Connection string is required"),
      cloudProvider: z.string().min(1, "Cloud provider is required"),
      authMethod: z.string().min(1, "Auth method is required"),
    });
  }

  if (sourceType === "postgresql" && location === "on-prem") {
    return schema.extend({
      host: z.string().min(1, "Host is required"),
      port: z.string().min(1, "Port is required"),
      dbName: z.string().min(1, "Database name is required"),
      username: z.string().min(1, "Username is required"),
      password: z.string().min(1, "Password is required"),
    });
  }

  if (sourceType === "postgresql" && location === "cloud") {
    return schema.extend({
      connectionString: z.string().min(1, "Connection string is required"),
      cloudProvider: z.string().min(1, "Cloud provider is required"),
      authMethod: z.string().min(1, "Auth method is required"),
    });
  }

  if (sourceType === "mongodb" && location === "on-prem") {
    return schema.extend({
      host: z.string().min(1, "Host is required"),
      port: z.string().min(1, "Port is required"),
      database: z.string().min(1, "Database name is required"),
      username: z.string().min(1, "Username is required"),
      password: z.string().min(1, "Password is required"),
    });
  }

  if (sourceType === "mongodb" && location === "cloud") {
    return schema.extend({
      atlasUri: z.string().min(1, "MongoDB Atlas URI is required"),
      authMethod: z.string().min(1, "Auth method is required"),
    });
  }

  if (sourceType === "files" && location === "on-prem") {
    return schema.extend({
      filePath: z.string().min(1, "File path is required"),
      fileFormat: z.string().min(1, "File format is required"),
    });
  }

  if (sourceType === "files" && location === "cloud") {
    return schema.extend({
      containerName: z.string().min(1, "Container name is required"),
      fileFormat: z.string().min(1, "File format is required"),
      authType: z.string().min(1, "Auth type is required"),
    });
  }

  if (sourceType === "blob" && location === "on-prem") {
    return schema.extend({
      uncPath: z.string().min(1, "UNC/Mount path is required"),
      fileAuth: z.string().optional(),
    });
  }

  if (sourceType === "blob" && location === "cloud") {
    return schema.extend({
      blobUri: z.string().min(1, "Blob URI / S3 bucket URL is required"),
      accessKey: z.string().min(1, "Access key is required"),
      sasToken: z.string().optional(),
    });
  }

  if (sourceType === "rest" && location === "on-prem") {
    return schema.extend({
      baseUrl: z.string().min(1, "Base URL is required"),
      headers: z.string().optional(),
      authType: z.string().min(1, "Auth type is required"),
      proxy: z.string().optional(),
    });
  }

  if (sourceType === "rest" && location === "cloud") {
    return schema.extend({
      baseUrl: z.string().min(1, "Base URL is required"),
      authType: z.string().min(1, "Auth type is required"),
      region: z.string().optional(),
    });
  }

  if (sourceType === "datawarehouse" && location === "on-prem") {
    return schema.extend({
      host: z.string().min(1, "Host is required"),
      port: z.string().min(1, "Port is required"),
      dbName: z.string().min(1, "Database is required"),
      username: z.string().min(1, "Username is required"),
      password: z.string().min(1, "Password is required"),
    });
  }

  if (sourceType === "datawarehouse" && location === "cloud") {
    return schema.extend({
      cloudDwUri: z.string().min(1, "Cloud DW URI is required"),
      authKey: z.string().optional(),
      oauthToken: z.string().optional(),
      region: z.string().min(1, "Region is required"),
    });
  }

  return schema;
};

const getPatchValidationSchema = (sourceType, location) => {
  const fullSchema = getValidationSchema(sourceType, location);
  return fullSchema.partial();
};

module.exports = { getValidationSchema, getPatchValidationSchema };
