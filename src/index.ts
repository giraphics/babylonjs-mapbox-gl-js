import maplibregl, { Map } from 'maplibre-gl'
import Visualizer from "./visualizer";
import { Type }  from "./moc-gfx-engine/types";

let customLayer: any;
let visualizer: Visualizer;

export const mapInit = async (id: string | HTMLElement, style: string, center: [number, number], zoom: number): Promise<Map> => {
  // MapLibre v4 always uses WebGL2 when available, so no useWebGL2 flag is needed.
  const map = new maplibregl.Map({ container: id, style: style, zoom: zoom, center: center, pitch: 60, antialias: true });
  customLayer = {
    id: '3d-model',
    type: 'custom',
    renderingMode: '3d',
    onAdd: function(map: Map, gl: WebGL2RenderingContext) {
       visualizer = new Visualizer(gl);
    },
    render(gl: WebGL2RenderingContext, matrix: any) {
      const callback = () : Type.ContextOptions => {
        const modelOrigin = {lng: center[0], lat: center[1]}; // https://maplibre.org/maplibre-gl-js/docs/API/classes/MercatorCoordinate/
        const modelAltitude = 0;
        const mercatorCoordinate = maplibregl.MercatorCoordinate.fromLngLat(modelOrigin, modelAltitude);
        const scaleFactor = mercatorCoordinate.meterInMercatorCoordinateUnits();

        const ctxOptions: Type.ContextOptions = {
          matrix: matrix,
          mercatorCoordinate: [mercatorCoordinate.x, mercatorCoordinate.y, mercatorCoordinate.z as number],
          scaleFactor: scaleFactor,
        };
  
        return ctxOptions;
      }

      visualizer.render(callback);

      // visualizer.repaintFromMatrix(matrix, [mercatorCoordinate.x, mercatorCoordinate.y, mercatorCoordinate.z ? mercatorCoordinate.z: 0], scaleFactor);
      map.triggerRepaint();
    }
  }

  return new Promise(resolve => {
    map.on('style.load', () => { 
        map.addLayer(customLayer);
        resolve(map); 
    });
  });
};

// OpenFreeMap: free vector tiles, no API key or account needed.
const style = 'https://tiles.openfreemap.org/styles/liberty';

const mapDiv = document.createElement('div');
mapDiv.setAttribute('id', 'map')
// Size with CSS, not a one-off pixel read: body can measure 0 at load time.
mapDiv.style.width = '100%';
mapDiv.style.height = '100%';
document.body.appendChild(mapDiv);

mapInit('map', style, [103.6958, 1.3542], 17.5).then(() => {
  // scene started rendering, everything is initialized
});
