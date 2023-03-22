import * as BABYLON from '@babylonjs/core';
import { GtfRenderer }  from "./renderer";

export class GftScene extends BABYLON.Scene {
  private renderer: GtfRenderer;

  constructor(renderer: GtfRenderer, useRightHandedSystem: boolean = false) {
    super(renderer.engine._ref);

    this.renderer = renderer;
  }

  public isRenderingToContext() {
    return this.renderer.engine.isRenderingToContext;
  }
}
