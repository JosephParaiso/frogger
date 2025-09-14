var gl;
var bufferIdRoad;
var bufferId; 
var vPosition;

var uColor;
var uColorLoc;
var uOffset;
var uOffsetLock;

var road_0_y = [-0.25, -0.55];
var road_1_y = [0.15, -0.15];
var road_2_y = [0.55, 0.25];

//how fast the cars move
var spd0 = -0.02;
var spd1 = -0.03;
var spd2 = -0.025;

var dX0 = 0;
var dX1 = 0;
var dX2 = 0;

var points = 0;

function setPoints(v) {
  points = v;
  const el = document.getElementById('pts');
  if (el) el.textContent = points;
}

//How big the car is vertically based on road y coordinates
var carDY = 0.05;


var v_frog_left = vec2( -0.09, -0.89 );
var v_frog_point = vec2( 0, -0.71 );
var v_frog_right = vec2( 0.09, -0.89 );
var frog_vertices = [v_frog_left, v_frog_point, v_frog_right];
var frog_origin = frog_vertices;

let frogFacingUp = true;

function flipFrog() {
    if (frogFacingUp) {
        frog_vertices[0][1] += 0.18;
        frog_vertices[1][1] -= 0.18;
        frog_vertices[2][1] += 0.18;
        frogFacingUp = false;
    } else {
        frog_vertices[0][1] -= 0.18;
        frog_vertices[1][1] += 0.18;
        frog_vertices[2][1] -= 0.18;
        frogFacingUp = true;
    }
}

var roads = [ -1, road_0_y[0], 1, road_0_y[0], 1, road_0_y[1],
                   1, road_0_y[1], -1, road_0_y[1], -1, road_0_y[0],

                  -1, road_1_y[0], 1, road_1_y[0], 1, road_1_y[1], 
                   1, road_1_y[1], -1, road_1_y[1], -1, road_1_y[0],

                  -1, road_2_y[0], 1, road_2_y[0], 1, road_2_y[1],
                   1, road_2_y[1], -1, road_2_y[1], -1, road_2_y[0]                  
                ]               

var vRoads = new Float32Array(roads);

//upphafsstað bíla
var vCar0 = [0.7, road_0_y[0] - carDY , 1, road_0_y[0] - carDY,
                1, road_0_y[1] + carDY, 0.7, road_0_y[1] + carDY];

var vCar00 = [-1, road_0_y[0] - carDY , -0.7, road_0_y[0] - carDY,
                -0.7, road_0_y[1] + carDY, -1, road_0_y[1] + carDY];

var vCar1 = [0.7, road_1_y[0] - carDY, 1, road_1_y[0] - carDY,
                1, road_1_y[1] + carDY, 0.7, road_1_y[1] + carDY];

var vCar11 = [-1, road_1_y[0] - carDY, -0.7, road_1_y[0] - carDY,
                -0.7, road_1_y[1] + carDY, -1, road_1_y[1] + carDY];

var vCar2 = [0.7 , road_2_y[0] - carDY, 1, road_2_y[0] - carDY,
                1, road_2_y[1] + carDY, 0.7, road_2_y[1] + carDY];

var vCar22 = [-1 , road_2_y[0] - carDY, -0.7, road_2_y[0] - carDY,
                -0.7, road_2_y[1] + carDY, -1, road_2_y[1] + carDY];



