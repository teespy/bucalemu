var arrayBufferToBuffer = require('arraybuffer-to-buffer')
var jimp = require('jimp')

var jimpApp = {
  fetchFromUrl: function (imgUrl) {
    // returns a Promise, the Promise is resolved with a jimp image object
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

  init: function () {
    let bartSimpson = 'http://pre10.deviantart.net/cfcd/th/pre/i/2004/03/2/8/rolling_stone_bart.jpg'

    console.log("about to call this.fetchFromUrl()")
    this.fetchFromUrl(bartSimpson)
      .then(function (bartImage) {
        console.log("fetched bart!, he loks like this")
        console.log(bartImage)
        console.log("Bart's hash is")
        console.log(bartImage.hash())
      })
  }
}

var app = {
  previosImgData: false,
  
  previousJImage: false,

  startCamera: function () {
    let width = parseInt(window.screen.width * 0.5)
    let height = parseInt((window.screen.width * 0.5)*640/480)
    let x = parseInt((window.screen.width - width)/2)
    let y = 5
    CameraPreview.startCamera({ x: x, y: y, width: width, height: height, camera: "back", toBack: false, previewDrag: false, tapPhoto: true });
  },

  takePicture: function () {
    CameraPreview.takePicture({width:640, height:480, quality: 85}, function (imgData) {
      let imgBuffer = Buffer.from(imgData[0], 'base64')
      jimp.read(imgBuffer).then(function (jImage){
        if (this.previousJImage) {
          let diff = jimp.diff(jImage, this.previousJImage)           // pixel difference
          let distance = jimp.distance(jImage, this.previousJImage)   // hamming distance
          let similarity = Math.max(parseInt((1 - diff.percent) * 100), parseInt((1 - distance)*100))
          
          document.getElementById('similarityScore').innerHTML = similarity.toString() + "% similares"
          document.getElementById('pixelDistance').innerHTML = "Pixel distance: " + diff.percent.toString()
          document.getElementById('hammingDistance').innerHTML = "Hamming distance: " + distance.toString()
        }

        document.getElementById('pictureA').src = 'data:image/jpeg;base64,' + imgData
        document.getElementById('pictureB').src = 'data:image/jpeg;base64,' + this.previousImgData

        this.previousImgData = imgData
        this.previousJImage = jImage
      })
    });
  },

  show: function () {
    CameraPreview.show();
  },

  init: function () {
    this.startCamera()
    this.show()

    document.getElementById('pictureA').width = parseInt(window.screen.width * 0.4)
    document.getElementById('pictureA').height = parseInt((window.screen.width * 0.4)*640/480)
    document.getElementById('pictureB').width = parseInt(window.screen.width * 0.4)
    document.getElementById('pictureB').height = parseInt((window.screen.width * 0.4)*640/480)
    
    document.getElementById('pictureDiv').style.marginTop = parseInt((window.screen.width * 0.5)*640/480 + 10).toString() + "px"

    document.getElementById('takePictureButton').addEventListener('click', this.takePicture, false);

    jimpApp.init();
  }
};

document.addEventListener('deviceready', function () { app.init() }, false)
//document.addEventListener('deviceready', app.init(), false) // for some reason this throws a warning
