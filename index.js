require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyparser = require('body-parser')
const dns = require('node:dns')
const mongoose = require('mongoose')
// Basic Configuration
const mongoURI = "mongodb+srv://nakshatragarg678:nakshatragarg678@cluster0.wuapmz3.mongodb.net/url_short?retryWrites=true&w=majority"
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,

})
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch(error => {
    console.error('Error connecting to MongoDB:', error);
  });
const port = process.env.PORT || 3000;

const URLSchema = new mongoose.Schema(
  {
    original_url : {
      type: String, 
      required:true,
      unique:true
    },
    short_url : {
      type:String, 
      required:true,
      unique:true
    }
  }
)

let URLModel = mongoose.model("url",URLSchema)

app.use(cors());
app.use(express.json())
app.use("/", bodyparser.urlencoded({ extended: true }))
app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});


app.get("/api/shorturl/:short_url", (req,res) => {
  let short_url = req.params.short_url
  URLModel.findOne({short_url:short_url}).then((foundURL) => {
    if(foundURL){
      original_url = foundURL.original_url
      res.redirect(original_url)
    }
    else{
      res.json({message:"Short url not found"})
    }
  })
})


// Your first API endpoint
app.post('/api/shorturl', (req, res) => {
  let url = req.body.url
  try {
    urlObj = new URL(url)

    dns.lookup(urlObj.hostname, (err, address) => {

      if (!address) {
        res.json({ error: "Invalid Url" })

      } else {

        let original_url = urlObj.href
        URLModel.find({}).sort(
          {short_url:"desc"}
        ).limit(1).then((latestURL) => {
          if(latestURL.length>0){
            short_url = parseInt(latestURL[0].short_url) + 1
          }
          resobj = {
            original_url:original_url,
            short_url:short_url
          }
          let newUrl = new URLModel(resobj)
          newUrl.save()
          res.json(resobj)
        })
        
        
     
      }
    })
  } catch {
    res.json({ error: "Invalid Url" })
  }
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
