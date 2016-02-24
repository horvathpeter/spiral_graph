//global variables
var renderer,
    controls,
    scene,
    camera,
    raycaster,
    SPIRAL_SIZE,
    mouse,
    cubes3D = new THREE.Object3D(),// all meshes stored in here -> added to scene at once
    cubes = [],
    yPos,
    MAX_CONSUMPTION,
    parameters,
    selectedObject;


// init function triggered on page load - set scene, raycaster, mouse and GUI
function init() {
    //instance of scene where all elements are rendered
    scene = new THREE.Scene();
    //instance of raycaster for detecting clicked elements
    raycaster = new THREE.Raycaster();
    //mouse vector - here are storen coordinates x,y of clicked point
    mouse = new THREE.Vector2();

    parameters = {
        B: 1, //affects cone of the spiral, default 1
        A: 300, //affects radius of the spiral, default 300
        opacity_B: 0.1, //affects opacity of cubes not in selected period
        opacity_A: 0.8,
        delta_z: 18, //this affects the overall width of the spiral - bigger delta -> wider spiral
        WIREFRAME: false

    };

    // read time series data, this function also triggers vizualize function
    readFile("data/viz_table_june_2595.txt");

    // reset controls and all parameters
    var reset_view = {
        reset: function () {
            parameters.B = 1;
            parameters.A = 300;
            parameters.opacity_B = 0.1;
            parameters.opacity_A = 0.8;
            parameters.delta_z = 18;
            parameters.WIREFRAME = false;
            setAllCubesOpacity(1);
            setAllCubesWireframe(false);
            controls.reset();
            setCubesCoordinates();
        }
    };

    var dayNNight = {
        highlightDay: function () {
            setAllCubesOpacity(1);
            for (var i = 0; i < SPIRAL_SIZE; i++) {
                if (cubes[i].hour >= 8 && cubes[i].hour <= 18) {
                    cubes[i].material.opacity = 1;
                }
                else {
                    cubes[i].material.opacity = 0.1;
                }
            }
        },
        highlightNight: function () {
            setAllCubesOpacity(1);
            for (var i = 0; i < SPIRAL_SIZE; i++) {
                if (cubes[i].hour < 8 || cubes[i].hour > 18) {
                    cubes[i].material.opacity = 1;
                }
                else {
                    cubes[i].material.opacity = 0.1;
                }
            }
        },
        border: 0
    };

    var gui = new dat.GUI();
    var f2 = gui.addFolder('Graph');
    var wireframeControl = f2.add(parameters, 'WIREFRAME').name('wireframe').listen();
    var deltaZControl = f2.add(parameters, 'delta_z', 18, 50).step(0.5).name('width').listen();
    var bControl = f2.add(parameters, 'B', 1, 25).step(1).name('cone').listen();
    var aControl = f2.add(parameters, 'A', 300, 700).step(1).name('radius').listen();
    var opacityBControl = f2.add(parameters, 'opacity_B', 0.0, 0.3).step(0.01).name('opacity B').listen();
    var opacityAControl = f2.add(parameters, 'opacity_A', 0.4, 0.8).step(0.01).name('opacity A').listen();
    var reset = f2.add(reset_view, 'reset').name('reset view');

    var f1 = gui.addFolder('Filter');
    f1.add(dayNNight, 'highlightDay').name('highlight days');
    f1.add(dayNNight, 'highlightNight').name('highlight nights');
    var borderControlMore = f1.add(dayNNight, 'border').name('greater than (kW)');
    var borderControlLess = f1.add(dayNNight, 'border').name('less than (kW)');

    deltaZControl.onChange(function (value) {
        setCubesCoordinates();
    });

    bControl.onChange(function (value) {
        setCubesCoordinates();
    });

    aControl.onChange(function (value) {
        setCubesCoordinates();
    });

    opacityBControl.onChange(function (value) {
        for (var i = 0; i < SPIRAL_SIZE; i++) {
            if (cubes[i].other == true) {
                cubes[i].material.opacity = parameters.opacity_B;
            }
        }
    });
    opacityAControl.onChange(function (value) {
        for (var i = 0; i < SPIRAL_SIZE; i++) {
            if (cubes[i].other == false) {
                cubes[i].material.opacity = parameters.opacity_A;
            }
        }
        selectedObject.material.opacity = 1;
    });
    wireframeControl.onChange(function (value) {
        setAllCubesWireframe(parameters.WIREFRAME);
    });
    borderControlMore.onChange(function (value) {
        setAllCubesOpacity(1);
        for (var i = 0; i < SPIRAL_SIZE; i++) {
            if (cubes[i].consumption >= dayNNight.border) {
                cubes[i].material.opacity = 1;
            }
            else {
                cubes[i].material.opacity = 0.1;
            }
        }
    });
    borderControlLess.onChange(function (value) {
        setAllCubesOpacity(1);
        for (var i = 0; i < SPIRAL_SIZE; i++) {
            if (cubes[i].consumption <= dayNNight.border) {
                cubes[i].material.opacity = 1;
            }
            else {
                cubes[i].material.opacity = 0.1;
            }
        }
    });
}

