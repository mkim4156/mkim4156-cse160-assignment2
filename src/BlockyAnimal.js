// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  void main() {
    gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
  }`;

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  uniform vec4 u_FragColor;
  void main() {
    gl_FragColor = u_FragColor;
  }`;

// Global Variables
let canvas;
let gl;
let a_position;
let u_FragColor;
let g_globalAngle = 0;
let g_shinAngle = 0;
let g_thighAngle = 0;
let g_footAngle = 0;
let g_legAnimation = false;
let g_neckAngle = -77;
let g_tailAngle = -45;
let special_button = false;

function setupWebGL() {
  // Retrieve <canvas> element
  canvas = document.getElementById("webgl");

  // Get the rendering context for WebGL
  //gl = getWebGLContext(canvas);
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true});
  if (!gl) {
    console.log("Failed to get the rendering context for WebGL");
    return;
  }

  gl.enable(gl.DEPTH_TEST);

  // Register event handlers
  canvas.onmousedown = onMouseDown;
  canvas.onmousemove = onMouseMove;
  canvas.onmouseup = onMouseUp;
  canvas.onmouseleave = onMouseUp;
}

function connectVariablesToGLSL() {
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log("Failed to intialize shaders.");
    return;
  }

  // // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, "a_Position");
  if (a_Position < 0) {
    console.log("Failed to get the storage location of a_Position");
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, "u_FragColor");
  if (!u_FragColor) {
    console.log("Failed to get the storage location of u_FragColor");
    return;
  }

  // Get the storage location of u_ModelMatrix
  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) {
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }

  // Get the storage location of u_GlobalRotateMatrix
  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if (!u_GlobalRotateMatrix){
    console.log('Failed to get the storage location of u_GlobalRotateMatrix');
    return;
  }

  // Set an initial value for this matrix to identity
  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
  
}

//Set up actions for the HTML UI elements
function addActionsForHtmlUI() {
document.getElementById('webgl').onclick = function(event) {
  if (event.shiftKey) {
    if(special_button){
      special_button = false;
      document.getElementById('murder').innerHTML = '';
    } else {
      special_button = true;
      document.getElementById('murder').innerHTML = 'KILLED!';
    }
  }
  console.log(special_button)
};
  
  // Button Events
  document.getElementById('animationShinOnButton').onclick = function()  {g_legAnimation = true;};
  document.getElementById('animationShinOffButton').onclick = function()  {g_legAnimation = false;};
  
  // Limb Slide Events
  document.getElementById('neckSlide').addEventListener('mousemove', function(){g_neckAngle = this.value; renderScene(); });
  document.getElementById('shinSlide').addEventListener('mousemove', function(){g_shinAngle = this.value; renderScene(); });
  document.getElementById('thighSlide').addEventListener('mousemove', function(){g_thighAngle = this.value; renderScene(); });
  document.getElementById('tailSlide').addEventListener('mousemove', function(){g_tailAngle = this.value; renderScene(); });

  // Size Slider Events
  document.getElementById('angleSlide').addEventListener('mousemove', function(){ g_globalAngle = this.value; renderScene(); });

}

function main() {
  setupWebGL();
  connectVariablesToGLSL();

  // Set up actions for the HTML UI elements
  addActionsForHtmlUI();

  // Specify the color for clearing <canvas>
  gl.clearColor(.6, 0.4, 0.0, 1.0);

  // Clear <canvas>
  //renderAllShapes();
  requestAnimationFrame(tick);
}

let g_globalX = 0;
let g_globalY = 0;
let g_startX = 0;
let g_startY = 0;
let g_isDragging = false; 

function onMouseDown(ev) {
  // Capture the start position of the mouse
  g_startX = ev.clientX;
  g_startY = ev.clientY;
  g_isDragging = true;
}

