import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  Container,
  FormControl,
  FormLabel,
  Button,
  Box,
  Heading,
  Flex,
  Input,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  InputRightAddon,
  InputGroup,
} from "@chakra-ui/react";
import {
  GoogleMap,
  Marker,
  useJsApiLoader,
  Autocomplete,
  DirectionsRenderer,
} from "@react-google-maps/api";
import axios from "axios";
import { backendUrl, headers } from "../utils/config";

const containerStyle = {
  width: "40vw",
  height: "50vh",
};

const libraries = ["places"]; // Specify the libraries needed for Autocomplete

const NewBooking = () => {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const initialCenter = { lat: 37.3352, lng: -121.8811 };
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [miles, setMiles] = useState("");

  const [markers, setMarkers] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [directions, setDirections] = useState(null);
  const mapRef = useRef(null);

  const sourceRef = useRef(null);
  const destinationRef = useRef(null);

  const handlePlaceSelected = (ref, setPlace, isSource) => {
    const place = ref.current.getPlace();
    if (place && place.geometry) {
      setPlace(place.formatted_address);
      const newMarker = {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
        label: isSource ? "S" : "D",
      };
      updateMarker(newMarker, isSource);
    }
  };

  const updateMarker = useCallback((newMarker, isSource) => {
    setMarkers((prev) => {
      const other = prev.filter((m) => m.label !== newMarker.label);
      return isSource ? [newMarker, ...other] : [...other, newMarker];
    });
  }, []);

  useEffect(() => {
    if (isLoaded && markers.length > 0 && mapRef.current) {
      const bounds = new window.google.maps.LatLngBounds();
      markers.forEach((marker) => {
        bounds.extend(new window.google.maps.LatLng(marker.lat, marker.lng));
      });
      mapRef.current.fitBounds(bounds);
    }
  }, [markers, isLoaded]);

  const handleBooking = async () => {
    const sourceMarker = markers.find((marker) => marker.label === "S");
    const destinationMarker = markers.find((marker) => marker.label === "D");

    if (!sourceMarker || !destinationMarker) {
      console.error("Both source and destination must be set before booking.");
      return;
    }

    const payload = {
      source: { lat: sourceMarker.lat, lng: sourceMarker.lng },
      destination: { lat: destinationMarker.lat, lng: destinationMarker.lng },
      maxDistance: miles || 3,
    };
    console.log(payload);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URI}/api/routes/findRoutes`,
        payload
      );
      setRoutes(response.data);
    } catch (error) {
      console.error("Failed to fetch routes:", error);
    }
  };

  const handleConfirmBooking = async (route) => {
    try {
      const payload = {
        name: "chiranjeevi",
      };
      // Simulate a POST request to a booking API
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URI}/api/shuttle/booking`,
        route,
        { headers: headers }
      );
      // Handle response
      console.log("Booking confirmed:", response.data);
      alert("Booking Confirmed!");
      handleBooking();
    } catch (error) {
      console.error("Error confirming booking:", error);
      alert("Failed to confirm booking. Please try again.");
    }
  };

  const showRouteOnMap = async (stops) => {
    const waypoints = stops.map((stop) => ({
      location: { lat: stop.stop_lat, lng: stop.stop_long },
      stopover: true,
    }));
    const DirectionsService = new window.google.maps.DirectionsService();

    DirectionsService.route(
      {
        origin: new window.google.maps.LatLng(
          stops[0].stop_lat,
          stops[0].stop_long
        ),
        destination: new window.google.maps.LatLng(
          stops[stops.length - 1].stop_lat,
          stops[stops.length - 1].stop_long
        ),
        waypoints: waypoints.slice(1, -1),
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          setDirections(result);
        } else {
          console.error(`Error fetching directions: ${status}`);
        }
      }
    );
  };
  function formatDate(dateString) {
    const date = new Date(dateString);
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZoneName: "short",
    };
    return date.toLocaleDateString("en-US", options);
  }

  return (
    <Container maxW="container.xl" mt="4">
      <Heading as="h1" mb="6">
        New Booking
      </Heading>
      <Flex direction={{ base: "column", md: "row" }} gap="20px">
        <Box p={4} borderWidth="1px" borderRadius="lg" boxShadow="md" flex="1">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleBooking();
            }}
          >
            {isLoaded && (
              <>
                <FormControl isRequired mb="4">
                  <FormLabel htmlFor="source">Source</FormLabel>
                  <Autocomplete
                    onLoad={(autocomplete) =>
                      (sourceRef.current = autocomplete)
                    }
                    onPlaceChanged={() =>
                      handlePlaceSelected(sourceRef, setSource, true)
                    }
                  >
                    <Input
                      id="source"
                      placeholder="Enter source location"
                      value={source}
                      onChange={(e) => setSource(e.target.value)}
                    />
                  </Autocomplete>
                </FormControl>
                <FormControl isRequired mb="4">
                  <FormLabel htmlFor="destination">Destination</FormLabel>
                  <Autocomplete
                    onLoad={(autocomplete) =>
                      (destinationRef.current = autocomplete)
                    }
                    onPlaceChanged={() =>
                      handlePlaceSelected(destinationRef, setDestination, false)
                    }
                  >
                    <Input
                      id="destination"
                      placeholder="Enter destination location"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                    />
                  </Autocomplete>
                </FormControl>

                <FormControl isRequired mb="4">
                  <FormLabel htmlFor="destination">Within(miles)</FormLabel>
                  <InputGroup>
                    <Input
                      id="within"
                      placeholder="Enter miles"
                      value={miles}
                      onChange={(e) => setMiles(e.target.value)}
                    />
                    <InputRightAddon children="mi" />
                  </InputGroup>
                </FormControl>

                <Button colorScheme="blue" type="submit" width="full" mt="4">
                  Book Ride
                </Button>
              </>
            )}
          </form>
        </Box>
        {isLoaded && (
          <Box flex="1">
            <GoogleMap
              mapContainerStyle={containerStyle}
              center={initialCenter}
              zoom={12}
              onLoad={(map) => (mapRef.current = map)}
              onUnmount={() => (mapRef.current = null)}
            >
              {markers.map((marker, index) => (
                <Marker
                  key={index}
                  position={{ lat: marker.lat, lng: marker.lng }}
                  label={marker.label}
                />
              ))}
              {directions && <DirectionsRenderer directions={directions} />}
            </GoogleMap>
          </Box>
        )}
      </Flex>
      {routes.length > 0 && (
        <Table variant="simple" mt="4">
          <Thead>
            <Tr>
              <Th>Route Name</Th>
              <Th>Closest Stop to Source</Th>
              <Th>Distance to Source (miles)</Th>
              <Th>Closest Stop to Destination</Th>
              <Th>Distance to Destination (miles)</Th>
              <Th>Date Time</Th>
              <Th>Available Capacity</Th>
              <Th>Action</Th>
            </Tr>
          </Thead>
          <Tbody>
            {routes.map((route, index) => (
              <Tr key={route._id}>
                <Td>{route.route_name}</Td>
                <Td>{`${route.closestToSource.stop} (${String.fromCharCode(
                  65 + index
                )})`}</Td>
                <Td>{route.closestToSource.distance.toFixed(2)}</Td>
                <Td>{`${route.closestToDestination.stop} (${String.fromCharCode(
                  65 + index + route.stops.length - 1
                )})`}</Td>
                <Td>{route.closestToDestination.distance.toFixed(2)}</Td>
                <Td>{formatDate(route.assignees[0].datetime)}</Td>
                <Td>{route.assignees[0].shuttle_current_capacity}</Td>

                <Td>
                  <Button
                    colorScheme="teal"
                    size="sm"
                    onClick={() => showRouteOnMap(route.stops)}
                  >
                    Show Route
                  </Button>
                  <Button
                    mt="1rem"
                    colorScheme="teal"
                    size="sm"
                    onClick={() => handleConfirmBooking(route)}
                  >
                    Book Route
                  </Button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}
    </Container>
  );
};

export default NewBooking;