function setAllCubesOpacity(value) {
    for (var i = 0; i < SPIRAL_SIZE; i++) {
        cubes[i].material.opacity = value;
    }
}

function setAllCubesWireframe(value) {
    for (var i = 0; i < SPIRAL_SIZE; i++) {
        cubes[i].material.wireframe = value;
    }
}

function vizualize(measurements) {

    //console.log(heights);
    var width = window.innerWidth;
    var height = window.innerHeight;

    var VIEW_ANGLE = 45,
        ASPECT = width / height,
        CAMERA_NEAR = 1,
        CAMERA_FAR = 200000;

    for (var i = 0; i < SPIRAL_SIZE; i++) {

        var geometry = new THREE.BoxGeometry(50, measurements[i].consumption * 5, 50);
        var material = new THREE.MeshPhongMaterial({
            color: color(MAX_CONSUMPTION, 0, measurements[i].consumption),
            wireframe: false,
            opacity: 1,
            transparent: true
        });
        var cube = new THREE.Mesh(geometry, material);
        cube.overdraw = true;
        cube.oom_id = measurements[i].oom_id;
        cube.oom_psc = measurements[i].oom_psc;
        cube.date = measurements[i].date;
        cube.hour = measurements[i].hour;
        cube.consumption = measurements[i].consumption;
        cube.other = false;

        cube.material.side = THREE.DoubleSide;

        // uncomment to add edges to cube
        //var edge = new THREE.EdgesHelper(cube, 0xffffff);
        //edge.material.linewidth = 2;
        // scene.add(edge);

        cubes.push(cube);
        cubes3D.add(cube);
    }

    camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, CAMERA_NEAR, CAMERA_FAR);
    camera.position.set(0, 0, 7000);
    scene.add(camera);

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(width, height);
    document.body.appendChild(renderer.domElement);

    controls = new THREE.TrackballControls(camera, renderer.domElement);

    scene.add(directionalLight(200, 300, 500));
    scene.add(directionalLight(-200, -300, -500));

    // add cubes to scene and set positions
    scene.add(cubes3D);
    setCubesCoordinates();

    resize();
    animate();
}

// resize handler - when the size of the window is changed (or console shown), the scene is rerendered
function resize() {
    var width = window.innerWidth;
    var height = window.innerHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    render();
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    render();
}

function render() {
    renderer.render(scene, camera);
}

function setCubesCoordinates() {
    yPos = -(SPIRAL_SIZE * parameters.delta_z) / 2;
    var angle = 0;
    for (var i = 0; i < SPIRAL_SIZE; i++) {
        var actualCube = cubes[i];

        //bigger the angle, bigger space between 2 new points
        angle = 0.2 * i;

        actualCube.position.x = (parameters.A + (parameters.B * angle)) * Math.cos(angle);
        actualCube.position.y = yPos;
        actualCube.position.z = (parameters.A + (parameters.B * angle)) * Math.sin(angle);
        yPos += parameters.delta_z;
    }
}

// function returns directional light from position given as parameter
var directionalLight = function (x, y, z) {
    var tempLight = new THREE.DirectionalLight(0xffffff);
    tempLight.position.set(x, y, z);
    return tempLight;
};

// returns hexa string for RGB values
function RGB2Color(r, g, b) {
    return '#' + byte2Hex(r) + byte2Hex(g) + byte2Hex(b);
}

