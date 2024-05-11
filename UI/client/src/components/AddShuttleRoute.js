import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  Td,
  Spinner,
  Center,
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from '@chakra-ui/react';

const AddShuttleRoute = () => {
  const sourceInputRef = useRef(null);
  const destinationInputRef = useRef(null);
  const mapContainerRef = useRef(null);
  const markers = useRef({});
  const [stops, setStops] = useState([]);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [routeDurations, setRouteDurations] = useState([]);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [routeName, setRouteName] = useState('');
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
    return () => {
      if (directionsRenderer.current) {
        directionsRenderer.current.setMap(null);
        directionsRenderer.current = null;
      }
      Object.values(markers.current).forEach(marker => marker.setMap(null));
      markers.current = {};
    };
  }, [loadGoogleMapsScript]);

  useEffect(() => {
    if (isMapLoaded && mapContainerRef.current && !directionsRenderer.current) {
      const map = new window.google.maps.Map(mapContainerRef.current, {
        center: { lat: 37.335, lng: -121.893 },
        zoom: 15,
      });
      directionsService.current = new window.google.maps.DirectionsService();
      directionsRenderer.current = new window.google.maps.DirectionsRenderer({ suppressMarkers: true });
      directionsRenderer.current.setMap(map);
      setupAutocomplete(sourceInputRef.current, 'source');
      setupAutocomplete(destinationInputRef.current, 'destination');
    }
  }, [isMapLoaded, mapContainerRef.current]);

  useEffect(() => {
    stops.forEach((stop, index) => {
      if (stop.ref && stop.ref.current) {
        setupAutocomplete(stop.ref.current, `stop${index + 1}`);
      }
    });
  }, [stops, isMapLoaded]);

  const setupAutocomplete = (inputRef, type) => {
    if (!window.google || !window.google.maps.places) {
      console.error("Google Maps API not loaded yet.");
      return;
    }
    const autocomplete = new window.google.maps.places.Autocomplete(inputRef, { types: ['address'] });
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
    setStops([...stops, { ref: React.createRef() }]);
  };

  const deleteStop = index => {
    const newStops = [...stops];
    newStops.splice(index, 1);
    setStops(newStops);
    if (markers.current[`stop${index + 1}`]) {
      markers.current[`stop${index + 1}`].setMap(null);
      delete markers.current[`stop${index + 1}`];
    }
  };

  const clearAll = () => {
    Object.values(markers.current).forEach(marker => marker && marker.setMap(null));
   
    markers.current = {};
    setStops([]);
    setRouteDurations([]);
    if (directionsRenderer.current) {
      directionsRenderer.current.setDirections({ routes: [] });
    }
    sourceInputRef.current.value = '';
    destinationInputRef.current.value = '';
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

  const saveRoute = async () => {
    setIsSaveModalOpen(true);
  };

  const handleSaveRoute = async () => {
    try {
      const user = localStorage.getItem('user_id');
      const sourceAddress = sourceInputRef.current.value;
      const destinationAddress = destinationInputRef.current.value;

      const stopsData = [
        {
          stop_name: sourceAddress,
          stop_lat: markers.current.source.getPosition().lat(),
          stop_long: markers.current.source.getPosition().lng(),
          stop_order: 'S',
        },
        ...stops.map((stop, index) => ({
          stop_name: stop.ref.current.value,
          stop_lat: markers.current[`stop${index + 1}`].getPosition().lat(),
          stop_long: markers.current[`stop${index + 1}`].getPosition().lng(),
          stop_order: (index + 1).toString(),
        })),
        {
          stop_name: destinationAddress,
          stop_lat: markers.current.destination.getPosition().lat(),
          stop_long: markers.current.destination.getPosition().lng(),
          stop_order: 'D',
        },
      ];

      const routeData = {
        stops: stopsData,
        created_by: user,
        route_name: routeName,
        type: 'M',
        active: true,
        updated_at: new Date(),
      };

      const response = await fetch(process.env.REACT_APP_BACKEND_URI + '/api/routes/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(routeData),
      });

      if (!response.ok) {
        throw new Error('Failed to save route');
      }

      const savedRoute = await response.json();
      console.log('Route saved successfully:', savedRoute);
      setIsSaveModalOpen(false); 
      toast({
        title: 'Success',
        description: 'Route saved successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error saving route:', error);
      toast({
        title: 'Error',
        description: 'Failed to save route',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  if (!isMapLoaded) {
    return (
      <Center h="100vh">
        <VStack>
          <Spinner size="xl" />
          <Text>Loading Map...</Text>
        </VStack>
      </Center>
    );
  }

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
            <Button colorScheme="orange" onClick={addStop}>Add Stop</Button>
            <Button colorScheme="red" onClick={clearAll}>Clear All</Button>
            <Button colorScheme="green" onClick={calculateRoute}>Confirm Selection</Button>
            <Button colorScheme="blue" onClick={saveRoute}>Save Route</Button>
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
      {/* Save Route Modal */}
      <Modal isOpen={isSaveModalOpen} onClose={() => setIsSaveModalOpen(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Save Route</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Input
              placeholder="Enter route name"
              value={routeName}
              onChange={(e) => setRouteName(e.target.value)}
            />
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleSaveRoute}>
              Confirm
            </Button>
            <Button colorScheme="gray" onClick={() => setIsSaveModalOpen(false)}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default AddShuttleRoute;
