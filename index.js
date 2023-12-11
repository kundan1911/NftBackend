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

 
const calculateExpiryDate=(selectedOption)=> {
  const currentDate = new Date();
  
  // Define the time duration based on the selected option
  let timeDuration;
  switch (selectedOption) {
    case '1 day':
      timeDuration = 1;
      break;
    case '3 days':
      timeDuration = 3;
      break;
    case '7 days':
      timeDuration = 7;
      break;
    case '15 days':
      timeDuration = 15;
      break;
    default:
      // Handle default case or provide a default duration
      timeDuration = 1;
  }
      const expiryDate = new Date(currentDate);
      expiryDate.setDate(currentDate.getDate() + timeDuration);
    
      // Return the formatted expiry date
      const formattedExpiryDate =" "+ `${expiryDate.getDate()}/${expiryDate.getMonth() + 1}/${expiryDate.getFullYear()}`;
      console.log(formattedExpiryDate)
      return formattedExpiryDate;
  }

const postSchema = new mongoose.Schema({
  SenderNft: String,
  ReceiverNft:String,
  expiryDate: String,
  imageUrl1: String,
  imageUrl2: String,
  chainId:Number
});

const orderSchema = new mongoose.Schema({
  orderId: String,
  signedOrder:String,
  takerData:String,
  makerAddr:String,
  makerNftImg:String,
  takerAddr: String,
  takerNftImg:String
});
// Create a model based on the schema
const Post = mongoose.model('Post', postSchema);
const Order = mongoose.model('Order', orderSchema);
// Middleware to parse JSON in the request body
app.use(bodyParser.json());

// Route to save post data
app.post('/savePostData', async (req, res) => {
  try {
    // Extract data from the request body
    const { SenderNft,ReceiverNft, expiryDate, imageUrl1, imageUrl2,chainId } = req.body;
    console.log(req.body)
    // Create a new Post document
    const expyDate=calculateExpiryDate(expiryDate)
    console.log(expyDate)
    const newPost = new Post({
      SenderNft,
      ReceiverNft,
      expiryDate: expyDate,
      imageUrl1,
      imageUrl2,
      chainId
    });

    // Save the post to the database
    await newPost.save();

    res.status(201).json({ message: 'Post data saved successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/saveSignedOrders', async (req, res) => {
  try {
    // Extract data from the request body
    const { orderId,signedOrder,takerData,makerAddr,makerNftImg,takerAddr,takerNftImg } = req.body;
    console.log(req.body)
    // Create a new Post document
    const newPost = new Order({
      orderId,
      signedOrder,
      takerData,
      makerAddr,
      makerNftImg,
      takerAddr,
takerNftImg
    });

    // Save the post to the database
    await newPost.save();

    res.status(201).json({ message: 'order data saved successfully' });
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

app.get('/displayChainIdPost', async (req, res) => {
  try {
    // Retrieve all posts from the database
    const { chainId } = req.query;
    const posts = await Post.find({ chainId: Number(chainId) });
 // Check if chainId is provided in the query
 if (!chainId) {
  return res.status(400).json({ error: 'chainId parameter is missing' });
}
    // Send the posts as JSON response
    res.status(200).json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Route to display all order data
app.get('/displayOrderData', async (req, res) => {
  try {
    // Retrieve all posts from the database
    console.log("displayOrderData")
    const orders = await Order.find();

    // Send the posts as JSON response
    res.status(200).json(orders);
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