window.onload = function init()
{
    var canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    //  Configure WebGL

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.90, 0.90, 0.90, 1.0 );
    
    //  Load shaders and initialize attribute buffers
    
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // Load the data into the GPU

    //Road buffer
    bufferIdRoad = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferIdRoad );
    gl.bufferData( gl.ARRAY_BUFFER, vRoads, gl.STATIC_DRAW );
    
    //Frog buffer
    bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(frog_vertices), gl.STATIC_DRAW );

    //Cars buffer
    bufferIdCar0 = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferIdCar0 );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vCar0), gl.STATIC_DRAW );

    bufferIdCar00 = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferIdCar00 );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vCar00), gl.STATIC_DRAW );

    bufferIdCar1 = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferIdCar1 );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vCar1), gl.STATIC_DRAW );

    bufferIdCar11 = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferIdCar11 );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vCar11), gl.STATIC_DRAW );

    bufferIdCar2 = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferIdCar2 );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vCar2), gl.STATIC_DRAW );

    bufferIdCar22 = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferIdCar22 );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vCar22), gl.STATIC_DRAW );

    // Associate shader variables with our data buffer
    vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    // Meðhöndlun örvalykla
    window.addEventListener("keydown", function(e){
        
        var xmove = 0.0;
        var ymove = 0.0;
        var frogXspd = 0.3;
        var frogYSpd = 0.4;

        switch( e.keyCode ) {
            case 37:    // vinstri ör
                if (frog_vertices[0][0] - frogXspd > -1.01) {
                    xmove = -1 * frogXspd;
                }
                break;
            case 38:	// upp ör
                if (frog_vertices[1][1] + frogYSpd < 1) {
                    ymove = frogYSpd;
                }
                if (frog_vertices[1][1] + frogYSpd > road_2_y[0] && frogFacingUp) {
                    flipFrog();
                    setPoints(points + 1);
                }
                break;
            case 39:    // hægri ör
                if (frog_vertices[2][0] + frogXspd < 1.01) {
                    xmove = frogXspd;
                }
                break;
            case 40:	// niður ör
                if (frog_vertices[1][1] - frogYSpd > -1) {
                    ymove = frogYSpd * -1;
                } 
                if (frog_vertices[1][1] - frogYSpd < road_0_y[1] && !frogFacingUp) {
                    flipFrog();
                    setPoints(points + 1);
                }
                break;
        }
        for(i=0; i<3; i++) {
            frog_vertices[i][0] += xmove;
            frog_vertices[i][1] += ymove;
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(frog_vertices));
    } );



    uColorLoc = gl.getUniformLocation( program, "uColor" );
    uOffsetLoc = gl.getUniformLocation(program, "uOffset");

    render();
};

function reset() {
    frog_vertices[0][0] = -0.09; frog_vertices[0][1] = -0.89;
    frog_vertices[1][0] = 0; frog_vertices[1][1] = -0.71;
    frog_vertices[2][0] = 0.09; frog_vertices[2][1] = -0.89;

    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(frog_vertices));

    frogFacingUp = true;

    setPoints(0);
}


