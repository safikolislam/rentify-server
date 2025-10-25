const express = require('express');
require('dotenv').config();
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mofktee.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
});

async function run() {
    try {
        await client.connect();
        const database = client.db('rentify-car');
        const carCollection = database.collection('cars');

        app.get('/cars', async (req, res) => {
            try {
                const allCars = await carCollection.find().toArray();
                res.send(allCars);
            } catch {
                res.status(500).send({ error: 'Failed to fetch cars' });
            }
        });



        app.post('/add-car', async (req, res) => {
            try {
                const carData = req.body;
                if (!carData.addedBy) return res.status(400).send({ error: 'addedBy (user email) is required' });
                if (carData.price) carData.price = Number(carData.price);
                if (carData.features && !Array.isArray(carData.features)) {
                    carData.features = [carData.features];
                } else if (!carData.features) {
                    carData.features = [];
                }
                const result = await carCollection.insertOne({
                    ...carData,
                    dateAdded: new Date().toISOString(),
                });
                res.send(result);
            } catch (error) {
                res.status(400).send({ error: 'Failed to add car', details: error.message });
            }
        });

        app.get('/my-cars', async (req, res) => {
            const email = req.query.email;
            if (!email) return res.status(400).send({ error: 'Email is required' });
            try {
                const userCars = await carCollection.find({ addedBy: email }).toArray();
                res.send(userCars);
            } catch (error) {
                res.status(500).send({ error: 'Internal Server Error' });
            }
        });

app.get('/cars/:id', async (req, res) => {
            const id = req.params.id;
            if (!id || !ObjectId.isValid(id)) {
                return res.status(400).send({ error: 'Invalid car ID' });
            }
            try {
                const car = await carCollection.findOne({ _id: new ObjectId(id) });
                if (!car) {
                    return res.status(404).send({ error: 'Car not found' });
                }
                res.send(car);
            } catch (error) {
                console.error("Error fetching car by ID:", error);
                res.status(500).send({ error: 'Failed to fetch car details' });
            }
        });


        app.put('/cars/:id', async (req, res) => {
            const id = req.params.id;
            const updateData = req.body;
            if (updateData.price) updateData.price = Number(updateData.price);
            if (updateData.features && !Array.isArray(updateData.features)) {
                updateData.features = [updateData.features];
            } else if (!updateData.features) {
                updateData.features = [];
            }
            delete updateData._id;
            delete updateData.dateAdded;
            delete updateData.addedBy;
            try {
                const result = await carCollection.updateOne(
                    { _id: new ObjectId(id) },
                    { $set: updateData }
                );
                if (result.matchedCount === 0) return res.status(404).send({ error: 'Car not found' });
                res.send(result);
            } catch {
                res.status(500).send({ error: 'Failed to update car' });
            }
        });

        app.delete('/cars/:id', async (req, res) => {
            const id = req.params.id;
            try {
                const result = await carCollection.deleteOne({ _id: new ObjectId(id) });
                res.send(result);
            } catch {
                res.status(500).send({ error: 'Failed to delete car' });
            }
        });

    } catch {}
}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Welcome to Rentify Car Server');
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});




