const express = require('express');
const cors = require('cors');

const app = express();

const SourceRoute = require('./routes/SourceRoute');


const allowedOrigin = "*"; // set this in .env
app.use(express.json());
app.use(cors({
  origin: allowedOrigin,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

const httpServer = require('http').createServer(app);

const PORT = process.env.PORT || 8080;

app.get('/', (req, res) => {
    res.send("hello");
})

app.use("/source", SourceRoute);

httpServer.listen(PORT, () =>
  console.log(`server is running on port: ${PORT}`)
);