function byte2Hex(n) {
    var nybHexString = "0123456789ABCDEF";
    return String(nybHexString.substr((n >> 4) & 0x0F, 1)) + nybHexString.substr(n & 0x0F, 1);
}

var color = function (max, min, value) {
    var minimum = min;
    var maximum = max;
    var r, g, b;
    var ratio = 2 * (value - minimum) / (maximum - minimum);
    if (0 > 255 * (1 - ratio)) {
        b = 0;
    }
    else {
        b = 255 * (1 - ratio);
    }
    if (0 > 255 * (ratio - 1)) {
        r = 0;
    }
    else {
        r = 255 * (ratio - 1);
    }
    g = 255 - b - r;
    return RGB2Color(r, g, b);
};

// read file given as parameter
function readFile(fileName) {
    if (window.File && window.FileReader && window.FileList && window.Blob) {
        //console.log("Everything supported");
    }
    else {
        alert("Browser doesn't support file readings! Try another one.");
    }
    MAX_CONSUMPTION = 0;
    var measurements = [];

    $.get(fileName, function (data) {

            var lines = data.split("\n");
            SPIRAL_SIZE = lines.length;

            for (var i = 0; i < lines.length; i++) {
                var vals = lines[i].split("\t");
                var record = {oom_id: vals[0], oom_psc: vals[1], date: vals[2], hour: vals[3], consumption: vals[4]};
                if (parseFloat(vals[4]) > parseFloat(MAX_CONSUMPTION)) {
                    MAX_CONSUMPTION = vals[4];
                }
                measurements.push(record);
            }
            vizualize(measurements);
            // console.log(MAX_CONSUMPTION);

            $('#title').html("Energy consumption for period: " + measurements[0].date + " - " + measurements[lines.length - 1].date);

        }
    );
}

function onSpiralMouseClick(event) {
    event.preventDefault();

    mouse.x = ( event.clientX / renderer.domElement.width ) * 2 - 1;
    mouse.y = -( event.clientY / renderer.domElement.height ) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    var intersects = raycaster.intersectObjects(cubes);

    if (intersects.length > 0) {

        selectedObject = intersects[0].object;

        //selectedObject.material.color.setHex(0xffffff);

        var startOfPeriod = moment(selectedObject.date).startOf('week');
        var endOfPeriod = moment(selectedObject.date).endOf('week');

        for (var i = 0; i < cubes.length; i++) {

            if (moment(cubes[i].date) >= startOfPeriod && moment(cubes[i].date) <= endOfPeriod) {
                cubes[i].material.opacity = parameters.opacity_A;
                cubes[i].other = false;
            }
            else {
                cubes[i].material.opacity = parameters.opacity_B;
                cubes[i].other = true;
            }
        }

        selectedObject.material.opacity = 1;


        $("#infoBox")
            .html("<table><tr>" +
            "<tr>" +
            "<td><b>Chosen period:</b></td>" +
            "<td>" + startOfPeriod.toDate().toDateString() + " - " + endOfPeriod.toDate().toDateString() + "</td>" +
            "</tr>" +
            "<td><b>Client ID:</b></td>" +
            "<td>" + selectedObject.oom_id + "</td></tr>" +
            "<tr>" +
            "<td><b>ZIP Code:</b></td>" +
            "<td>" + selectedObject.oom_psc + "</td>" +
            "</tr>" +
            "<tr>" +
            "<tr>" +
            "<td><b>Selected day:</b></td>" +
            "<td>" + "" + "</td>" +
            "</tr>" +
            "<tr>" +
            "<td><b>Consumption:</b></td>" +
            "<td>" + selectedObject.consumption + "kW </td>" +
            "</tr>" +
            "<tr>" +
            "<td><b>Date:</b></td>" +
            "<td>" + moment(selectedObject.date).toDate().toDateString() + "</td>" +
            "</tr>" +
            "<tr>" +
            "<td><b>Time:</b></td>" +
            "<td>" + selectedObject.hour + ":00 </td>" +
            "</tr>" +
            "</table>")
            .dialog("open");
    }
}
window.addEventListener("load", init, false);
window.addEventListener('resize', resize, false);
document.addEventListener("click", onSpiralMouseClick, false);