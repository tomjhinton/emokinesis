import '@babel/polyfill'
import '@tensorflow/tfjs-core'
import '@tensorflow/tfjs-converter'
import './style.scss'
import '@babel/polyfill'
const THREE = require('three')
import Tone from 'tone'

import * as bodyPix from '@tensorflow-models/body-pix';
import * as faceapi from 'face-api.js'
const CANNON = require('cannon')
import './debug.js'
const webcamElement = document.getElementById('webcam')
const canvas = document.getElementById('canvas')
let playing = false
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
  let currentStream
  let deviceIds = []
  let selectedDevice
  let cameraFrame
  let currentBGIndex = 0

  function detectBody(){
    net.segmentPerson(camera, outputStride, segmentationThreshold)
    .catch(error => {
        alert("Fail to segment person");
    })
    .then(personSegmentation => {
        drawBody(personSegmentation);

    })
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




}
loadAndPredict()
Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
  faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
  faceapi.nets.faceExpressionNet.loadFromUri('/models')
]).then(setupWebcam())

let sad, surprised, happy

webcamElement.addEventListener('play', () => {
  const canvas = document.getElementById('canvas')
  const displaySize = { width: webcamElement.width, height: webcamElement.height }
  faceapi.matchDimensions(canvas, displaySize)
  setInterval(async () => {
    const detections = await faceapi.detectAllFaces(webcamElement, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions()
    const resizedDetections = faceapi.resizeResults(detections, displaySize)
if(resizedDetections[0] !== undefined){
    happy = resizedDetections[0].expressions.happy
    surprised = resizedDetections[0].expressions.surprised
  }

    //console.log(faceapi)
  }, 100)
})

var freeverb = new Tone.Freeverb().toMaster()
freeverb.dampening.value = 25
freeverb.roomSize.value = 0.7
var pingPong = new Tone.PingPongDelay('4n', 0.2).toMaster()
var autoWah = new Tone.AutoWah(50, 6, -30).toMaster()
var synthA = new Tone.DuoSynth().chain(freeverb, pingPong, autoWah).toMaster()
var synthB = new Tone.AMSynth().chain(freeverb, pingPong, autoWah).toMaster()
const notes = ['E4','F4','G4','A4','D4','E3','F3','G3','A3','D3']

const notesLow = ['E2','F2','G2','A2','D2','E3','F3','G3','A3','D3']
const drums = ['C3', 'D3', 'F3', 'E3', 'B3']
var sampler = new Tone.Sampler({
  'C3': 'assets/Clap.wav',
  'D3': 'assets/Kick.wav',
  'F3': 'assets/Snare.wav',
  'E3': 'assets/wood.wav',
  'B3': 'assets/daiko.wav',

}, function(){
  //sampler will repitch the closest sample
  //sampler.triggerAttack("D3")
  console.log('loaded')
  playing = true
}).toMaster()

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

let material = new THREE.MeshPhongMaterial( { color: 0x000FF0, specular: 0xf22fff , shininess: 100, side: THREE.DoubleSide } )





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

const line = new THREE.Line(geometryG, materialG, THREE.LineSegments)
const line2 = new THREE.Line(geometryG2, materialG2, THREE.LineSegments)

line.position.y = - 200
line2.position.y = + 220


let score = 0
let ballMeshes = []
let balls = []
let world,  playerMaterial, playerContactMaterial, platThreeArr = [], platCanArr = [], timeStep=1/60, ballBody, ballMesh, ballShape, ballMaterial, wallContactMaterial, mass, radius

scene.add(line, line2)

let groundBody, groundShape ,wallMaterial, platform
world = new CANNON.World()
  world.gravity.set(0,-20,0)
  world.broadphase = new CANNON.NaiveBroadphase()
  world.solver.iterations = 10

  wallMaterial = new CANNON.Material('wallMaterial')

 ballMaterial = new CANNON.Material('ballMaterial')
  wallContactMaterial = new CANNON.ContactMaterial(ballMaterial, wallMaterial)
  wallContactMaterial.friction = 0
  wallContactMaterial.restitution = 2







    groundShape = new CANNON.Box(new CANNON.Vec3(300,300,2))
    groundBody = new CANNON.Body({ mass: 0, material: wallMaterial })
    groundBody.addShape(groundShape)
    groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0),-Math.PI/2)
    groundBody.position.set(0,0,0)
    groundBody.position.y = -20
    world.addBody(groundBody)

    function ballCreate(x,y){
      const materialBall = new THREE.MeshPhongMaterial( { color: `rgba(${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)},1)`, specular: `rgba(${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)},1)` , shininess: 100, side: THREE.DoubleSide, opacity: 0.8,
        transparent: true } )

      const ballGeometry = new THREE.SphereGeometry(1, 32, 32)
      const ballMesh = new THREE.Mesh( ballGeometry, materialBall )
      ballMesh.name = 'ball'
      scene.add(ballMesh)
      ballMeshes.push(ballMesh)

      mass = 2, radius = 1


      ballShape = new CANNON.Sphere(radius)
      ballBody = new CANNON.Body({ mass: 1, material: ballMaterial })
      ballBody.addShape(ballShape)
      ballBody.linearDamping = 0
      world.addBody(ballBody)
      balls.push(ballBody)
      ballBody.position.set(x,y,-30)
      ballBody.angularVelocity.y = 3
      //console.log(ballBody)
      ballBody.addEventListener('collide',function(e){
        console.log(e)
        console.log(score)
        // console.log(e.body.position.y)
        if(playing){



          if(score > 0 && score <= 2){
            sampler.triggerAttackRelease(drums[Math.floor(Math.random()*5)], 1)
            synthA.triggerAttackRelease(notes[Math.floor(Math.random()*9)],1)
          }

          if(score > 2 && score <= 4){
            sampler.triggerAttackRelease(drums[Math.floor(Math.random()*5)], 1)
            synthA.triggerAttackRelease(notesLow[Math.floor(Math.random()*9)],1)
          }

          if(score > 4 ){
            sampler.triggerAttackRelease(drums[Math.floor(Math.random()*5)], 1)
            synthB.triggerAttackRelease(notes[Math.floor(Math.random()*9)],1)
          }



    }
  })
}
for(let k=0;k<10;k++){

  ballCreate(Math.floor(Math.random()*15), Math.floor(Math.random()*15))
}

var update = function() {

  line.rotation.y+=0.01
  line2.rotation.y+=0.01

  if(happy>0.9){

    for(var j=0; j<balls.length; j++){
      if(j%2===0){
        balls[j].velocity.y+= (1+(j/10))
      }
    }

  }

  if(surprised>0.9){

    for(var l=0; l<balls.length; l++){
      if(l%2!==0){
        balls[l].velocity.y+=(1+(l/10))
      }
    }

  }




  updatePhysics()
  if(cannonDebugRenderer){
    //cannonDebugRenderer.update()
  }
}
const cannonDebugRenderer = new THREE.CannonDebugRenderer( scene, world )
function animate() {

  update()
  score+=0.001
  /* render scene and camera */
  renderer.render(scene,camera)
  requestAnimationFrame(animate)
}
function updatePhysics() {
  // Step the physics world
  world.step(timeStep)

  for(var j=0; j<balls.length; j++){
    ballMeshes[j].position.copy(balls[j].position)
    ballMeshes[j].quaternion.copy(balls[j].quaternion)
  }
}


requestAnimationFrame(animate)
