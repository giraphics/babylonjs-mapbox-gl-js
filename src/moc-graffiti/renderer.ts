import { GftEngine }  from "./engine";
import { ENGINE_TYPE } from './constants';

export class GtfRenderer {
  private _userId: number;
  public engine?: GftEngine;

  constructor(userId: number) {
    this._userId = userId;
  }

  get userId() {
    return this._userId;
  }

  initialize = async (canvas: HTMLCanvasElement | WebGL2RenderingContext, forceFallback: boolean = false): Promise<void> => {
    return await this.initEngine(canvas, this, forceFallback); // Must await for webgpu as engine is async init
  };

  initEngine = async (canvas: HTMLCanvasElement | WebGL2RenderingContext, renderer: GtfRenderer, forceFallback: boolean): Promise<void> => {
    this.engine = new GftEngine(forceFallback);
    await this.engine.initialize(canvas);
    console.log('Graffiti engine: ', this.engine.engineType == ENGINE_TYPE.WEBGPU ? 'WebGPU' : 'WebGL');
  };
}