const { MongoClient, ServerApiVersion, ObjectId, Admin } = require("mongodb");
const express = require("express");
const cors = require("cors");
var jwt = require("jsonwebtoken");
const app = express();
const port = 3000;

// middleware
// app.use(
//   cors({
//     origin: ["http://localhost:5173", " https://travelbdx.netlify.app"],
//     credentials: true,
//   })
// );
const corsOptions = {
  origin: "*",
  credentials: true,
  optionSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Welcome to TravelBDX Server!");
});

// touristBDX
// wnFkzurbv4Z8s6yp
const secret =
  "b8d9b289c04b24c46294376bdd479d31838799b9333311adc908b544922df00dbe094142de9177c3219a1680c2a11404cdb3f63d1bd9f6cc88630dec128793ec";

const uri = `mongodb+srv://touristBDX:wnFkzurbv4Z8s6yp@cluster0.gbcelyw.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

const userCollection = client.db("touristBDX").collection("users");
const blogsCollection = client.db("touristBDX").collection("blogs");
const packagesCollection = client.db("touristBDX").collection("packages");
const overviewCollection = client.db("touristBDX").collection("overview");
const tourGuidesCollection = client.db("touristBDX").collection("tourGuides");
const bookingsCollection = client.db("touristBDX").collection("bookings");
const wishCollection = client.db("touristBDX").collection("wish");
const touristStoryCollection = client
  .db("touristBDX")
  .collection("touristStory");

// jwt related api
app.post("/jwt", async (req, res) => {
  const user = req.body;
  console.log(user);
  const token = jwt.sign(user, secret, { expiresIn: "1h" });
  res.send({ token });
});

// middlewares
const verifyToken = (req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(401).send({ message: "unauthorized access" });
  }
  const token = req.headers.authorization.split(" ")[1];
  jwt.verify(token, secret, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: "unauthorized access" });
    }
    req.decoded = decoded;
    next();
  });
};

// use verify admin after verifyToken
const verifyAdmin = async (req, res, next) => {
  const email = req.decoded.email;
  const query = { email: email };
  const user = await userCollection.findOne(query);
  const isAdmin = user?.role === "admin";
  console.log(isAdmin);
  if (!isAdmin) {
    return res.status(403).send({ message: "forbidden access" });
  }
  next();
};

app.get("/users", async (req, res) => {
  const result = await userCollection.find().toArray();
  res.send(result);
});

app.get("/users/admin/:email", async (req, res) => {
  const email = req.params.email;

  const query = { email: email };
  const user = await userCollection.findOne(query);
  let admin = false;
  if (user) {
    admin = user?.role === "admin";
  }
  res.send({ admin });
});

app.post("/users", async (req, res) => {
  const user = req.body;
  const query = { email: user.email };
  const existingUser = await userCollection.findOne(query);
  if (existingUser) {
    return res.send({ message: "user already exist" });
  }
  const result = await userCollection.insertOne(user);
  res.send(result);
});

app.get("/blogs", async (req, res) => {
  const blogs = await blogsCollection.find().toArray();
  res.send(blogs);
});

app.patch("/users/admin/:id", async (req, res) => {
  const id = req.params.id;
  const fileter = { _id: new ObjectId(id) };
  const updatedDoc = {
    $set: {
      role: "admin",
    },
  };
  const result = await userCollection.updateOne(fileter, updatedDoc);
  res.send(result);
});

app.get("/blogs/:id", async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  const result = await blogsCollection.findOne(query);
  res.send(result);
});

app.get("/packages", async (req, res) => {
  const packages = await packagesCollection.find().toArray();
  res.send(packages);
});

app.get("/packages/:id", async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  const result = await packagesCollection.findOne(query);
  res.send(result);
});

// app.get("/package/tourType", async (req, res) => {
//   const type = req.params.tourType.toLocaleLowerCase();
//   const query = { tourType: type };
//   const result = await packagesCollection.find(query).toArray();
//   res.send(result);
// });

app.get("/packages/:tourType", async (req, res) => {
  const { tourType } = req.params;

  const tours = await packagesCollection.find({ tourType });
  res.json(tours);
});

app.post("/packages", async (req, res) => {
  const package = req.body;
  console.log(package);
  const resut = await packagesCollection.insertOne(package);
  res.send(resut);
});

app.get("/overview", async (req, res) => {
  const result = await overviewCollection.find().toArray();
  res.send(result);
});

app.get("/tourGuides", async (req, res) => {
  const result = await tourGuidesCollection.find().toArray();
  res.send(result);
});

app.get("/tourGuides/:id", async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  const result = await tourGuidesCollection.findOne(query);
  res.send(result);
});

app.get("/bookings", async (req, res) => {
  const queryEmail = req.query.email;
  const result = await bookingsCollection
    .find({ touristEmail: queryEmail })
    .toArray();
  res.send(result);
});

app.post("/bookings", async (req, res) => {
  const newBooking = req.body;
  const result = await bookingsCollection.insertOne(newBooking);
  res.send(result);
});

app.get("/wish", async (req, res) => {
  const queryEmail = req.query.email;
  const result = await wishCollection
    .find({ touristEmail: queryEmail })
    .toArray();
  res.send(result);
});

app.post("/wish", async (req, res) => {
  const newWish = req.body;
  const result = await wishCollection.insertOne(newWish);
  res.send(result);
});

app.delete("/wish/:id", async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  const result = await wishCollection.deleteOne(query);
  res.send(result);
});

app.get("/touristStory", async (req, res) => {
  const result = await touristStoryCollection.find().toArray();
  res.send(result);
});

app.get("/touristStory/:id", async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  const result = await touristStoryCollection.findOne(query);
  res.send(result);
});

// stats or analytics
app.get("/admin-stats", verifyToken, verifyAdmin, async (req, res) => {
  const users = await userCollection.estimatedDocumentCount();

  res.send({
    users,
  });
});

app.listen(port, () => {
  console.log(`TravelBDX Server is running at http://localhost:${port}`);
});