function onMouseMove(ev) {
  if (!g_isDragging) return; // Only update if dragging
  
  // Calculate the difference in mouse position
  let dx = ev.clientX - g_startX;
  let dy = ev.clientY - g_startY;

  // Update global angle based on the movement of the mouse
  g_globalAngle += dx * 0.5; // Sensitivity adjustment
  g_globalY += dy * 0.5; // Vertical rotation (Y-axis) - scaling by 0.1 for sensitivity

  // Update the starting position for the next movement
  g_startX = ev.clientX;
  g_startY = ev.clientY;

  // Redraw the giraffe
  renderScene();
}

function onMouseUp(ev) {
  // Stop dragging
  g_isDragging = false;
}

function onMouseLeave(ev) {
  // In case the mouse leaves the canvas during dragging
  g_isDragging = false;
}


var g_startTime = performance.now()/1000.0;
var g_seconds = performance.now()/1000.0 - g_startTime;

// Called by browser repeatedly whenever its time
function tick(){
  // Print some debug information so we know we are running
  g_seconds = performance.now()/1000.0 - g_startTime;
  console.log(g_seconds);

  // Update Animation Angles
  updateAnimationAngles();

  // Draw everything
  renderScene();

  // Tell the browser to update again when it has time
  requestAnimationFrame(tick);
}

// Update the angles of everything if currently animated
function updateAnimationAngles(){
  if(g_legAnimation){
    g_thighAngle = (45*Math.sin(g_seconds));
    g_shinAngle = (45*Math.sin(g_seconds));
  }
}

// this is going to be renderScene() in the future
function renderScene() {
  // Check the time at the start of this function
  var startTime = performance.now();

  var globalRotMat = new Matrix4().rotate(g_globalAngle, 0, 1, 0).rotate(g_globalY, 1, 0, 0); 
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);


  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Create Giraffe Here:
  createGiraffe(g_shinAngle, g_thighAngle, g_neckAngle, g_tailAngle);

  // Check the time at the end of the function, and show on web page
  var duration = performance.now() - startTime;
  sendTextToHTML(" ms: " + Math.floor(duration) + " fps: " + Math.floor(10000/duration)/10, "numdot");
}

// Set the text of a HTML element
function sendTextToHTML(text, htmlID){
  var htmlElm = document.getElementById(htmlID);
  if(!htmlElm){
    console.log("Failed to get " + htmlID + " from HTML");
    return;
  }
  htmlElm.innerHTML = text;
}

