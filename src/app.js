import '@babel/polyfill'
import '@tensorflow/tfjs-core'
import '@tensorflow/tfjs-converter'
import './style.scss'

const THREE = require('three')
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

const scene = new THREE.Scene()

const light = new THREE.DirectionalLight( 0xffffff )
light.position.set( 40, 25, 10 )
light.castShadow = true
scene.add(light)

console.log(scene.scene)

const renderer = new THREE.WebGLRenderer()
renderer.setSize( window.innerWidth, window.innerHeight )
document.body.appendChild( renderer.domElement )
//var controls = new OrbitControls( camera, renderer.domElement );


const camera = new THREE.PerspectiveCamera( 45, window.innerWidth/window.innerHeight, 0.1, 3000 )
camera.position.z = 30

const material = new THREE.MeshPhongMaterial( { color: 0x000FF0, specular: 0xf22fff , shininess: 100, side: THREE.DoubleSide } )

const material2 = new THREE.MeshPhongMaterial( { color: 0xffff00, specular: 0xf22fff , shininess: 100, side: THREE.DoubleSide } )

const geometry = new THREE.BoxGeometry( 3, 3, 3,40,60,40,60 )

const cube = new THREE.Mesh(geometry, material)

scene.add(cube)

const geometryG = new THREE.Geometry(),
  geometryG2 = new THREE.Geometry(),
  materialG = new THREE.LineBasicMaterial({
    color: 'green'
  }),
  materialG2 = new THREE.LineBasicMaterial({
    color: 'cyan'
  })

const size = 4000,
  size2  = 5000,
  steps = 40,
  steps2 = 60

for (let i = -size; i <= size; i += steps) {
  //draw lines one way
  geometryG.vertices.push(new THREE.Vector3(-size, -0.04, i))
  geometryG.vertices.push(new THREE.Vector3(size, -0.04, i))

  //draw lines the other way
  geometryG.vertices.push(new THREE.Vector3(i, -0.04, -size))
  geometryG.vertices.push(new THREE.Vector3(i, -0.04, size))
}

for (let j = -size; j <= size; j += steps2) {
  //draw lines one way
  geometryG2.vertices.push(new THREE.Vector3(-size2, -0.04, j))
  geometryG2.vertices.push(new THREE.Vector3(size2, -0.04, j))

  //draw lines the other way
  geometryG2.vertices.push(new THREE.Vector3(j, -0.04, -size2))
  geometryG2.vertices.push(new THREE.Vector3(j, -0.04, size2))
}

const line = new THREE.Line(geometryG, materialG, THREE.LinePieces)
const line2 = new THREE.Line(geometryG2, materialG2, THREE.LinePieces)

line.position.y = - 200
line2.position.y = + 220




scene.add(line, line2)

var update = function() {

  line.rotation.y+=0.01
  line2.rotation.y+=0.01
  cube.rotation.x+=0.1
  cube.position.x+=0.1
}

function animate() {

  update()

  /* render scene and camera */
  renderer.render(scene,camera)
  requestAnimationFrame(animate)
}



requestAnimationFrame(animate)
