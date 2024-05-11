import React, { useState, useEffect } from "react";
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Spinner,
  Alert,
  AlertIcon,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Flex,
  Box,
  useDisclosure,
  Input,
  FormControl,
  FormLabel,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Text,
  IconButton,
  HStack,
  Tooltip,
} from "@chakra-ui/react";
import axios from "axios";
import {
  GoogleMap,
  DirectionsRenderer,
  Marker,
  useLoadScript,
} from "@react-google-maps/api";
import { ViewIcon } from "@chakra-ui/icons";
import { IoArrowRedoSharp } from "react-icons/io5";

const containerStyle = {
  width: "100%",
  height: "100%",
};

const center = {
  lat: 37.335,
  lng: -121.893,
};

const ViewAssign = () => {
  const [routes, setRoutes] = useState([]);
  const [shuttles, setShuttles] = useState([]);
  const [shuttleDetails, setShuttleDetails] = useState([]);
  const [selectedShuttle, setSelectedShuttle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [directions, setDirections] = useState(null);
  const [routeDetails, setRouteDetails] = useState([]);
  const [dateTime, setDateTime] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const shuttleModal = useDisclosure();
  const dateTimeModal = useDisclosure();
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
  });

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const response = await axios.get(
          process.env.REACT_APP_BACKEND_URI + "/api/routes/view"
        );
        setRoutes(response.data);
        setLoading(false);
      } catch (error) {
        setError("Failed to fetch routes.");
        setLoading(false);
      }
    };

    fetchRoutes();
  }, []);

  const showRoute = (route) => {
    setSelectedRoute(route);
    const waypoints = route.stops.slice(1, -1).map((stop) => ({
      location: { lat: stop.stop_lat, lng: stop.stop_long },
      stopover: true,
    }));
    const origin = route.stops[0];
    const destination = route.stops[route.stops.length - 1];

    const directionsService = new window.google.maps.DirectionsService();
    directionsService.route(
      {
        origin: { lat: origin.stop_lat, lng: origin.stop_long },
        destination: { lat: destination.stop_lat, lng: destination.stop_long },
        waypoints: waypoints,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          setDirections(result);
          const routeDetails = result.routes[0].legs.map((leg, index) => ({
            from: route.stops[index].stop_name,
            to: route.stops[index + 1].stop_name,
            distance: leg.distance.text,
          }));
          setRouteDetails(routeDetails);
        }
      }
    );

    onOpen();
  };

  const assignShuttle = async (route) => {
    setSelectedRoute(route);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URI}/api/shuttle/viewShuttles`,
        {
          params: { created_by: localStorage.getItem("user_id") },
        }
      );
      setShuttles(response.data);
      fetchShuttleDetails(route);
      shuttleModal.onOpen();
    } catch (error) {
      console.error("Failed to fetch shuttles:", error);
      setError("Failed to fetch shuttles");
    }
  };

  const fetchShuttleDetails = async (route) => {
    const shuttleIds = route.assignees.map((assignee) => assignee.shuttle_id);
    if (shuttleIds.length > 0) {
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URI}/api/routes/shuttleDetails`,
        {
          params: { shuttleIds: shuttleIds.join(",") },
        }
      );
      setShuttleDetails(response.data);
    } else {
      setShuttleDetails([]);
    }
  };

  const selectShuttle = (shuttle) => {
    setSelectedShuttle(shuttle);
    dateTimeModal.onOpen();
  };

  const confirmAssignment = async () => {
    if (!selectedRoute || !selectedShuttle) {
      setError("Route or shuttle not selected properly.");
      return;
    }
    try {
      const response = await axios.post(
        process.env.REACT_APP_BACKEND_URI + "/api/routes/assignShuttle",
        {
          routeId: selectedRoute._id,
          shuttleId: selectedShuttle._id,
          datetime: dateTime,
          shuttleCapacity: selectedShuttle.capacity,
        }
      );
      console.log("Assignment Successful:", response.data);
      dateTimeModal.onClose();
      shuttleModal.onClose();
      fetchShuttleDetails(selectedRoute);
    } catch (error) {
      console.error(
        "Failed to assign shuttle:",
        error.response ? error.response.data : error
      );
      setError("Failed to assign shuttle");
    }
  };

  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  return (
    <>
      {loading ? (
        <Spinner size="lg" />
      ) : error ? (
        <Alert status="error">
          <AlertIcon />
          {error}
        </Alert>
      ) : (
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Route Name</Th>
              <Th>Type</Th>
              <Th>Source</Th>
              <Th>Destination</Th>
              <Th>No. of Stops</Th>
              <Th>No. of Assignees</Th>
              <Th>Action</Th>
            </Tr>
          </Thead>
          <Tbody>
            {routes.map((route) => (
              <Tr key={route._id}>
                <Td>{route.route_name}</Td>
                <Td>{route.type}</Td>
                <Td>{route.stops[0].stop_name}</Td>
                <Td>{route.stops[route.stops.length - 1].stop_name}</Td>
                <Td>{route.stops.length}</Td>
                <Td>{route.assignees.length}</Td>
                <Td>
                  <HStack>
                    <Tooltip label="View Route" hasArrow>
                      <IconButton
                        aria-label="Show Route"
                        icon={<ViewIcon />}
                        colorScheme="blue"
                        onClick={() => showRoute(route)}
                      />
                    </Tooltip>
                    <Tooltip label="Assign Shuttle" hasArrow>
                      <IconButton
                        aria-label="Assign Shuttle"
                        icon={<IoArrowRedoSharp />}
                        colorScheme="green"
                        ml={2}
                        onClick={() => assignShuttle(route)}
                      />
                    </Tooltip>
                  </HStack>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}
      <Modal isOpen={isOpen} onClose={onClose} size="4xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Route Map and Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {isLoaded && directions && (
              <Flex direction="row" p={5}>
                <Box flex="1">
                  <GoogleMap
                    mapContainerStyle={containerStyle}
                    center={center}
                    zoom={10}
                    onLoad={() => console.log("Map loaded")}
                    onUnmount={() => console.log("Map unmounted")}
                  >
                    <DirectionsRenderer
                      directions={directions}
                      options={{ suppressMarkers: true }}
                    />
                    {selectedRoute.stops.map((stop, index) => (
                      <Marker
                        key={index}
                        position={{ lat: stop.stop_lat, lng: stop.stop_long }}
                        label={stop.stop_order.toString()}
                      />
                    ))}
                  </GoogleMap>
                </Box>
                <Box flex="1">
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>From</Th>
                        <Th>To</Th>
                        <Th>Distance</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {routeDetails.map((detail, index) => (
                        <Tr key={index}>
                          <Td>{detail.from}</Td>
                          <Td>{detail.to}</Td>
                          <Td>{detail.distance}</Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>
              </Flex>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
      <Modal
        isOpen={shuttleModal.isOpen}
        onClose={shuttleModal.onClose}
        size="4xl"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Shuttle Options</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Tabs isFitted variant="enclosed">
              <TabList>
                <Tab>Assign Shuttle</Tab>
                <Tab>View Assigned</Tab>
              </TabList>
              <TabPanels>
                <TabPanel>
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>Shuttle Number</Th>
                        <Th>Shuttle Name</Th>
                        <Th>Vehicle Type</Th>
                        <Th>Capacity</Th>
                        <Th>Action</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {shuttles.map((shuttle) => (
                        <Tr key={shuttle._id}>
                          <Td>{shuttle.shuttle_number}</Td>
                          <Td>{shuttle.shuttle_name}</Td>
                          <Td>{shuttle.vehicle_type}</Td>
                          <Td>{shuttle.capacity}</Td>
                          <Td>
                            <Button
                              colorScheme="blue"
                              onClick={() => selectShuttle(shuttle)}
                            >
                              Select Shuttle
                            </Button>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </TabPanel>
                <TabPanel>
                  {selectedRoute && selectedRoute.assignees.length > 0 ? (
                    <Table variant="simple">
                      <Thead>
                        <Tr>
                          <Th>Shuttle Number</Th>
                          <Th>Shuttle Name</Th>
                          <Th>Vehicle Type</Th>
                          <Th>Actual Capacity</Th>
                          <Th>Current Capacity</Th>
                          <Th>Date Assigned</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {shuttleDetails.map((detail, index) => (
                          <Tr key={index}>
                            <Td>{detail.shuttle_number}</Td>
                            <Td>{detail.shuttle_name}</Td>
                            <Td>{detail.vehicle_type}</Td>
                            <Td>{detail.capacity}</Td>
                            <Td>
                              {
                                selectedRoute.assignees[index]
                                  .shuttle_current_capacity
                              }
                            </Td>
                            <Td>
                              {new Date(
                                selectedRoute.assignees[index].datetime
                              ).toLocaleString()}
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  ) : (
                    <Text>No shuttles assigned to this route.</Text>
                  )}
                </TabPanel>
              </TabPanels>
            </Tabs>
          </ModalBody>
        </ModalContent>
      </Modal>
      <Modal
        isOpen={dateTimeModal.isOpen}
        onClose={dateTimeModal.onClose}
        size="lg"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Set Date and Time</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>Date and Time</FormLabel>
              <Input
                type="datetime-local"
                value={dateTime}
                onChange={(e) => setDateTime(e.target.value)}
                min={getMinDateTime()}
              />
              <Button mt={4} colorScheme="green" onClick={confirmAssignment}>
                Confirm
              </Button>
            </FormControl>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ViewAssign;
