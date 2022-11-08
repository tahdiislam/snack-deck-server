const express = require("express");
const cors = require("cors");
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

async function run() {
  try {
    const Services = client.db("Snackdeckdb").collection("services");
    const Reviews = client.db("Snackdeckdb").collection("reviews");
    app.get("/services", async (req, res) => {
      const dataLimit = parseInt(req.query.limit);
      const cursor = Services.find({});
      if (dataLimit) {
        const storedServices = await cursor.limit(dataLimit).toArray();
        res.send({ storedServices });
      } else {
        const storedServices = await cursor.toArray();
        res.send({ storedServices });
      }
    });

    // get specific service 
    app.get("/services/:id",async (req, res) => {
      const id = req.params.id;
      const query = {_id: ObjectId(id)}
      const service = await Services.findOne(query)
      res.send({ service });
    })

    // get all reviews 
    app.get("/reviews/:id", async (req, res) =>{
      const id = req.params.id
      const query = { food_id : id};
      const sort = {date: -1}
      const cursor = Reviews.find(query)
      const result = await cursor.sort(sort).toArray();
      // const result = await cursor.toArray()
      res.send({result})
    });

    // services post method
    app.post("/services", async (req, res) => {
      const service = req.body;
      const result = await Services.insertOne(service);
      res.status(200).send({ result });
    });

    // review post method 
    app.post("/reviews", async(req, res) => {
      const review = req.body;
      const result = await Reviews.insertOne(review)
      res.send({result})
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
