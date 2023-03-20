import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { DirectionalLight } from "@babylonjs/core/Lights/directionalLight";
import { CreateBox, CreateSphere } from "@babylonjs/core";
import mapboxgl, { Map } from 'mapbox-gl'
import * as BABYLON from '@babylonjs/core';

/*************************************************/
/***************** BABYLON SCENE *****************/
/*************************************************/

let engine: Engine;
let scene: Scene; 

let customLayer: any;
const groundElevation = 0.1;

function createEngine(glContext: WebGL2RenderingContext) {
	return new Engine(glContext, true);
}

function createScene(engine: Engine) {
	scene = new BABYLON.Scene(engine);
  scene.activeCamera = new BABYLON.Camera("mapbox-Camera", new BABYLON.Vector3(), scene);
  //scene.activeCamera = new BABYLON.ArcRotateCamera('ArcRotateCamera', 0, 0, 1000, new BABYLON.Vector3(0, 0, 0), scene);
  scene.autoClear = false;
  scene.detachControl();
  
  // from https://www.babylonjs-playground.com/#UJEIL#13
  
  const camera = scene.activeCamera;
 	const light = new BABYLON.HemisphericLight("hemi", new BABYLON.Vector3(1, 1, 0), scene)

  const ground = BABYLON.Mesh.CreateGround('', 100, 100, 3, scene)
  ground.position.y = groundElevation;
  const material = new BABYLON.StandardMaterial('', scene)
  ground.material = material;

  //@ts-ignore
  // window.m = material.specularColor = BABYLON.Color3.Black() // Does not seems needed.
  material.diffuseColor = BABYLON.Color3.FromInts(50, 100, 50)

  function makeMesh(x:number, z:number, mode:number, parent:BABYLON.Mesh|undefined) {
    // var m = BABYLON.Mesh.CreatePlane('', 5, scene)
    const m = BABYLON.Mesh.CreateBox('', 5, scene)
    m.scaling.z = 0.5
    m.position.copyFromFloats(x, groundElevation, z)
    m.billboardMode = mode
    const material = new BABYLON.StandardMaterial('', scene)
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

  const parent = BABYLON.Mesh.CreateBox('parent', 0.5, scene);
  const m6 = makeMesh(-20, 0, BABYLON.Mesh.BILLBOARDMODE_NONE, parent)
  const m7 = makeMesh(-10, 0, BABYLON.Mesh.BILLBOARDMODE_X, parent)
  const m8 = makeMesh(0, 0, BABYLON.Mesh.BILLBOARDMODE_Y, parent)
  const m9 = makeMesh(10, 0, BABYLON.Mesh.BILLBOARDMODE_Z, parent)
  const m10 = makeMesh(20, 0, BABYLON.Mesh.BILLBOARDMODE_ALL, parent)

  let a = 0;
  scene.registerBeforeRender(function () {
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

  return scene;	
}

function getWorldMatrix(center: [number, number]) {
  const modelOrigin = {lng: center[0], lat: center[1]}; // https://docs.mapbox.com/mapbox-gl-js/api/geography/#mercatorcoordinate.fromlnglat
  const modelAltitude = 0;

  const mercatorCoordinate = mapboxgl.MercatorCoordinate.fromLngLat(modelOrigin, modelAltitude);
  const rotationMatrix = BABYLON.Matrix.RotationX(Math.PI / 2);
  // @ts-ignore
  const translateMatrix = BABYLON.Matrix.Identity().setTranslationFromFloats(mercatorCoordinate.x, mercatorCoordinate.y, mercatorCoordinate.z);
  const scaleFactor = mercatorCoordinate.meterInMercatorCoordinateUnits();
  const scaleMatrix = BABYLON.Matrix.Scaling(scaleFactor, scaleFactor, scaleFactor);
  const worldMatrix = scaleMatrix.multiply(rotationMatrix.multiply(translateMatrix));

  return worldMatrix;
}

function render(engine:Engine, matrix:any, center: [number, number]) {
    if (scene) {
      const projection = BABYLON.Matrix.FromArray(matrix);
      engine.wipeCaches(false);
      if (!scene.activeCamera) {
        console.log('scene.activeCamera is null')
        return;
      }
      
      scene.activeCamera.freezeProjectionMatrix(getWorldMatrix(center).multiply(projection));
      let invert = scene.activeCamera.getProjectionMatrix().clone().invert();
      scene.activeCamera.position = BABYLON.Vector3.TransformCoordinates(new BABYLON.Vector3(), invert)
      scene.render(false);
    }
  }
  
export const babylonInit = async (accessToken: string, id: string | HTMLElement, style: string, center: [number, number], zoom: number): Promise<Map> => {
    mapboxgl.accessToken = accessToken;
    const map = new mapboxgl.Map({
        container: id,
        style: style,
        zoom: zoom,
        center: center,
        pitch: 60,
        antialias: true,
      });

      
  customLayer = {
    id: '3d-model',
    type: 'custom',
    renderingMode: '3d',
    onAdd: function(map:  mapboxgl.Map, gl: WebGL2RenderingContext) {
       engine = createEngine(gl);
       scene = createScene(this.engine)
    },
    render(gl: WebGL2RenderingContext, matrix: any) {
      if (scene) {
        render(engine, matrix, center)
      }
      map.triggerRepaint();
    }
  }

  return new Promise(resolve => {
    map.on('style.load', () => { 
        map.addLayer(customLayer, 'waterway-label'); 
        resolve(map); 
    });
  });
};

const accessToken = 'REMOVED_MAPBOX_TOKEN';
const style = 'mapbox://styles/mapbox/streets-v11';

const mapDiv = document.createElement('div');
mapDiv.setAttribute('id', 'map')
mapDiv.style.width = document.body.clientWidth.toString() + 'px';
mapDiv.style.height = document.body.clientHeight.toString() + 'px';
document.body.appendChild(mapDiv);
babylonInit(accessToken, 'map', style, [148.9819, -35.3981], 17.5).then(() => {
    // scene started rendering, everything is initialized
});