import { Box, HStack } from "@chakra-ui/react";
import Map from "./MapComponent";
import { Stack } from "react-bootstrap";

// const googleMapsApiKey = ;

const MapDisplay = ({ mapDetails }) => {
  const places = mapDetails.map((stop) => ({
    latitude: stop.stop_lat,
    longitude: stop.stop_long,
  }));

  return (
    <Box height="100%">
      <HStack spacing={10}>
        <Box flex={2} maxW={"30%"}>
          {mapDetails.map((stop) => (
            <Box key={stop.order}>
              <HStack justifyContent="space-between" alignItems="center">
                <p>{stop.stop_address}</p>
                <p>{stop.est_time}</p>
              </HStack>
            </Box>
          ))}
        </Box>
        <Box flex={3}>
          <Map
            googleMapURL={`https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&libraries=geometry,drawing,places`}
            markers={places}
            loadingElement={<div style={{ height: `100%` }} />}
            containerElement={<div style={{ height: "80vh" }} />}
            mapElement={<div style={{ height: `100%` }} />}
            defaultCenter={{ lat: 37.3385286, lng: -121.8909244 }}
            defaultZoom={12}
          />
        </Box>
      </HStack>
    </Box>
  );
};

export default MapDisplay;
