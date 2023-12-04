// TravelBDX Backend Server
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => { res.send({ status: "healthy" }); });

app.post("/jwt", (req, res) => {
  const token = jwt.sign(req.body, "secretKey", { expiresIn: "7d" });
  res.send({ token });
});
