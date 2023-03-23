import * as BABYLON from '@babylonjs/core';
import { GtfRenderer, GftScene } from './moc-graffiti/exports'

export class MyScene extends GftScene {
  private GROUND_ELEVATION = 0.1;

  constructor(renderer: GtfRenderer, useRightHandedSystem: boolean = false) {
    // @ts-ignore
    super(renderer, useRightHandedSystem);
  }
  
  public createSceneSimple(renderer: GtfRenderer) {
    const light = new BABYLON.HemisphericLight("hemi", new BABYLON.Vector3(1, 1, 0), this)
  
    const ground = BABYLON.Mesh.CreateGround('', 100, 100, 3, this)
    ground.position.y = this.GROUND_ELEVATION;
  
    const sphere = BABYLON.MeshBuilder.CreateSphere("sphere", {diameter: 20, segments: 32}, this);
    sphere.scaling.z = 0.510000123; // HACK TO MAKE THE GROUND VISIBLE
    sphere.position.copyFromFloats(-20, this.GROUND_ELEVATION, 0)
    sphere.position.y = 1;
  
    const material = new BABYLON.StandardMaterial('', this)
    ground.material = material;
    material.diffuseColor = BABYLON.Color3.FromInts(50, 100, 50)
  
    return this;	
  }

  public createScene(renderer: GtfRenderer) {
    // from https://www.babylonjs-playground.com/#UJEIL#13
    
    const light = new BABYLON.HemisphericLight("hemi", new BABYLON.Vector3(1, 1, 0), this)
  
    const ground = BABYLON.Mesh.CreateGround('', 100, 100, 3, this)
    ground.position.y = this.GROUND_ELEVATION;
    const material = new BABYLON.StandardMaterial('', this)
    ground.material = material;
  
    //@ts-ignore
    // window.m = material.specularColor = BABYLON.Color3.Black() // Does not seems needed.
    material.diffuseColor = BABYLON.Color3.FromInts(50, 100, 50)
  
    const sphere = BABYLON.MeshBuilder.CreateSphere("sphere", {diameter: 20, segments: 32}, this);
    //sphere.scaling.z = 0.510000123; // HACK TO MAKE THE GROUND VISIBLE
    sphere.position.copyFromFloats(-20, this.GROUND_ELEVATION, 0)
    sphere.position.x = 10;
  
    const makeMesh = (x:number, z:number, mode:number, parent:BABYLON.Mesh|undefined) => {
      // var m = BABYLON.Mesh.CreatePlane('', 5, scene)
  
      const m = BABYLON.Mesh.CreateBox('', 5, this ? this : null);
      m.scaling.z = 0.5
      m.position.copyFromFloats(x, this.GROUND_ELEVATION, z)
      m.billboardMode = mode
      const material = new BABYLON.StandardMaterial('', this)
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
  
    const parent = BABYLON.Mesh.CreateBox('parent', 0.5, this);
    const m6 = makeMesh(-20, -10, BABYLON.Mesh.BILLBOARDMODE_NONE, parent)
    const m7 = makeMesh(-10, -10, BABYLON.Mesh.BILLBOARDMODE_X, parent)
    const m8 = makeMesh(0, -10, BABYLON.Mesh.BILLBOARDMODE_Y, parent)
    const m9 = makeMesh(10, -10, BABYLON.Mesh.BILLBOARDMODE_Z, parent)
    const m10 = makeMesh(20, -10, BABYLON.Mesh.BILLBOARDMODE_ALL, parent)
  
    let a = 0;
    const camera = this.activeCamera;
    this.registerBeforeRender(function () {
      if (!camera) return;
      
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
  
    return this;	
  }
}
