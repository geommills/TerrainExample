﻿TerrainView = Backbone.Marionette.ItemView.extend({
    template: function (serialized_model) {
        return Handlebars.buildTemplate(serialized_model, MainApplication.Templates.TerrainTemplate);
    },
    initialize: function (options) {
      this.terrain = options.terrainCollection.models[0];
      this.pipe = options.pipeCollection.models[0];
      this.boringdata = options.boringCollection.models[0];
    },
    drawCylinder: function(vstart, vend, color, rad){
      var HALF_PI = +Math.PI * .5;
      var distance = vstart.distanceTo(vend);
      var position  = vstart.clone().add(vend).divideScalar(2);
      var cylinder = new THREE.CylinderGeometry(rad,rad,distance,rad,rad,false);

      var orientation = new THREE.Matrix4();//a new orientation matrix to offset pivot
      var offsetRotation = new THREE.Matrix4();//a matrix to fix pivot rotation
      var offsetPosition = new THREE.Matrix4();//a matrix to fix pivot position

      var material = new THREE.MeshBasicMaterial({color:color});

      orientation.lookAt(vstart, vend, new THREE.Vector3(0,1,0));//look at destination
      offsetRotation.makeRotationX( - HALF_PI );//rotate 90 degs on X    
      orientation.multiply(offsetRotation);//combine orientation with rotation transformations
      cylinder.applyMatrix(orientation);

      var mesh2 = new THREE.Mesh(cylinder,material);
      mesh2.position=position;
      return mesh2;
    },
    onShow: function()
    {
      var dc = this;
      console.log(this.pipe.attributes);
      if ( ! Detector.webgl ) {
        Detector.addGetWebGLMessage();
        document.getElementById( 'terrain' ).innerHTML = "";
      }

      var container, stats;
      var camera, controls, scene, renderer;
      var mesh, texture;

      console.log(this.terrain.attributes.width);
      console.log(this.terrain.attributes.height);

      var worldWidth = 256, worldDepth = 256,
      worldHalfWidth = worldWidth / 2, worldHalfDepth = worldDepth / 2;

      var clock = new THREE.Clock();

      var shouldSphereFollowMouse = true;
      var helper;
      var terrainWidth = this.terrain.attributes.width;
      var terrainHeight = this.terrain.attributes.height;
      var terrainVertices = this.terrain.attributes.vertices;
      var pipeVertices = this.pipe.attributes.vertices;
      var borings = this.boringdata.attributes.borings;
      var terrainMin = this.terrain.attributes.minz;
      var offsetWidth = terrainWidth / 2;
      var offsetHeight = terrainHeight / 2;
      var xdiff = this.terrain.attributes.xdiff;
      var ydiff = this.terrain.attributes.ydiff;
      var firstX = this.terrain.attributes.minx;
      var firstY = this.terrain.attributes.miny;
      var terrainExaggeration = 1;
      init();
      animate();

      function init() {

        container = document.getElementById( 'terrain' );

        camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 20000 );

        scene = new THREE.Scene();

        controls = new THREE.OrbitControls(camera);
        controls.center.set(0.0, 100.0, 0.0);
        controls.userPanSpeed = 100;

        data = generateHeight( worldWidth, worldDepth );

        controls.center.y = data[ worldHalfWidth + worldHalfDepth * worldWidth ] + 500;
        camera.position.y =  controls.center.y + 2000;
        camera.position.x = 2000;

        var geometry = new THREE.PlaneGeometry( terrainWidth, terrainHeight, (terrainWidth/ xdiff), (terrainHeight / ydiff));
        geometry.applyMatrix( new THREE.Matrix4().makeRotationX( - Math.PI / 2 ) );
        //var data = [];
        var geometry2 = new THREE.PlaneGeometry( terrainWidth, terrainHeight, (terrainWidth/ xdiff), (terrainHeight / ydiff));
        geometry2.applyMatrix( new THREE.Matrix4().makeRotationX( - Math.PI / 2 ) );
        geometry2.applyMatrix( new THREE.Matrix4().makeRotationZ( - Math.PI  ) );


        //Apply the vertical values
        for ( var i = 0, l = terrainVertices.length; i < l; i ++ ) {
          for ( var j = 0; j < geometry.vertices.length; j ++ ) {
            if(terrainVertices[ i ].x ==((geometry.vertices[ j ].x + offsetWidth)+1) && terrainVertices[ i ].y  == ((geometry.vertices[ j ].z * -1) + offsetHeight +1) )
              geometry.vertices[ j ].y = (terrainVertices[ i ].z - terrainMin) * terrainExaggeration;
          }
        }

        for ( var i = 0, l = geometry.vertices.length; i < l; i ++ ) {
          for ( var j = 0; j < geometry2.vertices.length; j ++ ) {
            if(geometry.vertices[ i ].x == geometry2.vertices[ j ].x  && geometry.vertices[ i ].z == geometry2.vertices[ j ].z)
              geometry2.vertices[ j ].y = geometry.vertices[ i ].y;
          }
        }

        // PLEASE NOTE!! With raycasting faces must be planar!  PlaneGeometry is made up of
        // quads and now that we have changed the height value of the verts, the quads are no
        // longer planar.  We must break it down into triangles in order to preserve this information.
        geometry.computeFaceNormals();
        geometry2.computeFaceNormals();
        texture = new THREE.Texture( generateTexture( data, worldWidth, worldDepth ), new THREE.UVMapping(), THREE.ClampToEdgeWrapping, THREE.ClampToEdgeWrapping );
        texture.needsUpdate = true;
        var material = new THREE.MeshLambertMaterial({
          map: THREE.ImageUtils.loadTexture('http://localhost:1337/projects/SurfaceTest/surface.jpg')
        });
        mesh = new THREE.Mesh( geometry, material );
        var mesh2 = new THREE.Mesh( geometry2, new THREE.MeshBasicMaterial( { map: texture } ) );
        
        scene.add( mesh );
        scene.add( mesh2 );


        // Add the pipe

        var geometry = new THREE.Geometry();
        for ( var i = 0, l = pipeVertices.length; i < l; i ++ ) {  
          geometry.vertices.push( new THREE.Vector3( pipeVertices[i].x - firstX + 1 - offsetWidth, pipeVertices[i].y - firstY + 1 - offsetHeight,  (pipeVertices[i].z - terrainMin) * terrainExaggeration ));
        }  
        geometry.applyMatrix( new THREE.Matrix4().makeRotationX( - Math.PI / 2 ) );
        
        _.each(geometry.vertices, function(vector){
          if(dc.previousVector !== undefined)
          {
            var cylinder = dc.drawCylinder(dc.previousVector, vector, "#555555", 7);
            scene.add( cylinder );
          }
          dc.previousVector = vector;
        });


	var colors = [{color:"#f4a460"}, {color:"#db9356"}, {color:"#c3834c"}, {color:"#aa7243"}, {color:"#926239"}, {color:"#7a5230"}, {color:"#614126"}, {color:"#49311c"},{color:"#f4a460"}, {color:"#db9356"}, {color:"#c3834c"}, {color:"#aa7243"}, {color:"#926239"}, {color:"#7a5230"}, {color:"#614126"}, {color:"#49311c"},{color:"#f4a460"}, {color:"#db9356"}, {color:"#c3834c"}, {color:"#aa7243"}, {color:"#926239"}, {color:"#7a5230"}, {color:"#614126"}, {color:"#49311c"},{color:"#f4a460"}, {color:"#db9356"}, {color:"#c3834c"}, {color:"#aa7243"}, {color:"#926239"}, {color:"#7a5230"}, {color:"#614126"}, {color:"#49311c"},{color:"#f4a460"}, {color:"#db9356"}, {color:"#c3834c"}, {color:"#aa7243"}, {color:"#926239"}, {color:"#7a5230"}, {color:"#614126"}, {color:"#49311c"},{color:"#f4a460"}, {color:"#db9356"}, {color:"#c3834c"}, {color:"#aa7243"}, {color:"#926239"}, {color:"#7a5230"}, {color:"#614126"}, {color:"#49311c"},{color:"#f4a460"}, {color:"#db9356"}, {color:"#c3834c"}, {color:"#aa7243"}, {color:"#926239"}, {color:"#7a5230"}, {color:"#614126"}, {color:"#49311c"},{color:"#f4a460"}, {color:"#db9356"}, {color:"#c3834c"}, {color:"#aa7243"}, {color:"#926239"}, {color:"#7a5230"}, {color:"#614126"}, {color:"#49311c"}];


        //Add the borings

        for ( var i = 0, l = borings.length; i < l; i ++ ) {
          var geometry = new THREE.Geometry();
          dc.previousBoringVector = null;
          var zOff = 0;
          //get the z at the surface
          boringX = borings[i].x - firstX + 1;
          boringY = borings[i].y - firstY + 1;
          console.log(boringX);
          for ( var p = 0, t = terrainVertices.length; p < t; p ++ ) {
            if( boringX == terrainVertices[ p ].x  &&  boringY == terrainVertices[ p ].y)
            {
              zOff = terrainVertices[ p ].z - terrainMin;
            }
          }
          for ( var j = 0, k = borings[i].depths.length; j < k; j ++ ) { 
            geometry.vertices.push( new THREE.Vector3( boringX - offsetWidth, boringY -  offsetHeight,  (zOff - borings[i].depths[j].depth) * terrainExaggeration ));
          }
          geometry.applyMatrix( new THREE.Matrix4().makeRotationX( - Math.PI / 2 ) );
          var vertCount = 0;
          _.each(geometry.vertices, function(vector){
              if(dc.previousBoringVector !== null)
              {
                var cylinder = dc.drawCylinder(dc.previousBoringVector, vector,colors[vertCount].color, 5);
                scene.add( cylinder );
                vertCount += 1;
              }
              dc.previousBoringVector = vector;
          });
        } 



        renderer = new THREE.WebGLRenderer();
        renderer.setClearColor( 0xbfd1e5 );
        renderer.setSize( window.innerWidth - 6, window.innerHeight - 50);

        container.innerHTML = "";

        container.appendChild( renderer.domElement );
        //container.addEventListener( 'mousemove', onMouseMove, false );

        stats = new Stats();
        stats.domElement.style.position = 'absolute';
        stats.domElement.style.top = '0px';
        //container.appendChild( stats.domElement );

        
        var ambientLight = new THREE.AmbientLight(0xbbbbbb);
        scene.add(ambientLight);

        window.addEventListener( 'resize', onWindowResize, false );

      }

      function onWindowResize() {

        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize( window.innerWidth - 5, window.innerHeight - 50 );

        //controls.handleResize();

      }

      function generateHeight( width, height ) {

        var size = width * height, data = new Float32Array( size ),
        perlin = new ImprovedNoise(), quality = 1, z = Math.random() * 100;

        for ( var i = 0; i < size; i ++ ) {

          data[ i ] = 0

        }

        for ( var j = 0; j < 4; j ++ ) {

          for ( var i = 0; i < size; i ++ ) {

            var x = i % width, y = ~~ ( i / width );
            data[ i ] += Math.abs( perlin.noise( x / quality, y / quality, z ) * quality * 1.75 );


          }

          quality *= 5;

        }

        return data;

      }

      function generateTexture( data, width, height ) {

        var canvas, canvasScaled, context, image, imageData,
        level, diff, vector3, sun, shade;

        vector3 = new THREE.Vector3( 0, 0, 0 );

        sun = new THREE.Vector3( 1, 1, 1 );
        sun.normalize();

        canvas = document.createElement( 'canvas' );
        canvas.width = width;
        canvas.height = height;

        context = canvas.getContext( '2d' );
        context.fillStyle = '#000';
        context.fillRect( 0, 0, width, height );

        image = context.getImageData( 0, 0, canvas.width, canvas.height );
        imageData = image.data;

        for ( var i = 0, j = 0, l = imageData.length; i < l; i += 4, j ++ ) {

          vector3.x = data[ j - 2 ] - data[ j + 2 ];
          vector3.y = 2;
          vector3.z = data[ j - width * 2 ] - data[ j + width * 2 ];
          vector3.normalize();

          shade = vector3.dot( sun );

          imageData[ i ] = ( 96 + shade * 128 ) * ( 0.5 + data[ j ] * 0.007 );
          imageData[ i + 1 ] = ( 32 + shade * 96 ) * ( 0.5 + data[ j ] * 0.007 );
          imageData[ i + 2 ] = ( shade * 96 ) * ( 0.5 + data[ j ] * 0.007 );
        }

        context.putImageData( image, 0, 0 );

        // Scaled 4x

        canvasScaled = document.createElement( 'canvas' );
        canvasScaled.width = width * 4;
        canvasScaled.height = height * 4;

        context = canvasScaled.getContext( '2d' );
        context.scale( 4, 4 );
        context.drawImage( canvas, 0, 0 );

        image = context.getImageData( 0, 0, canvasScaled.width, canvasScaled.height );
        imageData = image.data;

        for ( var i = 0, l = imageData.length; i < l; i += 4 ) {

          var v = ~~ ( Math.random() * 5 );

          imageData[ i ] += v;
          imageData[ i + 1 ] += v;
          imageData[ i + 2 ] += v;

        }

        context.putImageData( image, 0, 0 );

        return canvasScaled;

      }

      //

      function animate() {

        requestAnimationFrame( animate );

        render();
        stats.update();

      }

      function render() {

        controls.update( clock.getDelta() );
        renderer.render( scene, camera );

      }

      function onMouseMove( event ) {

        if ( shouldSphereFollowMouse ) {

          var mouseX = ( event.clientX / window.innerWidth ) * 2 - 1;
          var mouseY = -( event.clientY / window.innerHeight ) * 2 + 1;

          var vector = new THREE.Vector3( mouseX, mouseY, camera.near );

          // Convert the [-1, 1] screen coordinate into a world coordinate on the near plane
          var projector = new THREE.Projector();
          projector.unprojectVector( vector, camera );

          var raycaster = new THREE.Raycaster( camera.position, vector.sub( camera.position ).normalize() );

          // See if the ray from the camera into the world hits one of our meshes
          var intersects = raycaster.intersectObject( mesh );
          lastIntersects = intersects;

          // Toggle rotation bool for meshes that we clicked
          if ( intersects.length > 0 ) {

            helper.position.set( 0, 0, 0 );
            helper.lookAt( intersects[ 0 ].face.normal );

            helper.position.copy( intersects[ 0 ].point );

          }
        }
      }
    },
    onRender: function () {
          //do nothing
          return this;
    }


});

var TerrainFooterView = Backbone.Marionette.ItemView.extend({
    template: function (serialized_model) {
        return Handlebars.buildTemplate(serialized_model, MainApplication.Templates.TerrainFooterTemplate);
    },
    initialize: function (options) {
    },
    events: {
        "click #btnWorkflows" : "pickWorkflow",
        "click #btnDetails" : "pickWorkflow"
    },  
    pickWorkflow: function(){
        //Create new marker
        return false;
    }
});


