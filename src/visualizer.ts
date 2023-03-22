import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import * as BABYLON from '@babylonjs/core';


export default class Visualizer {
  public renderer: Renderer;
  public myscene: MyScene;
  
  constructor(gl: WebGL2RenderingContext) {
    this.renderer = new Renderer(gl);
    this.myscene = new MyScene();

    this.myscene.createSceneSimple(this.renderer);
  }

  public repaintFromMatrix (matrix:any, mercatorCoordinate: [number, number, number], scaleFactor: number) {
    this.myscene.renderFromMatrix(matrix, mercatorCoordinate, scaleFactor)
  }
}

class Renderer {
  public engine: Engine;

  constructor(ctxt: WebGL2RenderingContext) {
    this.engine = new Engine(
      ctxt,
      true,
      {
      useHighPrecisionMatrix: true // Important to prevent jitter at mercator scale
      },
      true
      );
  }
}

class MyScene {
  public scene?: Scene;
  private GROUND_ELEVATION = 0.1;

  public createSceneSimple(renderer: Renderer) {
    this.scene = new BABYLON.Scene(renderer.engine);
    this.scene.activeCamera = new BABYLON.Camera("mapbox-Camera", new BABYLON.Vector3(), this.scene);
    this.scene.autoClear = false;
    this.scene.autoClearDepthAndStencil = false;
    this.scene.detachControl();
    
    const light = new BABYLON.HemisphericLight("hemi", new BABYLON.Vector3(1, 1, 0), this.scene)
  
    const ground = BABYLON.Mesh.CreateGround('', 100, 100, 3, this.scene)
    ground.position.y = this.GROUND_ELEVATION;
  
    const sphere = BABYLON.MeshBuilder.CreateSphere("sphere", {diameter: 20, segments: 32}, this.scene);
    sphere.scaling.z = 0.510000123; // HACK TO MAKE THE GROUND VISIBLE
    sphere.position.copyFromFloats(-20, this.GROUND_ELEVATION, 0)
    sphere.position.y = 1;
  
    const material = new BABYLON.StandardMaterial('', this.scene)
    ground.material = material;
    material.diffuseColor = BABYLON.Color3.FromInts(50, 100, 50)
  
    return this.scene;	
  }

