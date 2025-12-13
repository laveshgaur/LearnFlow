const express = require("express");
require("dotenv").config();
const cors = require("cors");

const connectDB = require("./config/db");

const app = express();

// middleware
app.use(cors());
app.use(express.json());

// database
connectDB();

// test route
app.get("/", (req, res) => {
  res.send("LearnFlow API is running 🚀");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`LearnFlow server running on port ${PORT}`);
});
