import { GtfRenderer, GftCamera } from './moc-graffiti/exports'
import { MyScene } from './myscene'

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

    this.scene.createSceneSimple(this.renderer);
    // this.scene.createScene(this.renderer);
  }

  public repaintFromMatrix (matrix:any, mercatorCoordinate: [number, number, number], scaleFactor: number) {
    if (!this.scene) return;

    this.scene.renderFromMatrix(matrix, mercatorCoordinate, scaleFactor)
  }
}