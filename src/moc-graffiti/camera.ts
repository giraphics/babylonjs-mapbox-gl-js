import * as BABYLON from '@babylonjs/core';
import { GftEngine }  from "./engine";
import { GftScene }  from "./scene";

export class GftCamera {
  protected _ref: any;
  protected scene: GftScene;
  // protected lockedMesh: GftBaseMesh;

  get ref() {
    return this._ref;
  }

  constructor(scene: GftScene) {
    // super();

    // If we are rendreing to external context we should not be using our own camera just provide bare minimal camera
    // that can inject external projection matrix.
    if (scene.isRenderingToContext()) {
      this._ref = new BABYLON.Camera("Default-Camera", new BABYLON.Vector3(), scene);
      console.log('CTX: Default camera created, NOTE: DELETE THIS COMMENT.');
    }

    this.scene = scene;

    this.setupDefaultLight();
  }

  private setupDefaultLight() {
    // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
    const light = new BABYLON.HemisphericLight('light', new BABYLON.Vector3(0, 1, 0), this.scene);

    // Default intensity is 1. Let's dim the light a small amount
    light.intensity = 0.7;
  }

  /**
   * Targets the camera to a specified vector.
   * @param target Defines the vector target.
   */
  public setTargetVec(target: BABYLON.Vector3) {
    this._ref.setTarget(target);
  }

  /**
   * Targets the camera to scene origin
   */
  public setTargetToOrigin() {
    this._ref.setTarget(BABYLON.Vector3.Zero());
  }

  /**
   * Attach the input controls to HTMLCanvasElement.
   * @param canvas Defines the canvas upon which the input control should work.
   * @param flag Defines whether event caught by the controls should call preventdefault().
   * @param rightClickRotate Defines if right click is rotation and left click is panning (or vice versa).
   * Note that rightClickRotate is updated here since it must be updated after the camera has control of the HTML canvas.
   */
   public attachControl(canvas: HTMLCanvasElement, flag: boolean, rightClickRotate: boolean = true) {
    this._ref.attachControl(canvas, flag);
    this._ref._panningMouseButton = rightClickRotate ? 0 : 2;
  }

  /**
   * The goal distance of camera from target
   * @param radius Distance of the camera from it's target point.
   */
  public radius(radius: number) {
    this._ref.radius = radius;
  }

  /**
   * The goal height of camera above local origin (centre) of target
   * @param heightOffset Camera distance from it's target point.
   */
  public heightOffset(heightOffset: number) {
    this._ref.heightOffset = heightOffset;
  }

  /**
   * The goal rotation of camera around local origin (centre) of target in x y plane
   * @param rotationOffset Camera distance from it's target point.
   */
  public rotationOffset(rotationOffset: number) {
    this._ref.rotationOffset = rotationOffset;
  }

  /**
   * Acceleration of camera in moving from current to goal position
   * @param cameraAcceleration Define camera acceleration in number.
   */
  public cameraAcceleration(cameraAcceleration: number) {
    this._ref.cameraAcceleration = cameraAcceleration;
  }

  /**
   * The speed at which acceleration is halted
   * @param maxCameraSpeed max speed of camera.
   */
  public maxCameraSpeed(maxCameraSpeed: number) {
    this._ref.maxCameraSpeed = maxCameraSpeed;
  }

  // /**
  //  * Define the current target of the camera as an object or a position.
  //  * @param mesh mesh to to se a target follow.
  //  */
  // public lockedTarget(mesh: GftBaseMesh) {
  //   this._ref.lockedTarget = mesh._ref;
  //   this.lockedMesh = mesh;
  //   this._ref.lockedTarget = this.lockedMesh._ref;
  // }

  // /**
  //  * Resets the current target of the camera.
  //  */
  // public unlockedTarget() {
  //   const pos = this.lockedMesh._ref.position;
  //   this._ref.lockedTarget = null;
  //   this._ref.setTarget(new BABYLON.Vector3(pos.x, pos.y, pos.z));
  // }

  /**
   * Dettach the input controls to HTMLCanvasElement.
   * @param canvas Defines the canvas upon which the input control should work.
   */
  public detachControl(canvas: HTMLCanvasElement) {
    this._ref.detachControl(canvas);
  }
}
