import {APIProvider, Map} from '@vis.gl/react-google-maps';

export default function TrackerMap() {
  return (
    <div className='w-full h-full'>
      <APIProvider apiKey=''>
        <Map 
          style={{width: '100%', height: '100%'}}
          defaultCenter={{lat: 22.54992, lng: 0}}
          defaultZoom={3}
          gestureHandling='greedy'
          disableDefaultUI
        />
      </APIProvider>
    </div>
  )
}