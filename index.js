const express = require('express');
require('dotenv').config()
const cors = require('cors')
const port = process.env.PORT || 3000;
const app = express()

app.use(cors())
app.use(express.json())


const { MongoClient, ServerApiVersion } = require('mongodb');
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(process.env.MONGODB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
async function run() {
  try {
    const database = client.db('rentify-car')
    const carCollection  = database.collection('cars')
   app.get('/cars',async(req,res)=>{
    const allCars= await carCollection.find().toArray()
    console.log(allCars);
    res.send(allCars)
   })
    
   app.post('/add-car',async(req,res)=>{
    const carData = req.body
      console.log(carData);
  const result= await carCollection.insertOne(carData)
  res.send(result)
   })




    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error

  }
}
run().catch(console.dir);

app.get('/',(req,res)=>{
    res.send('welcome to rentify car server')
})
app.listen(port,()=>{
    console.log('server running');
})