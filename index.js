const connectToMongo = require("./db");
const express = require('express');
const cors = require('cors');
connectToMongo();

const app = express();

app.use(cors());
app.use(express.json());

const port = process.env.PORT||5000;
app.listen(port, () => {
  console.log(`Backend running on port ${port}`);
})