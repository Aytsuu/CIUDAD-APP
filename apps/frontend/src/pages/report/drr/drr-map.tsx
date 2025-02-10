import React from 'react';
import ReactMapGL, { ViewState } from 'react-map-gl/maplibre'; // Use the Maplibre version
import 'maplibre-gl/dist/maplibre-gl.css'; // Import Maplibre CSS

export default function DRRMap() {
  const [viewState, setViewState] = React.useState<ViewState>({
    latitude: 10.293835764430227,
    longitude: 123.89745538812122,
    zoom: 14.5,
    bearing: 0,
    pitch: 0,
    padding: { top: 10, bottom: 25, left: 15, right: 5 },
  });

  return (

    <div className='w-screen h-screen bg-snow flex justify-center items-center'>

      <div className='w-full h-full lg:max-w-[80%] lg:max-h-[80%]'>
        <ReactMapGL
            {...viewState}
            style={{ width: '100%', height: '100%' }}
            mapStyle="https://tiles.basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
            onMove={(evt) => {setViewState(evt.viewState)}}
          >
            {/* Add markers or other components here */}
          </ReactMapGL>
      </div>
    </div>
  );
}