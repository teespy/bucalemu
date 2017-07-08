var $ = require("jquery");
var jimp = require('jimp')
var arrayBufferToBuffer = require('arraybuffer-to-buffer')
var config = require('./config')

var jimpApp = {
  fetchFromUrl: function (imgUrl) {
    // returns a Promise, the Promise is resolved with a jimp image object created from imgUrl
    return new Promise(
      function (resolve, reject) {
        fetch(imgUrl)
          .then(function (response) { return response.arrayBuffer() })
          .then(function (imgArrayBuffer) {
            let imgBuffer = arrayBufferToBuffer(imgArrayBuffer)
            let jImage = jimp.read(imgBuffer)
            return jImage
          })
          .then(function (jimpImage) { resolve(jimpImage) })
      }
    )
  },

  getSimilarity: function (jImage1, jImage2) {
    // returns a similarity index for jImage1 and jImage2, 0 for totally different and 1 for equal
    // for now very simple, may need to make it more complicated in the future
    let pixelDifference = jimp.diff(jImage1, jImage2).percent  // pixel difference
    let hammingDistance = jimp.distance(jImage1, jImage2)      // hamming distance

    let similarityIndex = 1 - Math.min(pixelDifference, hammingDistance)

    return similarityIndex
  },

  init: function () {
    /*
        let bartSimpson = 'http://pre10.deviantart.net/cfcd/th/pre/i/2004/03/2/8/rolling_stone_bart.jpg'
    
        console.log("about to call this.fetchFromUrl()")
        this.fetchFromUrl(bartSimpson)
          .then(function (bartImage) {
            console.log("fetched bart!, he loks like this")
            console.log(bartImage)
            console.log("Bart's hash is")
            console.log(bartImage.hash())
          })
    */
  }
}

var app = {
  previousImgData: false,

  previousJImage: false,

  startCamera: function () {

    let cameraWidth = parseInt($(window).width() * 0.5 - 20);
    let cameraHeight = parseInt(($(window).width() * 0.5) * 640 / 480);
    let top = parseInt($(window).height() - cameraHeight - 5)
    let left = parseInt($(window).width() - cameraWidth - 5)
    
    CameraPreview.startCamera({ x: left, y: top, width: cameraWidth, height: cameraHeight, camera: "back", toBack: true, previewDrag: false, tapPhoto: true });
  },

  sendBase64ToServer: function (base64) {
    console.log(config)
    var httpPost = new XMLHttpRequest(),
      path = config.postImageUrl,
      data = JSON.stringify({ image: base64 })

    httpPost.onreadystatechange = function (err) {
      if (httpPost.readyState == 4 && httpPost.status == 200) {
        console.log(httpPost.responseText)
      } else {
        console.log(err)
      }
    }

    // Set the content type of the request to json since that's what's being sent
    httpPost.open("POST", path, true)
    httpPost.setRequestHeader('Content-Type', 'application/json')
    httpPost.send(data)
  },

  uploadPicture: function () {
    console.log("status: uploading picture")
    console.log(app.previousImgData)
    app.sendBase64ToServer(app.previousImgData)
  },

  takePicture: function () {
    console.log("status: taking picture")
    CameraPreview.takePicture({ width: 640, height: 480, quality: 85 }, function (imgData) {
      let imgBuffer = Buffer.from(imgData[0], 'base64')
      jimp.read(imgBuffer).then(function (jImage) {
        console.log("status: just read buffer")
        if (app.previousJImage) {
          let similarity = parseInt(jimpApp.getSimilarity(jImage, app.previousJImage) * 100)

          $("#similarityScore").html(similarity.toString() + "%<br/>similares")

          if (similarity >= 80) {
            $("#similarityScore").addClass('green').removeClass('red')
          } else {
            $("#similarityScore").addClass('red').removeClass('green')
          }
        }

        console.log("status: switching images")
        document.getElementById('pictureA').src = 'data:image/jpeg;base64,' + imgData[0]
        if (app.previousImgData) {
          document.getElementById('pictureB').src = 'data:image/jpeg;base64,' + app.previousImgData
        }

        app.previousImgData = imgData[0]
        app.previousJImage = jImage
      })
    });
  },

  show: function () {
    CameraPreview.show()
  },

  init: function () {
    this.startCamera()
    this.show()

    let windowWidth = parseInt($(window).width())
    let windowHeight = parseInt($(window).height())

    let pictureFrameWitdh = parseInt($(window).width() * 0.5 - 20)
    let pictureFrameHeight = parseInt(($(window).width() * 0.5) * 640 / 480)

    $("#pictureB").width(pictureFrameWitdh)
    $("#pictureB").height(pictureFrameHeight)
    $("#pictureB").css('left', "5px")
    $("#pictureB").css('top', "5px")

    $("#pictureA").width(pictureFrameWitdh)
    $("#pictureA").height(pictureFrameHeight)
    $("#pictureA").css('left', "5px")
    $("#pictureA").css('top', parseInt(windowHeight - $("#pictureA").height() - 5) + "px")

    $("#takePictureButton").css('left', parseInt(windowWidth
                                               - $("#takePictureButton").outerWidth()
                                               - 10)
                                       + "px")
    $("#takePictureButton").css('top', parseInt(windowHeight
                                              - pictureFrameHeight
                                              + 5)
                                       + "px")

    $("#uploadButton").css('left', parseInt(pictureFrameWitdh
                                          - $("#uploadButton").outerWidth()
                                          - 5)
                                   + "px")
    $("#uploadButton").css('top', parseInt(windowHeight
                                         - pictureFrameHeight
                                         + 5)
                                  + "px")

    $("#similarityScoreDiv").width(pictureFrameWitdh)
    $("#similarityScoreDiv").height(windowHeight - 2*pictureFrameHeight - 20)
    $("#similarityScoreDiv").css('left', "5px")
    $("#similarityScoreDiv").css('top', parseInt(pictureFrameHeight + 10) + "px")

    document.getElementById('takePictureButton').addEventListener('click', this.takePicture, false);
    document.getElementById('uploadButton').addEventListener('click', this.uploadPicture, false);

    jimpApp.init();
  }
};

document.addEventListener('deviceready', function () { app.init() }, false)

//document.addEventListener('deviceready', app.init(), false) // for some reason this throws a warning
