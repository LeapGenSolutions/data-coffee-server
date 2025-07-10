const { BlobServiceClient } = require('@azure/storage-blob');
const express = require('express');
const cors = require('cors');

const app = express();

const sourceRoute = require('./routes/SourceRoute');


const allowedOrigin = "*"; // set this in .env
app.use(express.json());
app.use(cors({
  origin: allowedOrigin,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

const httpServer = require('http').createServer(app);

const PORT = process.env.PORT || 8080;

// Hello World API
app.get('/api/hello', (req, res) => {
  res.send('Hello world');
});



const connectionRoute = require('./routes/connectionRoute');



app.use("/api/source", sourceRoute);
app.use("/api/connection", connectionRoute);

httpServer.listen(PORT, () =>
  console.log(`server is running on port: ${PORT}`)
);
