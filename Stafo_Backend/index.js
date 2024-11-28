// server.js

const express = require('express');
const multer = require('multer');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
  },
});

const upload = multer({ storage });

// MongoDB connection
const uri = 'mongodb://localhost:27017/';
let client;

const connectDB = async () => {
  try {
    client = new MongoClient(uri);
    await client.connect();
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Investment Schema & Model
const investmentSchema = {
  amount: Number,
  currency: String,
  ideaId: String,
  userAddress: String,
};

// Endpoint to upload an idea and file
app.post('/ideas', upload.single('file'), async (req, res) => {
  const { idea, title, userAddress, visibility } = req.body; // Added visibility here
  const filePath = req.file ? req.file.path : null;

  try {
    const collection = client.db('idea_uploads').collection('ideas');
    const result = await collection.insertOne({
      idea,
      title,
      file: filePath,
      userAddress,
      visibility: visibility || 'public', // Set visibility based on user input or default to public
    });

    res.status(201).json({
      id: result.insertedId.toString(),
      idea,
      title,
      file: filePath,
      userAddress,
      visibility: visibility || 'public', // Return the visibility set by the user or default
    });
  } catch (err) {
    console.error('Error inserting idea:', err);
    res.status(500).json({ error: 'Failed to save idea. ' + (err.message || '') });
  }
});

// Endpoint to get all ideas for a specific user address
app.get('/ideas/:userAddress', async (req, res) => {
  const { userAddress } = req.params;
  try {
    const collection = client.db('idea_uploads').collection('ideas');
    const ideas = await collection.find({ userAddress }).toArray();
    res.json(ideas);
  } catch (err) {
    console.error('Error fetching ideas:', err);
    res.status(500).json({ error: 'Failed to fetch ideas. ' + (err.message || '') });
  }
});

// Endpoint to get all public ideas
app.get('/ideas', async (req, res) => {
  try {
    const collection = client.db('idea_uploads').collection('ideas');
    const publicIdeas = await collection.find({ visibility: 'public' }).toArray(); // Fetch only public ideas
    res.json(publicIdeas);
  } catch (err) {
    console.error('Error fetching public ideas:', err);
    res.status(500).json({ error: 'Failed to fetch public ideas. ' + (err.message || '') });
  }
});

// Investment endpoints
app.post('/investments', async (req, res) => {
  const { amount, currency, ideaId } = req.body;

  try {
    const investmentsCollection = client.db('idea_uploads').collection('investments');
    const result = await investmentsCollection.insertOne({
      amount,
      currency,
      ideaId,
    });

    res.status(201).json({
      id: result.insertedId.toString(),
      amount,
      currency,
      ideaId,
    });
  } catch (err) {
    console.error('Error inserting investment:', err);
    res.status(500).json({ error: 'Failed to save investment. ' + (err.message || '') });
  }
});


// Endpoint to fetch all investments
app.get('/investments', async (req, res) => {
  try {
    const investmentsCollection = client.db('idea_uploads').collection('investments');
    const investments = await investmentsCollection.find().toArray();
    res.json(investments);
  } catch (err) {
    console.error('Error fetching investments:', err);
    res.status(500).json({ error: 'Failed to fetch investments. ' + (err.message || '') });
  }
});

// Start the server
const startServer = async () => {
  await connectDB();
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
};

startServer();