// Creates one of the four Giraffe's Leg!
function createGiraffe(shinAngle, thighAngle, neckAngle, tailAngle){
  if(shinAngle <= 0){
    shinAngle = 0;
  }
  
  let angle = -45*Math.sin(g_seconds);
  if(angle < 0){
    angle = 0;
  }
  let angle2 = 45*Math.sin(g_seconds);
  if(angle2 < 0){
    angle2 = 0;
  }

  var fallDistance;

  if (special_button) {
    // Apply random falling distance in the x, y, and z directions
    fallDistance = 5 * 1.5 + 0.5;  // Randomize fall distance between 0.5 and 2.0
  }

  // LEFT FRONT LEG ------------------------------------------------------------------------------------------------------------------------
  // Draw a Thigh
  var leftFrontThigh = new Cube();
  var leftFrontThighMatrix = leftFrontThigh.matrix;
  leftFrontThighMatrix.translate(-0.254, -0.24, -0.02);
  if(special_button){
    leftFrontThighMatrix.translate(0, -0.09*g_seconds, -0.02);
  }
  if(g_legAnimation){
    leftFrontThighMatrix.rotate(-15*Math.sin(g_seconds), 0, 0, 1);
  }
  else{
    leftFrontThighMatrix.rotate(thighAngle, 0, 0, 1);
  }
  var leftFrontThighCoord = new Matrix4(leftFrontThighMatrix);
  leftFrontThighMatrix.scale(-0.07, -.3, .12);  // Scaling happen first then translate
  leftFrontThigh.drawCube(leftFrontThighMatrix, [1, .69, 0, 1]);

  // Draw a Shin
  var leftFrontShin = new Cube();
  var leftFrontShinMatrix = new Matrix4(leftFrontThighCoord);
  leftFrontShinMatrix.translate(-0.06, -0.3, 0.02);
  if(g_legAnimation){
    leftFrontShinMatrix.rotate(angle, 0, 0, 1);
  }
  else{
    leftFrontShinMatrix.rotate(shinAngle, 0, 0, 1);
  }

  var leftFrontShinCoord = new Matrix4(leftFrontShinMatrix);
  leftFrontShinMatrix.scale(0.04, -.3, 0.08);
  leftFrontShin.drawCube(leftFrontShinMatrix, [1, .69, 0, 1]);

  // // Draw a Foot
  var leftFrontFoot = new Cube();
  var leftFrontFootMatrix = new Matrix4(leftFrontShinCoord);
  leftFrontFootMatrix.translate(0.03, -.3, -0.02);
  leftFrontFootMatrix.rotate(shinAngle, 0, 0, 1);
  leftFrontFootMatrix.scale(-0.125, .0225, .125);
  leftFrontFoot.drawCube(leftFrontFootMatrix, [1, .69, 0, 1]);

  //   // LEFT Back LEG ------------------------------------------------------------------------------------------------------------------------
  // // Draw a Thigh
  var leftBackThigh = new Cube();
  var leftBackThighMatrix = leftBackThigh.matrix;
  leftBackThighMatrix.translate(0.254, -0.24, -0.02);
  if(special_button){
    leftBackThighMatrix.translate(0.09*g_seconds, -0.24, -0.02);
  }
  if(g_legAnimation){
    leftBackThighMatrix.rotate(15*Math.sin(g_seconds), 0, 0, 1);
  }
  else{
    leftBackThighMatrix.rotate(thighAngle, 0, 0, 1);
  }
  var leftBackThighCoord = new Matrix4(leftBackThighMatrix);
  leftBackThighMatrix.scale(-0.07, -.3, .12);  // Scaling happen first then translate
  leftBackThigh.drawCube(leftBackThighMatrix, [1, .69, 0, 1]);

  // // Draw a Shin
  var leftBackShin = new Cube();
  var leftBackShinMatrix = new Matrix4(leftBackThighCoord);
  leftBackShinMatrix.translate(-0.06, -0.3, 0.02);
  if(g_legAnimation){
    leftBackShinMatrix.rotate(angle2, 0, 0, 1);
  }
  else{
    leftBackShinMatrix.rotate(shinAngle, 0, 0, 1);
  }

  var leftBackShinCoord = new Matrix4(leftBackShinMatrix);
  leftBackShinMatrix.scale(0.04, -.3, 0.08);
  leftBackShin.drawCube(leftBackShinMatrix, [1, .69, 0, 1]);

  // // // Draw a Foot
  var leftBackFoot = new Cube();
  var leftBackFootMatrix = new Matrix4(leftBackShinCoord);
  leftBackFootMatrix.translate(0.03, -.3, -0.02);
  leftBackFootMatrix.rotate(shinAngle, 0, 0, 1);
  leftBackFootMatrix.scale(-0.125, .0225, .125);
  leftBackFoot.drawCube(leftBackFootMatrix, [1, .69, 0, 1]);

  // // RIGHT Back LEG ------------------------------------------------------------------------------------------------------------------------
  // // Draw a Thigh
  var rightBackThigh = new Cube();
  var rightBackThighMatrix = rightBackThigh.matrix;
  rightBackThighMatrix.translate(0.254, -0.24, -0.25);
  if(special_button){
    rightBackThighMatrix.translate(-0.1*(g_seconds), 0.1*(g_seconds), -0.25);
    rightBackThighMatrix.rotate(-45 + 30*g_seconds, 0, 0, 1);
  }
  if(g_legAnimation){
    rightBackThighMatrix.rotate(-15*Math.sin(g_seconds), 0, 0, 1);
  }
  else{
    rightBackThighMatrix.rotate(thighAngle, 0, 0, 1);
  }
  var rightBackThighCoord = new Matrix4(rightBackThigh.matrix);
  rightBackThighMatrix.scale(-0.07, -.3, .12);  // Scaling happen first then translate
  rightBackThigh.drawCube(rightBackThighMatrix, [1, .69, 0, 1]);

  // // Draw a Shin
  var rightBackShin = new Cube();
  var rightBackShinMatrix = new Matrix4(rightBackThighCoord);
  rightBackShinMatrix.translate(-0.06, -0.3, 0.02);
  if(g_legAnimation){
    rightBackShinMatrix.rotate(angle, 0, 0, 1);
  }
  else{
    rightBackShinMatrix.rotate(shinAngle, 0, 0, 1);
  }
  var rightBackShinCoord = new Matrix4(rightBackShinMatrix);
  rightBackShinMatrix.scale(0.04, -.3, 0.08);
  rightBackShin.drawCube(rightBackShinMatrix, [1, .69, 0, 1]);

  // // // Draw a Foot
  var rightBackFoot = new Cube();
  var rightBackFootMatrix = new Matrix4(rightBackShinCoord);
  rightBackFootMatrix.translate(0.03, -.3, -0.02);
  rightBackFootMatrix.rotate(shinAngle, 0, 0, 1);
  rightBackFootMatrix.scale(-0.125, .0225, .125);
  rightBackFoot.drawCube(rightBackFootMatrix, [1, .69, 0, 1]);

  // // RIGHT FRONT LEG ------------------------------------------------------------------------------------------------------------------------
  // Draw a Thigh
  var rightFrontThigh = new Cube();
  var rightFrontThighMatrix = rightFrontThigh.matrix;
  rightFrontThighMatrix.translate(-0.254, -0.24, -0.25);
  if(special_button){
    rightFrontThighMatrix.translate(-0.1*(g_seconds), 0.1*(g_seconds), -0.25);
    rightFrontThighMatrix.rotate(45 + 30*g_seconds, 0, 0, 1);
  }
  if(g_legAnimation){
    rightFrontThighMatrix.rotate(15*Math.sin(g_seconds), 0, 0, 1);
  }
  else{
    rightFrontThighMatrix.rotate(thighAngle, 0, 0, 1);
  }
  var rightFrontThighCoord = new Matrix4(rightFrontThighMatrix);
  rightFrontThighMatrix.scale(-0.07, -.3, .12);  // Scaling happen first then translate
  rightFrontThigh.drawCube(rightFrontThighMatrix, [1, .69, 0, 1]);

  // // Draw a Shin
  var rightFrontShin = new Cube();
  var rightFrontShinMatrix = new Matrix4(rightFrontThighCoord);
  rightFrontShinMatrix.translate(-0.06, -0.3, 0.02);
  if(g_legAnimation){
    rightFrontShinMatrix.rotate(angle2, 0, 0, 1);
  }
  else{
    rightFrontShinMatrix.rotate(shinAngle, 0, 0, 1);
  }

  var rightFrontShinCoord = new Matrix4(rightFrontShinMatrix);
  rightFrontShinMatrix.scale(0.04, -.3, 0.08);
  rightFrontShin.drawCube(rightFrontShinMatrix, [1, .69, 0, 1]);

  // // // Draw a Foot
  var rightFrontFoot = new Cube();
  var rightFrontFootMatrix = new Matrix4(rightFrontShinCoord);
  rightFrontFootMatrix.translate(0.03, -.3, -0.02);
  rightFrontFootMatrix.rotate(shinAngle, 0, 0, 1);
  rightFrontFootMatrix.scale(-0.125, .0225, .125);
  rightFrontFoot.drawCube(rightFrontFootMatrix, [1, .69, 0, 1]);

  // // Body
  var body = new Cube();
  var bodyMatrix = body.matrix;
  bodyMatrix.translate(-0.4, -0.25, -0.32);
  if(special_button){
    bodyMatrix.translate(-0.1*(g_seconds), 0.1*(g_seconds), -0.25);
    bodyMatrix.rotate(45 + 30*g_seconds, 0, 0, 1);
  }
  bodyMatrix.rotate(0, 0, 0, 1);
  bodyMatrix.scale(0.7, .3, .5);
  body.drawCube(bodyMatrix, [1, .69, 0, 1]);

  // //Neck
  var neck = new Cube();
  var neckMatrix = neck.matrix;
  neckMatrix.translate(-0.29, 0.05, -.15);
  if(special_button){
    neckMatrix.translate(0.1*(g_seconds), -0.1*(g_seconds), -0.25);
    neckMatrix.rotate(-45*g_seconds, 0, 0, 1);
  }
  if(g_legAnimation){
    neckMatrix.rotate(7.5*Math.sin(.35*3.14*g_seconds) - 72.5, 0, 0, 1);
  } else{
    neckMatrix.rotate(neckAngle, 0, 0, 1);
  }
  var neckCoord = new Matrix4(neckMatrix);
  neckMatrix.scale(-0.75, -.12, .15);
  neck.drawCube(neckMatrix, [1, .69, 0, 1]);

  // //Head
  var head = new Cube();
  var headMatrix = new Matrix4(neckCoord);
  headMatrix.translate(-.75, 0, 0);
  headMatrix.rotate(180 - (g_neckAngle * -1), 0, 0, 1);
  var headCoord = new Matrix4(headMatrix);
  headMatrix.scale(-0.3, .12, .15);
  head.drawCube(headMatrix, [1, .69, 0, 1]);

  var rightEar = new Cube();
  var rightEarMatrix = new Matrix4(headCoord);
  rightEarMatrix.translate(0.03, .20, 0);
  rightEarMatrix.rotate(70, 0, 0, 1);
  var rightEarCoord = new Matrix4(rightEarMatrix);
  rightEarMatrix.scale(-0.125, .03, .05);
  rightEar.drawCube(rightEarMatrix, [1, .69, 0, 1]);

  var leftEar = new Cube();
  leftEarMatrix = new Matrix4(headCoord);
  leftEarMatrix.translate(0.03, .20, .10);
  leftEarMatrix.rotate(70, 0, 0, 1);
  var leftEarCoord = new Matrix4(leftEarMatrix);
  leftEarMatrix.scale(-0.125, .03, .03);
  leftEar.drawCube(leftEarMatrix, [1, .69, 0, 1]);

  var leftEarBall = new Cube();
  var leftEarBallMatrix = new Matrix4(leftEarCoord);
  leftEarBallMatrix.translate(0.03, 0, 0);
  leftEarBallMatrix.rotate(0, 0, 0, 1);
  leftEarBallMatrix.scale(-0.03, .03, .05);
  leftEarBall.drawCube(leftEarBallMatrix, [0, 0, 0, 1]);

  var rightEarBall = new Cube();
  var rightEarBallMatrix = new Matrix4(rightEarCoord);
  rightEarBallMatrix.translate(0.03, 0, 0);
  rightEarBallMatrix.rotate(0, 0, 0, 1);
  rightEarBallMatrix.scale(-0.03, .03, .05);
  leftEarBall.drawCube(rightEarBallMatrix, [0, 0, 0, 1]);

  // //Tail
  var tail = new Cube();
  var tailMatrix = tail.matrix;
  tailMatrix.translate(0.25, -0.01, -.15);
  if(special_button){
    tailMatrix.translate(0.1*(g_seconds), -0.1*(g_seconds), -0.25);
    tailMatrix.rotate(-45*g_seconds, 0, 0, 1);
  }
  if(g_legAnimation){
    let tailAngleCap = 55*Math.sin(g_seconds);
    if(tailAngleCap >= 0){
      tailAngleCap = -55*Math.sin(g_seconds)
    }
    tailMatrix.rotate(tailAngleCap, 0, 0, 1);
  }else{
    tailMatrix.rotate(tailAngle, 0, 0, 1);
  }
  var tailCoord = new Matrix4(tailMatrix);
  tailMatrix.scale(0.3, .04, .15);
  tail.drawCube(tailMatrix, [1, .69, 0, 1]);

  // // Tail End
  var end = new Cube();
  var endMatrix = new Matrix4(tailCoord);
  endMatrix.translate(.3, -0.01, 0);
  endMatrix.rotate(0, 0, 0, 1);
  endMatrix.scale(0.12, .06, .15);
  end.drawCube(endMatrix, [0, 0, 0, 1]);
}