  public createScene(engine: Engine) {
    this.scene = new BABYLON.Scene(engine);
    this.scene.activeCamera = new BABYLON.Camera("mapbox-Camera", new BABYLON.Vector3(), this.scene);
    //scene.activeCamera = new BABYLON.ArcRotateCamera('ArcRotateCamera', 0, 0, 1000, new BABYLON.Vector3(0, 0, 0), scene);
    this.scene.autoClear = false;
    this.scene.autoClearDepthAndStencil = false;
    this.scene.detachControl();
    
    // from https://www.babylonjs-playground.com/#UJEIL#13
    
    const camera = this.scene.activeCamera;
    const light = new BABYLON.HemisphericLight("hemi", new BABYLON.Vector3(1, 1, 0), this.scene)
  
    const ground = BABYLON.Mesh.CreateGround('', 100, 100, 3, this.scene)
    ground.position.y = this.GROUND_ELEVATION;
    const material = new BABYLON.StandardMaterial('', this.scene)
    ground.material = material;
  
    //@ts-ignore
    // window.m = material.specularColor = BABYLON.Color3.Black() // Does not seems needed.
    material.diffuseColor = BABYLON.Color3.FromInts(50, 100, 50)
  
    const sphere = BABYLON.MeshBuilder.CreateSphere("sphere", {diameter: 20, segments: 32}, this.scene);
    //sphere.scaling.z = 0.510000123; // HACK TO MAKE THE GROUND VISIBLE
    sphere.position.copyFromFloats(-20, this.GROUND_ELEVATION, 0)
    sphere.position.x = 10;
  
    const makeMesh = (x:number, z:number, mode:number, parent:BABYLON.Mesh|undefined) => {
      // var m = BABYLON.Mesh.CreatePlane('', 5, scene)
  
      const m = BABYLON.Mesh.CreateBox('', 5, this.scene ? this.scene : null);
      m.scaling.z = 0.5
      m.position.copyFromFloats(x, this.GROUND_ELEVATION, z)
      m.billboardMode = mode
      const material = new BABYLON.StandardMaterial('', this.scene)
      m.material = material;
  
      const c = mode ? 150 : 0
      material.diffuseColor = BABYLON.Color3.FromInts(100 + c, 100, 250 - c)
      if (parent) {
        m.parent = parent;
      }
      return m
    }
  
    const m1 = makeMesh(-20, 0, BABYLON.Mesh.BILLBOARDMODE_NONE, undefined)
    const m2 = makeMesh(-10, 0, BABYLON.Mesh.BILLBOARDMODE_X, undefined)
    const m3 = makeMesh(0, 0, BABYLON.Mesh.BILLBOARDMODE_Y, undefined)
    const m4 = makeMesh(10, 0, BABYLON.Mesh.BILLBOARDMODE_Z, undefined)
    const m5 = makeMesh(20, 0, BABYLON.Mesh.BILLBOARDMODE_ALL, undefined)
  
    const ref1 = makeMesh(-20, 10, BABYLON.Mesh.BILLBOARDMODE_NONE, undefined)
    const ref2 = makeMesh(-10, 10, BABYLON.Mesh.BILLBOARDMODE_NONE, undefined)
    const ref3 = makeMesh(0, 10, BABYLON.Mesh.BILLBOARDMODE_NONE, undefined)
    const ref4 = makeMesh(10, 10, BABYLON.Mesh.BILLBOARDMODE_NONE, undefined)
    const ref5 = makeMesh(20, 10, BABYLON.Mesh.BILLBOARDMODE_NONE, undefined)
  
    const parent = BABYLON.Mesh.CreateBox('parent', 0.5, this.scene);
    const m6 = makeMesh(-20, -10, BABYLON.Mesh.BILLBOARDMODE_NONE, parent)
    const m7 = makeMesh(-10, -10, BABYLON.Mesh.BILLBOARDMODE_X, parent)
    const m8 = makeMesh(0, -10, BABYLON.Mesh.BILLBOARDMODE_Y, parent)
    const m9 = makeMesh(10, -10, BABYLON.Mesh.BILLBOARDMODE_Z, parent)
    const m10 = makeMesh(20, -10, BABYLON.Mesh.BILLBOARDMODE_ALL, parent)
  
    let a = 0;
    this.scene.registerBeforeRender(function () {
      const diff2 = ref2.position.subtract(camera.position)
      const diff3 = ref3.position.subtract(camera.position)
      const diff4 = ref4.position.subtract(camera.position)
  
      ref2.rotation.x = Math.atan2(-diff2.y, diff2.z)
      ref3.rotation.y = Math.atan2(diff3.x, diff3.z)
      ref4.rotation.z = Math.atan2(diff4.y, diff4.x)
      ref5.rotationQuaternion = BABYLON.Quaternion.FromRotationMatrix(camera.getViewMatrix().clone().invert())
  
      parent.position.z = 20 * Math.cos(a);
      a += 0.01;
    })
  
    return this.scene;	
  }

  public getWorldMatrix(mercatorCoordinate: [number, number, number], scaleFactor: number) {
    const rotationMatrix = BABYLON.Matrix.RotationX(Math.PI / 2);
    // @ts-ignore
    const translateMatrix = BABYLON.Matrix.Identity().setTranslationFromFloats(mercatorCoordinate[0], mercatorCoordinate[1], mercatorCoordinate[2]);
    const scaleMatrix = BABYLON.Matrix.Scaling(scaleFactor, scaleFactor, scaleFactor);
    const worldMatrix = scaleMatrix.multiply(rotationMatrix.multiply(translateMatrix));
  
    return worldMatrix;
  }
  
  public renderFromMatrix(matrix:any, mercatorCoordinate: [number, number, number], scaleFactor: number) {
      //const engine = scene.getEngine();
  
      if (this.scene) {
        const projection = BABYLON.Matrix.FromArray(matrix);
        //engine.wipeCaches(false);
        // scene.beforeRender = () => {
        //   engine.wipeCaches(true);
        // };
        if (!this.scene.activeCamera) {
          console.log('scene.activeCamera is null')
          return;
        }
        
        this.scene.activeCamera.freezeProjectionMatrix(this.getWorldMatrix(mercatorCoordinate, scaleFactor).multiply(projection));
        let invert = this.scene.activeCamera.getProjectionMatrix().clone().invert();
        this.scene.activeCamera.position = BABYLON.Vector3.TransformCoordinates(new BABYLON.Vector3(), invert)
        this.scene.render(false);
      }
    }
}

