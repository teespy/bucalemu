var express = require('express')
var bodyParser  = require('body-parser')
var app = express()

app.use(bodyParser.json())

app.post('/postimage', function (req, res, next) {
  base64Data = req.body.image

  filename = "uploads/" + (Math.floor(Date.now() / 1000)).toString() + ".jpg"
  require("fs").writeFile(filename, base64Data, 'base64', function(err) {
    if (err) {
      console.log(err);
    } else {
      console.log("just uploaded " + filename)
    }
  });
  
  res.send("done")
})

app.listen(7600, function () {
  console.log("Bucalemu's photos-mission server listening on port 7600")
})

