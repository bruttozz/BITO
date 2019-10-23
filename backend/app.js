const CHARTS_EMBEDDING_BASE_URL = '~REPLACE~CHARTS_EMBEDDING_BASE_URL';
const CHARTS_TENANT_ID = '~REPLACE~CHARTS_TENANT_ID';
const EMBEDDING_SIGNING_KEY = '~REPLACE~EMBEDDING_SIGNING_KEY';
const EXPIRY_TIME_SECONDS = 300;
const FILTER_DOCUMENT = null;
const AUTOREFRESH_TIME_SECONDS = null;

const express = require("express");
const crypto = require('crypto');
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const Post = require("./models/post");

const app = express();
const router = express.Router();

var personalRouter = require('./routes/personal');
var aboutRouter = require('./routes/about');
var chartRouter = require('./routes/chart');

mongoose.connect("mongodb+srv://test:lclc0610@bruttocluster-p4qft.mongodb.net/fullstack?retryWrites=true&w=majority",
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => {
    console.log("Connected to database!");
  })
  .catch(() => {
    console.log("Connection failed!");
  });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, DELETE, OPTIONS"
  );
  next();
});

app.use('/personal', personalRouter);
app.use('/about', aboutRouter);
app.use('/chart', chartRouter);

app.get('/api/embeddedchart/:id', (req, res) => {
  const timestamp = Math.floor(Date.now() / 1000);
  let payload = `id=${req.params.id}&tenant=${CHARTS_TENANT_ID}&timestamp=${timestamp}&expires-in=${EXPIRY_TIME_SECONDS}`;
  if (FILTER_DOCUMENT) {
    payload += `&filter=${encodeURIComponent(JSON.stringify(FILTER_DOCUMENT))}`;
  }
  if (AUTOREFRESH_TIME_SECONDS) {
    payload += `&autorefresh=${AUTOREFRESH_TIME_SECONDS}`;
  }
  const hmac = crypto.createHmac('sha256', EMBEDDING_SIGNING_KEY);
  hmac.update(payload);
  const signature = hmac.digest('hex');
  // generate url for iframe
  const url = `${CHARTS_EMBEDDING_BASE_URL}/embed/charts?${payload}&signature=${signature}`;
  res.send(url);
});

app.post("/api/posts", (req, res, next) => {
  const post = new Post({
    title: req.body.title,
    content: req.body.content
  });
  console.log("Post Added.");
  post.save().then(createdPost => {
    res.status(201).json({
      message: "Post added successfully",
      postId: createdPost._id
    });
  });
});

app.get("/api/posts", (req, res, next) => {
  Post.find().then(documents => {
    res.status(200).json({
      message: "Posts fetched successfully!",
      posts: documents
    });
  });
  console.log("Get data from local DB.");
});

app.delete("/api/posts/:id", (req, res, next) => {
  Post.deleteOne({ _id: req.params.id }).then(result => {
    console.log(result);
    res.status(200).json({ message: "Post deleted!" });
  });
  console.log("posts deleted");
});

app.use(express.static('static'));

module.exports = app;
