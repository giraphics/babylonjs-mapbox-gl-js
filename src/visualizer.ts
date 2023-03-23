import { GtfRenderer, GftCamera } from './moc-graffiti/exports'
import { MyScene } from './myscene'
import { Type }  from "./moc-graffiti/types";

export default class Visualizer {
  public renderer: GtfRenderer;
  public scene?: MyScene;
  private camera?: GftCamera;

  constructor(gl: WebGL2RenderingContext) {
    this.renderer = new GtfRenderer(0);
    this.renderer.initialize(gl).then(() => this.postInit());
  }

  private postInit() {
    this.scene = new MyScene(this.renderer);
    this.camera = new GftCamera(this.scene);

    this.scene.activeCamera = this.camera.ref;
    this.scene.autoClear = false;
    this.scene.autoClearDepthAndStencil = false;
    this.scene.detachControl();

    // this.scene.createSceneSimple(this.renderer);
    this.scene.createScene(this.renderer);
  }

  renderloopCallbackExtCtx = (userFunction: () => Type.ContextOptions): void => {
    if (!this.scene) return;

    this.scene.renderloopCallbackExtCtx(userFunction());
  };
}