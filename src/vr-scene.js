/* globals define */
(function(define){'use strict';define(function(require,exports,module){

/**
 * Dependencies
 */

var component = require('gaia-component');

/**
 * Simple logger
 * @type {Function}
 */
var debug = 0 ? console.log.bind(console) : function() {};

/**
 * Exports
 */

module.exports = component.register('vr-scene', {
  extends: HTMLDivElement.prototype,

  created: function() {
    this.setupShadowRoot();
    this.setupRenderer();
    this.setupScene();
    this.setupCamera();
    this.animate();
  },

  addObject: function(el, provided_obj) {
    var obj = el.object3D;
    var objParent = el.parentNode;
    if (obj) {
      return obj;
    }
    obj = el.object3D = provided_obj || new THREE.Object3D();
    if (objParent && objParent !== this) {
      objParent = this.addObject(el.parentNode);
      objParent.add(obj);
    } else {
      this.scene.add(obj);
    }
    return obj;
  },

  epsilon: function ( value ) {
    return Math.abs( value ) < 0.000001 ? 0 : value;
  },

  getCSSMatrix: function (matrix) {
    var epsilon = this.epsilon;
    var elements = matrix.elements;

    return 'matrix3d(' +
      epsilon( elements[ 0 ] ) + ',' +
      epsilon( elements[ 1 ] ) + ',' +
      epsilon( elements[ 2 ] ) + ',' +
      epsilon( elements[ 3 ] ) + ',' +
      epsilon( elements[ 4 ] ) + ',' +
      epsilon( elements[ 5 ] ) + ',' +
      epsilon( elements[ 6 ] ) + ',' +
      epsilon( elements[ 7 ] ) + ',' +
      epsilon( elements[ 8 ] ) + ',' +
      epsilon( elements[ 9 ] ) + ',' +
      epsilon( elements[ 10 ] ) + ',' +
      epsilon( elements[ 11 ] ) + ',' +
      epsilon( elements[ 12 ] ) + ',' +
      epsilon( elements[ 13 ] ) + ',' +
      epsilon( elements[ 14 ] ) + ',' +
      epsilon( elements[ 15 ] ) +
    ')';
  },

  setupCamera: function() {
    var viewport = this.shadowRoot.querySelector('.viewport');
    // DOM
    var camera = this.shadowRoot.querySelector('vr-camera');
    var fov = camera.getAttribute('fov');
    var perspective = camera.perspective;
    //this.style.perspective =  perspective + 'px';
    var perspectiveMatrix = this.perspectiveMatrix(VR.Math.degToRad(45), this.offsetWidth / this.offsetHeight, 1, 5000);
    var scaled = perspectiveMatrix.clone().scale(new VR.Vector3(this.offsetWidth, this.offsetHeight, 1));
    var style = this.getCSSMatrix( scaled );
    viewport.style.transform = style;

    // WebGL
    var camera = this.camera = new THREE.PerspectiveCamera(45, this.offsetWidth / this.offsetHeight, 1, 5000);
    camera.position.z = 0;
  },

  perspectiveMatrix: function(fov, aspect, nearz, farz) {

    var matrix = new VR.Matrix4();
    var range = Math.tan(fov * 0.5) * nearz;

    matrix.elements[0] = (2 * nearz) / ((range * aspect) - (-range * aspect));
    matrix.elements[1] = 0;
    matrix.elements[2] = 0;
    matrix.elements[3] = 0;
    matrix.elements[4] = 0;
    matrix.elements[5] = (2 * nearz) / (2 * range);
    matrix.elements[6] = 0;
    matrix.elements[7] = 0;
    matrix.elements[8] = 0;
    matrix.elements[9] = 0;
    matrix.elements[10] = -(farz + nearz) / (farz - nearz);
    matrix.elements[11] = -1;
    matrix.elements[12] = 0;
    matrix.elements[13] = 0;
    matrix.elements[14] = -(2 * farz * nearz) / (farz - nearz);
    matrix.elements[15] = 0;
    return matrix.transpose();

  },

  setupRenderer: function() {
    // All WebGL setup
    var canvas = this.canvas = this.shadowRoot.querySelector('canvas');

    this.resizeCanvas();
    window.addEventListener('resize', this.resizeCanvas.bind(this), false);

    var renderer = this.renderer = new THREE.WebGLRenderer( { canvas: canvas, antialias: true, alpha: true } );
    renderer.setSize( this.canvas.width, this.canvas.height );
    renderer.sortObjects = false;
    //renderer.setClearColor( 0xff0000 );
    //renderer.clear();
  },

  setupScene: function() {
    /// All WebGL Setup
    var scene = this.scene = new THREE.Scene();
    createLights();
    function createLights() {
      var directionalLight = new THREE.DirectionalLight(0xffffff);
      directionalLight.position.set(1, 1, 1).normalize();
      scene.add(directionalLight);
    }
  },

  resizeCanvas: function(renderer, camera){
    var canvas = this.canvas;
    // Make it visually fill the positioned parent
    //canvas.style.width ='100%';
    //canvas.style.height='100%';
    // ...then set the internal size to match
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    if (this.camera) {
      this.camera.aspect = canvas.width / canvas.height;
      this.camera.updateProjectionMatrix();
    }

    if (this.renderer) {
      // notify the renderer of the size change
      this.renderer.setSize( canvas.width, canvas.height );
    }
  },

  animate: function() {
    var self = this;
    requestAnimationFrame(function() {
      self.animate();
    });
    self.renderer.render(self.scene, self.camera);
  },

  attributeChanged: function(name, from, to) {
    if (name === "angle") {
      this.style.transform = 'rotateY( ' + this.angle + 'deg )';
    }
  },

  template: `
    <canvas width="100%" height="100%"></canvas>
    <div class="viewport">
      <vr-camera>
          <content></content>
      </vr-camera>
    </div>

      <style>

    :host {
      display: inline-block;
      width: 100%;
      height: 100vh;
    }

    .viewport {
      position: relative;
      box-sizing: border-box;
      transform-style: preserve-3d;
      width: 100%;
      height: 100vh;
    }

    canvas {
      position: absolute;
      transform-style: preserve-3d;
      width: 100%;
      height: 100vh;
    }

    </style>`
});

});})(typeof define=='function'&&define.amd?define
:(function(n,w){'use strict';return typeof module=='object'?function(c){
c(require,exports,module);}:function(c){var m={exports:{}};c(function(n){
return w[n];},m.exports,m);w[n]=m.exports;};})('vr-scene',this));
