const express = require('express');
require('dotenv').config();
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const port = process.env.PORT || 3000;
const app = express();

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mofktee.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
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
      .sort({ dateAdded: -1 }) 
      .limit(8)
      .toArray();
    res.send(cars);
  } catch (err) {
    res.status(500).send({ error: 'Failed to fetch homepage cars' });
  }
});

app.get('/cars/:id', async (req, res) => {
  const id = req.params.id;

  try {
    const car = await carCollection.findOne({ _id: new ObjectId(id) });
    if (!car) {
      return res.status(404).send({ error: 'Car not found' });
    }
    res.send(car);
  } catch (error) {
    res.status(400).send({ error: 'Invalid ID format' });
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
