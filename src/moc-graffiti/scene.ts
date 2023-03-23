import * as BABYLON from '@babylonjs/core';
import { GtfRenderer }  from "./renderer";
import { Type }  from "./types";

export class GftScene extends BABYLON.Scene {
  private renderer: GtfRenderer;

  constructor(renderer: GtfRenderer, useRightHandedSystem: boolean = false) {
    super(renderer.engine._ref);

    this.renderer = renderer;
  }

  public isRenderingToContext() {
    return this.renderer.engine.isRenderingToContext;
  }

  public getWorldMatrix(options: Type.ContextOptions) {
    const rotationMatrix = BABYLON.Matrix.RotationX(Math.PI / 2);
    // @ts-ignore
    const translateMatrix = BABYLON.Matrix.Identity().setTranslationFromFloats(options.mercatorCoordinate[0], options.mercatorCoordinate[1], options.mercatorCoordinate[2]);
    const scaleMatrix = BABYLON.Matrix.Scaling(options.scaleFactor, options.scaleFactor, options.scaleFactor);
    const worldMatrix = scaleMatrix.multiply(rotationMatrix.multiply(translateMatrix));
  
    return worldMatrix;
  }

  public renderloopCallbackExtCtx(options: Type.ContextOptions) {  
    const projection = BABYLON.Matrix.FromArray(options.matrix);

    const supressEngineCacheCode = true;
    if (supressEngineCacheCode) {
      const engine = this.getEngine();
      engine.wipeCaches(false);
      this.beforeRender = () => {
        engine.wipeCaches(true);
      };
    }

    if (!this.activeCamera) {
      console.log('scene.activeCamera is null')
      return;
    }
    
    this.activeCamera.freezeProjectionMatrix(this.getWorldMatrix(options).multiply(projection));
    let invert = this.activeCamera.getProjectionMatrix().clone().invert();
    this.activeCamera.position = BABYLON.Vector3.TransformCoordinates(new BABYLON.Vector3(), invert)
    this.render(false);
  }
}
