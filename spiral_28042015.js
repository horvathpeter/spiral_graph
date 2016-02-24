var renderer, controls, scene, camera, SPIRAL_SIZE = 100, planes3D = new THREE.Object3D(), planes = [], cubes3D = new THREE.Object3D(), cubes = [];

function init() {
    var width = window.innerWidth;
    var height = window.innerHeight;

    var VIEW_ANGLE = 45,
        ASPECT = width / height,
        CAMERA_NEAR = 1,
        CAMERA_FAR = 20000;

    var radius, segments, rings;
    radius = 50;
    segments = 16;
    rings = 16;


    scene = new THREE.Scene();
   // scene.add(planes3D);
    scene.add(cubes3D);

    for (var i = 0; i < SPIRAL_SIZE; i++) {
        var planeGeometry = new THREE.PlaneBufferGeometry(100, 100);
        var planeMaterial = new THREE.MeshBasicMaterial({color: 0xff00ff, wireframe:false});
        var plane = new THREE.Mesh(planeGeometry, planeMaterial);
        plane.overdraw = true;
        plane.material.side = THREE.DoubleSide;
        planes.push(plane);
        planes3D.add(plane);

        var geometry = new THREE.BoxGeometry( 50, 50, 50 );
        var material = new THREE.MeshBasicMaterial( { color: 0x00ff00, wireframe:false } );
        var cube = new THREE.Mesh( geometry, material );

        cubes.push(cube);
        cubes3D.add(cube);
    }

    camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, CAMERA_NEAR, CAMERA_FAR);
   // camera.position.set(500, 400, 5000);
    camera.position.set(0,0,1000);
    scene.add(camera);

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(width, height);
    document.body.appendChild(renderer.domElement);

    controls = new THREE.TrackballControls(camera, renderer.domElement);

    var light = new THREE.PointLight(0xffffff);
    light.position.set(10, 50, 130);
    scene.add(light);


    scene.add(spiralLine(300));

    var mesh = new THREE.Mesh(
        new THREE.CylinderCurvedSurfaceGeometry(58, 100, Math.PI/2, Math.PI, 25, 25),
        new THREE.MeshLambertMaterial({color:'white'})
    );
    mesh.material.side = THREE.DoubleSide;
    mesh.overdraw = true;
  // scene.add(mesh);
    animate();
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    render();
}

function render() {
    renderer.render(scene, camera);
}

var cube = function(){

};

THREE.CylinderCurvedSurfaceGeometry = function(radius, height, startAngle, endAngle, horizontalSegments, verticalSegments) {
    var width = radius * 2 * Math.PI;
    var plane = new THREE.PlaneGeometry(width, height, horizontalSegments, verticalSegments);
    var index = 0;

    for(var i=0; i<=verticalSegments; i++) {
        for(var j=0; j<=horizontalSegments; j++) {
            var angle = startAngle + (j/horizontalSegments)*(endAngle - startAngle);
            plane.vertices[index].z = radius * Math.cos(angle);
            plane.vertices[index].x = radius * Math.sin(angle);
            index++;
        }
    }
    return plane;
};

var spiralLine = function(radius) {
    var lineMaterial = new THREE.LineBasicMaterial({color: 0xffffff, linewidth: 50});
    var lineGeometry = new THREE.Geometry();

    var x, y, z, A = 300, B = 1; //B have to be 1 else the spiral will have a shape of cone -> in 2D the spiral would look like a circle but in 3D its a spiral like cylinder

    var RADIUS = radius;
    var delta_z = 5; //this affects the overall width of the spiral - bigger delta -> wider spiral
    var RAD_CONST = Math.PI / 180;

    var zPos = -(SPIRAL_SIZE * delta_z)/2;
    var anglePer = (360 / 12) * RAD_CONST;
    var angle;

    var yRot = 270 * RAD_CONST;

    for (var i = 0; i < SPIRAL_SIZE; i++) {
        //bigger the angle, bigger space between 2 new points
        /*angle = 0.2 * i;
         x = (A + (B * angle)) * Math.cos(angle);
         y = (A + (B * angle)) * Math.sin(angle);
         */
        //console.log("i:" + i + " angle:" + Number(angle).toFixed(2) + " x:" + x + " y:" + y);

        var actualPlane = planes[i];
        var actualCube = cubes[i];
        angle = 0.3 * i;
      /*actualPlane.position.x = Math.cos(i * anglePer) * RADIUS;
            //(A + (B * angle)) * Math.cos(angle); // polar coordinate of the spiral point r = a + b*angle -> convert to cartesian x = r * cos(angle)
       // actualPlane.position.y = zPos += 25;
            //(A + (B * angle)) * Math.sin(angle); // polar coordinate of the spiral point r = a + b*angle -> convert to cartesian y = r * sin(angle)
        actualPlane.position.z = Math.sin(i * anglePer) * RADIUS;
        //zPos;
        actualPlane.rotation.y = yRot;
        yRot -= anglePer;
        */

        actualCube.position.x = (A + (B * angle)) * Math.cos(angle);
        actualCube.position.y = zPos;
        actualCube.position.z = (A + (B * angle)) * Math.sin(angle);

        x = (A + (B * angle)) * Math.cos(angle);
        y = zPos;
        z = (A + (B * angle)) * Math.sin(angle);

        zPos += delta_z;

        lineGeometry.vertices.push(
            new THREE.Vector3(x, y, z)
        );
    }
    return new THREE.Line(lineGeometry, lineMaterial, THREE.LineStrip);
};

window.addEventListener("load", init, false);


