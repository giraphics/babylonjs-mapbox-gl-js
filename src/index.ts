import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { DirectionalLight } from "@babylonjs/core/Lights/directionalLight";
import { CreateBox, CreateSphere } from "@babylonjs/core";

/*************************************************/
/***************** BABYLON SCENE *****************/
/*************************************************/

let engine: Engine;
let scene: Scene; 
const createBabylonScene = (engine: Engine, canvas: HTMLCanvasElement): Scene => {
    // This creates a basic Babylon Scene object (non-mesh)
    scene = new Scene(engine);

    // This creates and positions a free camera (non-mesh)
    const camera = new ArcRotateCamera(
        "my first camera",
        0,
        Math.PI / 3,
        10,
        new Vector3(0, 0, 0),
        scene
    );

    camera.setTarget(Vector3.Zero()); 
    camera.attachControl(canvas, true);

    // Our built-in 'sphere' shape.
    // const box = CreateBox("box", { width: 1, height: 1, depth: 1 }, scene);
    const sphere = CreateSphere("sphere", {diameter: 1, segments: 32}, scene);

    const light = new DirectionalLight("light", new Vector3(0, -1, 1), scene);
    light.intensity = 0.5;
    light.position.x = 10;
    light.position.y = 10;
    light.position.z = 10;

    return scene;
};

/*************************************************/
/***************** OPENGL SCENE *****************/
/*************************************************/

let Pmatrix:any;
let Vmatrix:any;
let Mmatrix:any;
let index_buffer:any;
let shaderProgram: any;
const indices = [
    0,1,2, 0,2,3, 4,5,6, 4,6,7,
    8,9,10, 8,10,11, 12,13,14, 12,14,15,
    16,17,18, 16,18,19, 20,21,22, 20,22,23 
];

const createWebGL2Scene = (gl: WebGL2RenderingContext) => {
/*============ Defining and storing the geometry =========*/

    const vertices = [
        -1,-1,-1, 1,-1,-1, 1, 1,-1, -1, 1,-1,
        -1,-1, 1, 1,-1, 1, 1, 1, 1, -1, 1, 1,
        -1,-1,-1, -1, 1,-1, -1, 1, 1, -1,-1, 1,
        1,-1,-1, 1, 1,-1, 1, 1, 1, 1,-1, 1,
        -1,-1,-1, -1,-1, 1, 1,-1, 1, 1,-1,-1,
        -1, 1,-1, -1, 1, 1, 1, 1, 1, 1, 1,-1, 
    ];

    const colors = [
        5,3,7, 5,3,7, 5,3,7, 5,3,7,
        1,1,3, 1,1,3, 1,1,3, 1,1,3,
        0,0,1, 0,0,1, 0,0,1, 0,0,1,
        1,0,0, 1,0,0, 1,0,0, 1,0,0,
        1,1,0, 1,1,0, 1,1,0, 1,1,0,
        0,1,0, 0,1,0, 0,1,0, 0,1,0
    ];


    // Create and store data into vertex buffer
    const vertex_buffer = gl.createBuffer ();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    // Create and store data into color buffer
    const color_buffer = gl.createBuffer ();
    gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

    // Create and store data into index buffer
    index_buffer = gl.createBuffer ();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index_buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    /*=================== Shaders =========================*/

    const vertCode = 'attribute vec3 position;'+
    'uniform mat4 Pmatrix;'+
    'uniform mat4 Vmatrix;'+
    'uniform mat4 Mmatrix;'+
    'attribute vec3 color;'+//the color of the point
    'varying vec3 vColor;'+

    'void main(void) { '+//pre-built function
        'gl_Position = Pmatrix*Vmatrix*Mmatrix*vec4(position, 1.);'+
        'vColor = color;'+
    '}';

    const fragCode = 'precision mediump float;'+
    'varying vec3 vColor;'+
    'void main(void) {'+
        'gl_FragColor = vec4(vColor, 1.);'+
    '}';

    const vertShader = gl.createShader(gl.VERTEX_SHADER);
    if (!vertShader) return;

    gl.shaderSource(vertShader, vertCode);
    gl.compileShader(vertShader);

    const fragShader = gl.createShader(gl.FRAGMENT_SHADER);
    if (!fragShader) return;

    gl.shaderSource(fragShader, fragCode);
    gl.compileShader(fragShader);

    shaderProgram = gl.createProgram();
    if (!shaderProgram) return;

    gl.attachShader(shaderProgram, vertShader);
    gl.attachShader(shaderProgram, fragShader);
    gl.linkProgram(shaderProgram);

    /* ====== Associating attributes to vertex shader =====*/
    
    Pmatrix = gl.getUniformLocation(shaderProgram, "Pmatrix");
    Vmatrix = gl.getUniformLocation(shaderProgram, "Vmatrix");
    Mmatrix = gl.getUniformLocation(shaderProgram, "Mmatrix");

    gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
    let position = gl.getAttribLocation(shaderProgram, "position");
    gl.vertexAttribPointer(position, 3, gl.FLOAT, false,0,0) ;

    // Position
    gl.enableVertexAttribArray(position);
    gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer);
    const color = gl.getAttribLocation(shaderProgram, "color");
    gl.vertexAttribPointer(color, 3, gl.FLOAT, false,0,0) ;

    // Color
    gl.enableVertexAttribArray(color);
    gl.useProgram(shaderProgram);
}


