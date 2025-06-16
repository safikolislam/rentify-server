const express = require('express');
require('dotenv').config();
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const port = process.env.PORT || 3000;
const app = express();

app.use(cors());
app.use(express.json());

const client = new MongoClient(process.env.MONGODB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const database = client.db('rentify-car');
    const carCollection = database.collection('cars');


    app.get('/cars', async (req, res) => {
      const allCars = await carCollection.find().toArray();
      res.send(allCars);
    });
   
app.get('/cars/home', async (req, res) => {
  try {
    const cars = await carCollection.find()
      .sort({ dateAdded: -1 }) // newest first
      .limit(8)
      .toArray();
    res.send(cars);
  } catch (err) {
    res.status(500).send({ error: 'Failed to fetch homepage cars' });
  }
});


  
    app.post('/add-car', async (req, res) => {
      const carData = req.body;
      const result = await carCollection.insertOne({
        ...carData,
        dateAdded: new Date().toISOString(),
      });
      res.send(result);
    });


    app.delete('/cars/:id', async (req, res) => {
      const id = req.params.id;
      try {
        const result = await carCollection.deleteOne({ _id: new ObjectId(id) });
        res.send(result);
      } catch (error) {
        res.status(400).send({ error: 'Invalid ID format' });
      }
    });

    app.put('/cars/:id', async (req, res) => {
      const id = req.params.id;
      const updatedCar = req.body;
      try {
        const result = await carCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: updatedCar }
        );
        res.send(result);
      } catch (error) {
        res.status(400).send({ error: 'Invalid ID format' });
      }
    });

    await client.db('admin').command({ ping: 1 });
    console.log(' Connected to MongoDB!');
  } catch (err) {
    console.error(' MongoDB connection error:', err);
  }
}

run().catch(console.dir);


app.get('/', (req, res) => {
  res.send(' Welcome to Rentify Car Server');
});

app.listen(port, () => {
  console.log(` Server running on port ${port}`);
});
