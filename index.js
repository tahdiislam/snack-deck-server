const express = require('express');
const cors = require("cors")
const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config()
const app = express()
const port = process.env.PORT || 5000;

// middleware
app.use(cors())
app.use(express.json())

// connect db


const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.rgyxe1r.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
    try{
        const Services = client.db("Snackdeckdb").collection("services");
        app.post("/services", async(req, res) => {
            const service = req.body;
            const result = await Services.insertOne(service)
            res.status(200).send({result})
        })
    }
    finally{
        
    }
}
run().catch(err => console.log(err))


app.get("/", (req, res) => {
    res.send("SnackDeck server is running.")
})

app.listen(port, () => {
    console.log(`SnackDeck server is running on port ${port}`);
})