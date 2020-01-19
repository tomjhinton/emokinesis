import '@babel/polyfill'
import '@tensorflow/tfjs-core'
import '@tensorflow/tfjs-converter'
import './style.scss'


import * as bodyPix from '@tensorflow-models/body-pix';
console.log(bodyPix)


const webcamElement = document.getElementById('webcam')
const canvas = document.getElementById('canvas')
function setupWebcam() {
  return new Promise((resolve, reject) => {
    const navigatorAny = navigator
    navigator.getUserMedia = navigator.getUserMedia ||
            navigatorAny.webkitGetUserMedia || navigatorAny.mozGetUserMedia ||
            navigatorAny.msGetUserMedia
    if (navigator.getUserMedia) {
      navigator.getUserMedia({ video: true },
        stream => {
          webcamElement.srcObject = stream
          webcamElement.addEventListener('loadeddata', () => resolve(), false)
        },
        error => reject())
    } else {
      reject()
    }
  })
}



async function loadAndPredict() {
  const net = await bodyPix.load(/** optional arguments, see below **/);

  /**
   * One of (see documentation below):
   *   - net.segmentPerson
   *   - net.segmentPersonParts
   *   - net.segmentMultiPerson
   *   - net.segmentMultiPersonParts
   * See documentation below for details on each method.
    */
    async function draw(){
      window.requestAnimFrame = (function(){
    return  window.requestAnimationFrame       ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame    ||
        window.oRequestAnimationFrame      ||
        window.msRequestAnimationFrame     ||
        function( callback ){
            window.setTimeout(callback, 1000 / 60);
        };
})();
      const camera = document.getElementById('webcam');
  const canvasPerson = document.getElementById("canvas");
  const multiplier = 0.75;
  const outputStride = 16;
  const segmentationThreshold = 0.5;
  let contextPerson = canvasPerson.getContext('2d');
  let currentStream;
  let deviceIds = [];
  let selectedDevice;
  let cameraFrame;
  let currentBGIndex = 0;

  function detectBody(){
    net.segmentPerson(camera, outputStride, segmentationThreshold)
    .catch(error => {
        alert("Fail to segment person");
    })
    .then(personSegmentation => {
        drawBody(personSegmentation);

    });
    cameraFrame = window.requestAnimFrame(detectBody);
}

function drawBody(personSegmentation)
{
    contextPerson.drawImage(camera, 0, 0, camera.width, camera.height);
    var imageData = contextPerson.getImageData(0,0, camera.width, camera.height);
    var pixel = imageData.data;
    for (var p = 0; p<pixel.length; p+=4)
    {
      if (personSegmentation.data[p/4] == 0) {
          pixel[p+3] = 0;
      }
    }
    contextPerson.imageSmoothingEnabled = true;
    contextPerson.putImageData(imageData,0,0);
}
detectBody()
}
draw()



// setInterval(function () {
//   draw()
//
// }, 10)

}
loadAndPredict()
setupWebcam()
