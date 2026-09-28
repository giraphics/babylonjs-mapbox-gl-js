import { Engine } from "@babylonjs/core/Engines/engine";
import { WebGPUEngine } from "@babylonjs/core/Engines/webgpuEngine";
import { ENGINE_TYPE } from "./constants";

export class GftEngine {
  // @ts-ignore
  public _ref: Engine;
  private _engineType: ENGINE_TYPE = ENGINE_TYPE.WEBGPU;
  private _isWebGL2FeatureAvailable = false;

  public constructor(forceFallback: boolean) {
    this._engineType = forceFallback ? ENGINE_TYPE.WEBGL : ENGINE_TYPE.WEBGPU;
  }

  get engineType() {
    return this._engineType;
  }

  get isRenderingToContext() {
    return this._isWebGL2FeatureAvailable;
  }

  initialize = async (canvas: HTMLCanvasElement | WebGL2RenderingContext): Promise<void> => {
    // Generate the BABYLON 3D engine
    this._isWebGL2FeatureAvailable = (canvas instanceof WebGL2RenderingContext);
    const webgpuSupported = await WebGPUEngine.IsSupportedAsync;
    if (!webgpuSupported) {
      this._engineType = ENGINE_TYPE.WEBGL;
    }

    // A WebGPUEngine cannot adopt an externally supplied WebGL2 context, so an
    // external context always means the WebGL path. Without this, a browser
    // that supports WebGPU falls into the branch below and returns before
    // assigning _ref, leaving the scene with a null engine.
    if (this._isWebGL2FeatureAvailable) {
      this._engineType = ENGINE_TYPE.WEBGL;
    }

    if (this._engineType == ENGINE_TYPE.WEBGPU) {
      console.log('WEBGPU supported!');

      this._ref = new WebGPUEngine(canvas as HTMLCanvasElement, {
        deviceDescriptor: {
          requiredFeatures: [
            'depth-clip-control',
            'depth24unorm-stencil8',
            'depth32float-stencil8',
            'texture-compression-bc',
            'texture-compression-etc2',
            'texture-compression-astc',
            'timestamp-query',
            'indirect-first-instance',
          ] as unknown as GPUFeatureName[],
        },
      });
      await (this._ref as WebGPUEngine).initAsync();
    } else {
      console.log(this._isWebGL2FeatureAvailable ? 'gfx-engine: WebGL2 features avaialable!': 'gfx-engine: WebGL1 features avaialable!');
      this._ref = this._isWebGL2FeatureAvailable ? new Engine(canvas, true, { useHighPrecisionMatrix: true }, true) : new Engine(canvas, true);
    }
  };
}
