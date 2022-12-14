const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

// connect db

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.rgyxe1r.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

// jwt verification
function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  // check authHeader validation
  if(!authHeader){
    return res.status(401).send({message: "unauthorized access"})
  }
  const token = authHeader.split(" ")[1]
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function(err, decoded){
    if(err){
      return res.status(403).send({message: "forbidden access"})
    }
    req.decoded = decoded;
    next()
  })
}

async function run() {
  try {
    const Services = client.db("Snackdeckdb").collection("services");
    const Reviews = client.db("Snackdeckdb").collection("reviews");
    const Blogs = client.db("Snackdeckdb").collection("blogs");

    // get all services with link and no limit
    app.get("/services", async (req, res) => {
      const dataLimit = parseInt(req.query.limit);
      const cursor = Services.find({});
      const sort = { date : -1};
      if (dataLimit) {
        const storedServices = await cursor.sort(sort).limit(dataLimit).toArray();
        res.send({ storedServices });
      } else {
        const storedServices = await cursor.sort(sort).toArray();
        res.send({ storedServices });
      }
    });

    // get specific service
    app.get("/services/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const service = await Services.findOne(query);
      res.send({ service });
    });

    // get all blogs
    app.get("/blogs", async(req, res) => {
      const cursor = Blogs.find({})
      const result = await cursor.toArray()
      res.send({result})
    })

    // get reviews by service id
    app.get("/reviews/:id", async (req, res) => {
      const id = req.params.id;
      const query = { food_id: id };
      const sort = { date: -1 };
      const cursor = Reviews.find(query);
      const result = await cursor.sort(sort).toArray();
      // const result = await cursor.toArray()
      res.send({ result });
    });

    // get reviews by email
    app.get("/reviews", verifyJWT, async (req, res) => {
      const decoded = req.decoded;
      
      // final verification
      if(decoded.email !== req.query.email){
        res.status(401).send({message: "unauthorized access"})
      }
      const email = req.query.email;
      const query = { email: email };
      const cursor = Reviews.find(query);
      const result = await cursor.toArray();
      res.send({ result });
    });

    // get limited review
    app.get("/limitedReviews", async (req, res) => {
      const reviewLimit = parseInt(req.query.limit);
      const sort = { date: -1 };
      const cursor = Reviews.find({});
      const result = await cursor.sort(sort).limit(reviewLimit).toArray();
      res.send({ result });
    });

    // give user a access token
    app.post("/jwt", (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1h",
      });
      res.status(200).send({ token });
    });

    // services post method
    app.post("/services", async (req, res) => {
      const service = req.body;
      const result = await Services.insertOne(service);
      res.status(200).send({ result });
    });

    // review post method
    app.post("/reviews", async (req, res) => {
      const review = req.body;
      const result = await Reviews.insertOne(review);
      res.send({ result });
    });

    // update review
    app.put("/reviews/:id", async (req, res) => {
      const id = req.params.id;
      const editedReview = req.body.updatedReviewText;
      const filter = { _id: ObjectId(id) };
      const option = { upsert: true };
      const updatedReview = {
        $set: {
          reviewText: editedReview,
        },
      };
      const result = await Reviews.updateOne(filter, updatedReview, option);
      res.send({ result });
    });

    // delete specific review
    app.delete("/reviews/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await Reviews.deleteOne(query);
      res.send({ result });
    });
  } finally {
  }
}
run().catch((err) => console.log(err));

app.get("/", (req, res) => {
  res.send("SnackDeck server is running.");
});

app.listen(port, () => {
  console.log(`SnackDeck server is running on port ${port}`);
});