function render() {
    gl.clear( gl.COLOR_BUFFER_BIT );

    //Roads
    gl.uniform2f(uOffsetLoc, 0.0, 0.0);
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferIdRoad);
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
    gl.uniform4f(uColorLoc, 0.7, 0.7, 0.7, 1.0);
    gl.drawArrays(gl.TRIANGLES, 0, 18);

    //draw frog
    gl.uniform2f(uOffsetLoc, 0.0, 0.0);
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
    gl.uniform4f(uColorLoc, 0.0, 1.0, 0.0, 1.0);
    gl.drawArrays( gl.TRIANGLES, 0, 3 );

    var frx = frog_vertices[2][0];
    var fry = frog_vertices[2][1];

    //draw cars

    //Car 1
    //dx0 affects both car 1's
    dX0 += spd0;
    if (dX0 < -2) {
        dX0 = 2;
    }
    //bbox
    var minX_car0 = 0.7 + dX0;
    var maxX_car0 = 1.0 + dX0;
    var minY_car0 = road_0_y[1] + carDY;
    var maxY_car0 = road_0_y[0] - carDY;

    var overlap0 = (frx > minX_car0) &&
                   (frx < maxX_car0) &&
                   (fry > minY_car0) &&
                   (fry < maxY_car0);


    gl.uniform2f(uOffsetLoc, dX0, 0.0);
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferIdCar0);
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
    gl.uniform4f(uColorLoc, 0.2, 0.2, 0.9, 1.0);
    gl.drawArrays( gl.TRIANGLE_FAN, 0, 4 );

    //Car 1 (2)
    //bbox
    var minX_car00 = -1 + dX0;
    var maxX_car00 = -0.7 + dX0;
    var minY_car00 = road_0_y[1] + carDY;
    var maxY_car00 = road_0_y[0] - carDY;

    var overlap00 = (frx > minX_car00) &&
                   (frx < maxX_car00) &&
                   (fry > minY_car00) &&
                   (fry < maxY_car00);


    gl.uniform2f(uOffsetLoc, dX0, 0.0);
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferIdCar00);
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
    gl.uniform4f(uColorLoc, 0.2, 0.5, 1.0, 1.0);
    gl.drawArrays( gl.TRIANGLE_FAN, 0, 4 );

    //Car 2
    //dx affects both cars
    dX1 += spd1;
    if (dX1 < -2) {
        dX1 = 2;
    }

    var minX_car1 = 0.7 + dX1;
    var maxX_car1 = 1.0 + dX1;
    var minY_car1 = road_1_y[1] + carDY;
    var maxY_car1 = road_1_y[0] - carDY;

    var overlap1 = (frx > minX_car1) &&
                   (frx < maxX_car1) &&
                   (fry > minY_car1) &&
                   (fry < maxY_car1);

    gl.uniform2f(uOffsetLoc, dX1, 0.0);
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferIdCar1);
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
    gl.uniform4f(uColorLoc, 1.0, 1.0, 0.0, 1.0);
    gl.drawArrays( gl.TRIANGLE_FAN, 0, 4 );

    //Car 2 (2)

    var minX_car11 = -1.0 + dX1;
    var maxX_car11 = -0.7 + dX1;
    var minY_car11 = road_1_y[1] + carDY;
    var maxY_car11 = road_1_y[0] - carDY;

    var overlap11 = (frx > minX_car11) &&
                   (frx < maxX_car11) &&
                   (fry > minY_car11) &&
                   (fry < maxY_car11);

    gl.uniform2f(uOffsetLoc, dX1, 0.0);
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferIdCar11);
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
    gl.uniform4f(uColorLoc, 0.2, 0.8, 0.2, 1.0);
    gl.drawArrays( gl.TRIANGLE_FAN, 0, 4 );

    //Car 3
    //dx affects both cars
    dX2 += spd2;
    if (dX2 < -2) {
        dX2 = 2;
    }

    var minX_car2 = -1 + dX2;
    var maxX_car2 = -0.7 + dX2;
    var minY_car2 = road_2_y[1] + carDY;
    var maxY_car2 = road_2_y[0] - carDY;

    var overlap2 = (frx > minX_car2) &&
                   (frx < maxX_car2) &&
                   (fry > minY_car2) &&
                   (fry < maxY_car2);

    gl.uniform2f(uOffsetLoc, dX2, 0.0);
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferIdCar2);
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
    gl.uniform4f(uColorLoc, 1.0, 0.3, 0.3, 1.0);
    gl.drawArrays( gl.TRIANGLE_FAN, 0, 4 );

    //Car 3 (2)

    var minX_car22 = 0.7 + dX2;
    var maxX_car22 = 1.0 + dX2;
    var minY_car22 = road_2_y[1] + carDY;
    var maxY_car22 = road_2_y[0] - carDY;

    var overlap22 = (frx > minX_car22) &&
                   (frx < maxX_car22) &&
                   (fry > minY_car22) &&
                   (fry < maxY_car22);

    gl.uniform2f(uOffsetLoc, dX2, 0.0);
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferIdCar22);
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
    gl.uniform4f(uColorLoc, 1.0, 0.5, 0.5, 1.0);
    gl.drawArrays( gl.TRIANGLE_FAN, 0, 4 );

    if (overlap0) {
        reset();
    }
    if (overlap00) {
        reset();
    }
    if (overlap1) {
        reset();
    }
    if (overlap11) {
        reset();
    }
    if (overlap2) {
        reset();
    }
    if (overlap22) {
        reset();
    }

    window.requestAnimFrame(render);
}
