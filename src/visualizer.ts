import { GtfRenderer, GftScene } from './moc-graffiti/exports'

export default class Visualizer {
  public renderer: GtfRenderer;
  public scene?: GftScene;
  
  constructor(gl: WebGL2RenderingContext) {
    this.renderer = new GtfRenderer(0);
    this.renderer.initialize(gl).then(() => this.postInit());
  }

  private postInit() {
    this.scene = new GftScene(this.renderer);
    //this.scene.createSceneSimple(this.renderer);
    this.scene.createScene(this.renderer);
  }

  public repaintFromMatrix (matrix:any, mercatorCoordinate: [number, number, number], scaleFactor: number) {
    if (!this.scene) return;

    this.scene.renderFromMatrix(matrix, mercatorCoordinate, scaleFactor)
  }
}