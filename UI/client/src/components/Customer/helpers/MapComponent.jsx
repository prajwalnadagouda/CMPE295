/* global google */
import React, { useEffect, useState } from "react";
import {
  withGoogleMap,
  GoogleMap,
  withScriptjs,
  Marker,
  DirectionsRenderer,
} from "react-google-maps";

function MapDirectionsRenderer(props) {
  const [directions, setDirections] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const { places, travelMode } = props;

    const waypoints = places.map((p) => ({
      location: { lat: p.latitude, lng: p.longitude },
      stopover: true,
    }));
    const origin = waypoints.shift().location;
    const destination = waypoints.pop().location;

    const directionsService = new google.maps.DirectionsService();
    directionsService.route(
      {
        origin: origin,
        destination: destination,
        travelMode: travelMode,
        waypoints: waypoints,
      },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK) {
          setDirections(result);
        } else {
          setError(result);
        }
      }
    );
  }, []);

  if (error) {
    return <h1>{error}</h1>;
  }
  return directions && <DirectionsRenderer directions={directions} />;
}

const MapComponent = withScriptjs(
  withGoogleMap((props) => {
    return (
      <GoogleMap
        defaultCenter={props.defaultCenter}
        defaultZoom={props.defaultZoom}
      >
        {props.markers.map((marker, index) => (
          <Marker
            key={index}
            position={{ lat: marker.latitude, lng: marker.longitude }}
          />
        ))}
        <MapDirectionsRenderer
          places={props.markers}
          travelMode={window.google.maps.TravelMode.DRIVING}
        />
      </GoogleMap>
    );
  })
);

export default MapComponent;
