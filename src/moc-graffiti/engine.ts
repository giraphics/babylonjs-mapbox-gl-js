import { Engine } from "@babylonjs/core/Engines/engine";
import { WebGPUEngine } from "@babylonjs/core/Engines/webgpuEngine";
import { ENGINE_TYPE } from "./constants";

export class GftEngine {
  // @ts-ignore
  public _ref: Engine;
  private _engineType: ENGINE_TYPE = ENGINE_TYPE.WEBGPU;
  private _isRenderingToContext = false;

  public constructor(forceFallback: boolean) {
    this._engineType = forceFallback ? ENGINE_TYPE.WEBGL : ENGINE_TYPE.WEBGPU;
  }

  get engineType() {
    return this._engineType;
  }

  get isRenderingToContext() {
    return this._isRenderingToContext;
  }

  initialize = async (
    canvas: HTMLCanvasElement | WebGL2RenderingContext
  ): Promise<void> => {
    // Generate the BABYLON 3D engine
    this._isRenderingToContext = canvas instanceof WebGL2RenderingContext;
    const webgpuSupported = await WebGPUEngine.IsSupportedAsync;
    if (!webgpuSupported) {
      this._engineType = ENGINE_TYPE.WEBGL;
    }

    if (this._engineType == ENGINE_TYPE.WEBGPU) {
      console.log("WEBGPU supported!");

      if (this._isRenderingToContext) return;

      this._ref = new WebGPUEngine(canvas as HTMLCanvasElement, {
        deviceDescriptor: {
          requiredFeatures: [
            "depth-clip-control",
            "depth24unorm-stencil8",
            "depth32float-stencil8",
            "texture-compression-bc",
            "texture-compression-etc2",
            "texture-compression-astc",
            "timestamp-query",
            "indirect-first-instance",
          ] as unknown as GPUFeatureName[],
        },
      });
      await (this._ref as WebGPUEngine).initAsync();
    } else {
      console.log("WEBGPU not supported!");
      this._ref = this._isRenderingToContext
        ? new Engine(canvas, true, { useHighPrecisionMatrix: true }, true)
        : new Engine(canvas, true);
    }
  };
}