const renderBabylonSphere = () => {
    scene.render();
}

const renderGLCube = (gl: WebGL2RenderingContext, canvasWidth: number, canvasHeight: number, time: number) => {
        /*==================== MATRIX =====================*/
    function get_projection(angle: number, a: number, zMin: number, zMax: number) {
        const ang = Math.tan((angle * 0.5) * Math.PI / 180);
        return [
            0.5 / ang, 0, 0, 0,
            0, 0.5 * a / ang, 0, 0,
            0, 0, -(zMax + zMin) / (zMax - zMin), -1,
            0, 0, (-2 * zMax * zMin) / (zMax - zMin), 0 
        ];
    }

    const proj_matrix = get_projection(40, canvasWidth / canvasHeight, 1, 100);
    const mov_matrix = [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1];
    const view_matrix = [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1];

    // translating z
    view_matrix[14] = view_matrix[14]-6;//zoom

    /*==================== Rotation ====================*/

    function rotateZ(m:number[], angle:number) {
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        const mv0 = m[0], mv4 = m[4], mv8 = m[8];

        m[0] = c*m[0]-s*m[1];
        m[4] = c*m[4]-s*m[5];
        m[8] = c*m[8]-s*m[9];

        m[1]=c*m[1]+s*mv0;
        m[5]=c*m[5]+s*mv4;
        m[9]=c*m[9]+s*mv8;
    }

    function rotateX(m: number[], angle: number) {
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        const mv1 = m[1], mv5 = m[5], mv9 = m[9];

        m[1] = m[1]*c-m[2]*s;
        m[5] = m[5]*c-m[6]*s;
        m[9] = m[9]*c-m[10]*s;

        m[2] = m[2]*c+mv1*s;
        m[6] = m[6]*c+mv5*s;
        m[10] = m[10]*c+mv9*s;
    }

    function rotateY(m: number[], angle: number) {
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        const mv0 = m[0], mv4 = m[4], mv8 = m[8];

        m[0] = c*m[0]+s*m[2];
        m[4] = c*m[4]+s*m[6];
        m[8] = c*m[8]+s*m[10];

        m[2] = c*m[2]-s*mv0;
        m[6] = c*m[6]-s*mv4;
        m[10] = c*m[10]-s*mv8;
    }

    /*================= Drawing ===========================*/
    const animate = function(time :number) {
        rotateZ(mov_matrix, time);
        rotateY(mov_matrix, time);
        rotateX(mov_matrix, time);

        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);
        gl.clearColor(1.0, 0.5, 0.5, 0.9);
        gl.clearDepth(1.0);

        gl.viewport(0.0, 0.0, canvasWidth, canvasHeight);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.useProgram(shaderProgram);
        gl.uniformMatrix4fv(Pmatrix, false, proj_matrix);
        gl.uniformMatrix4fv(Vmatrix, false, view_matrix);
        gl.uniformMatrix4fv(Mmatrix, false, mov_matrix);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index_buffer);
        gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
        //window.requestAnimationFrame(animate);
    }

    animate(time);
}

const externalGlContext = (gl: WebGL2RenderingContext) => {
    function drawRect(x:number, y:number, width:number, height:number, r:number, g: number, b: number) {
      // gl.scissor(x, y, width, height);
      gl.clearColor(r, g, b, 1.0);
      gl.clear(gl.COLOR_BUFFER_BIT);
    }
    
    for (let i = 0; i < 100; ++i) {
        const w = 500;
        const h = 500;
        const x = rand(0, w);
        const y = rand(0, h);
        const width = rand(0, w - x);
        const height = rand(0, h - y);
        drawRect(x, y, width, height, rand(0, 200)/ 255,rand(0, 120)/ 255,rand(0, 100)/ 255, );
    }

    function rand(min:number, max:number) {
        if (max === undefined) {
        max = min;
        min = 0;
        }
        return Math.random() * (max - min) + min;
    }    
}

export const babylonInit = async (): Promise<void> => {
    const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;
    const context = canvas.getContext('webgl2');
    if (!context) return;

    // Generate the BABYLON 3D engine
    engine = new Engine(context, true, {preserveDrawingBuffer : true});

    let time = 0.01;

    // Create Babylon scene,  with 'autoClear = false';
    const scene = createBabylonScene(engine, canvas);
    scene.autoClear = false;

    // Create WebGL2 scene
    createWebGL2Scene(context);
    
    let renderLoopCallback = function () {
        // Render the external OpenGL scene first
        renderGLCube(context, canvas.width, canvas.height, time+=0.01);

        // Render the Babylon scene second
        renderBabylonSphere();
    }

    // Register a render loop to repeatedly render the scene
    engine.runRenderLoop(renderLoopCallback);

    // Watch for browser/canvas resize events
    window.addEventListener("resize", function () {
        engine.resize();
    });
};

babylonInit().then(() => {
    // scene started rendering, everything is initialized
});
