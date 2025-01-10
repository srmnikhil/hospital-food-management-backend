const connectToMongo = require("./db");
const express = require('express');
const cors = require('cors');
connectToMongo();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", require("./routes/authenticationRoute"));
app.use("/api/manager", require("./routes/managerRoute"));
app.use("/api/pantry", require("./routes/pantryRoute"));
app.use("/api/delivery", require("./routes/deliveryRoute"));

const port = process.env.PORT||5000;
app.listen(port, () => {
  console.log(`Backend running on port ${port}`);
})