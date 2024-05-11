import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Box,
  Button,
  Input,
  VStack,
  HStack,
  Flex,
  useToast,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td
} from '@chakra-ui/react';

const ViewRoutes = () => {
  const sourceInputRef = useRef(null);
  const destinationInputRef = useRef(null);
  const mapContainerRef = useRef(null);
  const markers = useRef({});
  const [stops, setStops] = useState([]);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [routeDurations, setRouteDurations] = useState([]);
  const directionsService = useRef(null);
  const directionsRenderer = useRef(null);
  const toast = useToast();

  const loadGoogleMapsScript = useCallback(() => {
    if (window.google && window.google.maps) {
      setIsMapLoaded(true);
      return;
    }
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => setIsMapLoaded(true);
    document.body.appendChild(script);
  }, []);

  useEffect(() => {
    loadGoogleMapsScript();
  }, [loadGoogleMapsScript]);

  useEffect(() => {
    if (isMapLoaded && mapContainerRef.current) {
      initMap();
    }
  }, [isMapLoaded, mapContainerRef.current]);

  const initMap = () => {
    const map = new window.google.maps.Map(mapContainerRef.current, {
      center: { lat: 37.335, lng: -121.893 },
      zoom: 15,
    });
    directionsService.current = new window.google.maps.DirectionsService();
    directionsRenderer.current = new window.google.maps.DirectionsRenderer({ suppressMarkers: true });
    directionsRenderer.current.setMap(map);
    setupAutocomplete(sourceInputRef, 'source');
    setupAutocomplete(destinationInputRef, 'destination');
  };

  useEffect(() => {
    stops.forEach((stop, index) => setupAutocomplete(stop.ref, `stop${index+1}`));
  }, [stops]);

  const setupAutocomplete = (inputRef, type) => {
    const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, { types: ['address'] });
    autocomplete.bindTo('bounds', directionsRenderer.current.getMap());
    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      if (!place.geometry || !place.geometry.location) {
        toast({
          title: "Error",
          description: `No details available for input: '${place.name}'`,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }
      createMarker(place.geometry.location, type);
    });
  };

  const createMarker = (position, type) => {
    const markerKey = type === 'source' ? 'source' : type === 'destination' ? 'destination' : type;
    if (markers.current[markerKey]) {
      markers.current[markerKey].setMap(null);
    }
    const label = type === 'source' ? 'S' : type === 'destination' ? 'D' : type.substring(4);
    markers.current[markerKey] = new window.google.maps.Marker({
      map: directionsRenderer.current.getMap(),
      position,
      label
    });
  };

  const addStop = () => {
    const newStop = { ref: React.createRef() };
    setStops([...stops, newStop]);
  };

  const deleteStop = index => {
    const newStops = [...stops];
    newStops.splice(index, 1);
    setStops(newStops);
    if (markers.current[`stop${index}`]) {
      markers.current[`stop${index}`].setMap(null);
      delete markers.current[`stop${index}`];
    }
  };

  const clearAll = () => {
    Object.values(markers.current).forEach(marker => marker.setMap(null));
    markers.current = {};
    setStops([]);
    setRouteDurations([]);
    directionsRenderer.current.setDirections({ routes: [] });
    sourceInputRef.current.value = '';
    destinationInputRef.current.value = '';
    stops.forEach(stop => {
      if (stop.ref.current) {
        stop.ref.current.value = '';
      }
    });
  };

  const calculateRoute = () => {
    const waypoints = stops.map(stop => ({ location: stop.ref.current.value, stopover: true }));
    const request = {
      origin: sourceInputRef.current.value,
      destination: destinationInputRef.current.value,
      waypoints,
      travelMode: 'DRIVING',
    };
    directionsService.current.route(request, (result, status) => {
      if (status === 'OK') {
        directionsRenderer.current.setDirections(result);
        const legs = result.routes[0].legs;
        setRouteDurations(legs.map(leg => ({
          start: leg.start_address,
          end: leg.end_address,
          time: leg.duration.text,
          distance: leg.distance.text
        })));
      } else {
        toast({
          title: "Failed to fetch directions",
          description: `Google Maps request failed due to ${status}`,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    });
  };

  const saveRoute = () => {
    console.log("Route saved");
  };

  return (
    <Box>
      <Flex direction={['column', 'column', 'row']} wrap="wrap" p={5}>
        <VStack spacing={4} align="start" width={['100%', '100%', '50%']} pr={5}>
          <Input ref={sourceInputRef} placeholder="Enter a source address" />
          {stops.map((stop, index) => (
            <HStack key={index} width="100%" spacing={4}>
              <Input ref={stop.ref} placeholder={`Enter stop ${index + 1} address`} />
              <Button colorScheme="red" onClick={() => deleteStop(index)}>Delete</Button>
            </HStack>
          ))}
          <Input ref={destinationInputRef} placeholder="Enter a destination address" />
          <HStack width="100%">
            <Button colorScheme="orange" width="20%" onClick={addStop}>Add Stop</Button>
            <Button colorScheme="red" width="20%" onClick={clearAll}>Clear All</Button>
            <Button colorScheme="green" width="30%" onClick={calculateRoute}>Confirm Selection</Button>
            <Button colorScheme="blue" width="30%" onClick={saveRoute}>Save Route</Button>
          </HStack>
        </VStack>
        <Box ref={mapContainerRef} width={['100%', '100%', '50%']} height="50vh" bg="gray.300" />
      </Flex>
      {routeDurations.length > 0 && (
        <Table variant="simple" size="sm" mt={4}>
          <Thead>
            <Tr>
              <Th>Start Point</Th>
              <Th>End Point</Th>
              <Th>Time for Travel</Th>
              <Th>Distance</Th>
            </Tr>
          </Thead>
          <Tbody>
            {routeDurations.map((data, index) => (
              <Tr key={index}>
                <Td>{data.start}</Td>
                <Td>{data.end}</Td>
                <Td>{data.time}</Td>
                <Td>{data.distance}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}
    </Box>
  );
}

export default ViewRoutes;
