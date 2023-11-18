const express = require("express");
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
const port = 5001;
const Moralis = require("moralis").default;
const cors = require("cors");

require("dotenv").config({ path: ".env" });

app.use(cors());
app.use(express.json());

const MORALIS_API_KEY = process.env.MORALIS_API_KEY;


mongoose.connect('mongodb+srv://admin-kundan:Kundan%4019@cluster0.0qyqn.mongodb.net/NFTDB?retryWrites=true&w=majority');
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error: "));
db.once("open", function () {
  console.log("Connected successfully");
});

const postSchema = new mongoose.Schema({
  data: String,
  expiryDate: String,
  imageUrl1: String,
  imageUrl2: String,
});

// Create a model based on the schema
const Post = mongoose.model('Post', postSchema);

// Middleware to parse JSON in the request body
app.use(bodyParser.json());

// Route to save post data
app.post('/savePostData', async (req, res) => {
  try {
    // Extract data from the request body
    const { data, expiryDate, imageUrl1, imageUrl2 } = req.body;

    // Create a new Post document
    const newPost = new Post({
      data,
      expiryDate,
      imageUrl1,
      imageUrl2,
    });

    // Save the post to the database
    await newPost.save();

    res.status(201).json({ message: 'Post data saved successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Route to display all post data
app.get('/displayPostData', async (req, res) => {
  try {
    // Retrieve all posts from the database
    const posts = await Post.find();

    // Send the posts as JSON response
    res.status(200).json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.get("/getnfts", async (req, res) => {
  try {
    const { query } = req;

    const response = await Moralis.EvmApi.nft.getWalletNFTs({
      address: query.address,
      chain: query.chain,
    });
    console.log(query.address, query.chain)
    console.log(response)
    return res.status(200).json(response);
  } catch (e) {
    console.log(`Something went wrong ${e}`);
    return res.status(400).json();
  }
});

app.get("/getContractNFTs", async (req, res) => {
  try {
    const { query } = req;

    const response = await Moralis.EvmApi.nft.getContractNFTs({
      address: query.address,
      chain: query.chain,
    });
    console.log(query.address, query.chain)
    console.log(response)
    return res.status(200).json(response);
  } catch (e) {
    console.log(`Something went wrong ${e}`);
    return res.status(400).json();
  }
});

Moralis.start({
  apiKey: MORALIS_API_KEY,
}).then(() => {
  app.listen(port, () => {
    console.log(`Listening for API Calls`);
  });
});