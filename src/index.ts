import mapboxgl, { Map } from 'mapbox-gl'
import Visualizer from "./visualizer";
import { Type }  from "./moc-graffiti/types";

let customLayer: any;
let visualizer: Visualizer;

type GraffitiOption = { useWebGL2?: boolean | undefined;}
type MapOption = GraffitiOption & mapboxgl.MapboxOptions;

export const mapBoxInit = async (accessToken: string, id: string | HTMLElement, style: string, center: [number, number], zoom: number): Promise<Map> => {
  mapboxgl.accessToken = accessToken;

  const map = new mapboxgl.Map({ container: id, style: style, zoom: zoom, center: center, pitch: 60, antialias: true, useWebGL2: true} as MapOption);
  customLayer = {
    id: '3d-model',
    type: 'custom',
    renderingMode: '3d',
    onAdd: function(map:  mapboxgl.Map, gl: WebGL2RenderingContext) {
       visualizer = new Visualizer(gl);
    },
    render(gl: WebGL2RenderingContext, matrix: any) {
      const callback = () : Type.ContextOptions => {
        const modelOrigin = {lng: center[0], lat: center[1]}; // https://docs.mapbox.com/mapbox-gl-js/api/geography/#mercatorcoordinate.fromlnglat
        const modelAltitude = 0;
        const mercatorCoordinate = mapboxgl.MercatorCoordinate.fromLngLat(modelOrigin, modelAltitude);
        const scaleFactor = mercatorCoordinate.meterInMercatorCoordinateUnits();

        const ctxOptions: Type.ContextOptions = {
          matrix: matrix,
          mercatorCoordinate: [mercatorCoordinate.x, mercatorCoordinate.y, mercatorCoordinate.z as number],
          scaleFactor: scaleFactor,
        };
  
        return ctxOptions;
      }

      visualizer.renderloopCallbackExtCtx(callback);

      // visualizer.repaintFromMatrix(matrix, [mercatorCoordinate.x, mercatorCoordinate.y, mercatorCoordinate.z ? mercatorCoordinate.z: 0], scaleFactor);
      map.triggerRepaint();
    }
  }

  return new Promise(resolve => {
    map.on('style.load', () => { 
        map.addLayer(customLayer, 'waterway-label'); 
        resolve(map); 
    });
  });
};

const accessToken = 'REMOVED_MAPBOX_TOKEN';
const style = 'mapbox://styles/mapbox/streets-v11';

const mapDiv = document.createElement('div');
mapDiv.setAttribute('id', 'map')
mapDiv.style.width = document.body.clientWidth.toString() + 'px';
mapDiv.style.height = document.body.clientHeight.toString() + 'px';
document.body.appendChild(mapDiv);

mapBoxInit(accessToken, 'map', style, [103.6958, 1.3542], 17.5).then(() => {
  // scene started rendering, everything is initialized
});



