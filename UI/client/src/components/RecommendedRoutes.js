import React, { useState, useCallback, useEffect } from "react";
import {
  Button,
  HStack,
  VStack,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Box,
  Flex,
  useToast,
  Input,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  IconButton,
  Tooltip,
} from "@chakra-ui/react";
import { ViewIcon, InfoIcon, CheckIcon } from "@chakra-ui/icons";
import {
  GoogleMap,
  Marker,
  DirectionsService,
  DirectionsRenderer,
  useLoadScript,
} from "@react-google-maps/api";

const containerStyle = {
  width: "40vw",
  height: "50vh",
};

const center = {
  lat: 37.335,
  lng: -121.893,
};

const RecommendedRoutes = () => {
  const [routeData, setRouteData] = useState({});
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [showDetailedInfo, setShowDetailedInfo] = useState(false);
  const [detailedInfo, setDetailedInfo] = useState([]);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [routeName, setRouteName] = useState("");
  const toast = useToast();
  const areas = [
    "South Bay",
    "East Bay",
    "North Bay",
    "Peninsula",
    "San Francisco",
  ];
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
  });

  useEffect(() => {
    if (loadError) {
      toast({
        title: "Map Loading Error",
        description: "Failed to load Google Maps API.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  }, [loadError, toast]);

  const handleAreaClick = async (area) => {
    try {
      const response = await fetch(
        "https://routeplanning.onrender.com/routes",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ area: area, capacity: 100 }),
        }
      );
      const data = await response.json();
      setRouteData(data);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to fetch data",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleShowRoute = useCallback(
    (route) => {
      if (!isLoaded) return;

      const directionsService = new window.google.maps.DirectionsService();
      const waypoints = route.Stops.slice(1, -1).map((stop) => ({
        location: { lat: parseFloat(stop[1]), lng: parseFloat(stop[2]) },
        stopover: true,
      }));

      const origin = route.Stops[0];
      const destination = route.Stops[route.Stops.length - 1];

      const request = {
        origin: { lat: parseFloat(origin[1]), lng: parseFloat(origin[2]) },
        destination: {
          lat: parseFloat(destination[1]),
          lng: parseFloat(destination[2]),
        },
        waypoints,
        travelMode: "DRIVING",
      };

      directionsService.route(request, (result, status) => {
        if (status === "OK") {
          setSelectedRoute(result);
          createCustomMarkers(result, route);
        } else {
          toast({
            title: "Routing Error",
            description: "Could not compute route directions.",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
        }
      });
    },
    [isLoaded, toast]
  );

  const createCustomMarkers = useCallback((result, route) => {
    const markersArray = [];
    const { legs } = result.routes[0];
    markersArray.push({
      position: legs[0].start_location,
      label: "S",
    });
    legs.forEach((leg, index) => {
      if (index < legs.length - 1) {
        markersArray.push({
          position: leg.end_location,
          label: String(index + 1),
        });
      }
    });
    markersArray.push({
      position: legs[legs.length - 1].end_location,
      label: "D",
    });
    setMarkers(markersArray);

    const detailedInfoArray = [];
    legs.forEach((leg, index) => {
      const distanceText = leg.distance.text;
      const startName =
        index === 0 ? route.StartPoint[0] : route.Stops[index][0];
      const endName =
        index === legs.length - 1
          ? route.EndPoint[0]
          : route.Stops[index + 1][0];
      detailedInfoArray.push({ startName, endName, distanceText });
    });
    setDetailedInfo(detailedInfoArray);
  }, []);

  const handleShowDetailedInfo = () => {
    setShowDetailedInfo(true);
  };

  const handleGoBack = () => {
    setShowDetailedInfo(false);
  };

  const handleSaveRoute = () => {
    setIsSaveModalOpen(true);
  };

  const handleConfirmSave = async () => {
    try {
      if (!detailedInfo || detailedInfo.length === 0) {
        throw new Error("No detailed information available");
      }

      const routeDataToSave = {
        created_by: localStorage.getItem("user_id"),
        route_name: routeName,
        stops: markers.map((marker) => {
          if (marker.label === "S") {
            return {
              stop_name: detailedInfo[0]?.startName,
              stop_lat: marker.position.lat(),
              stop_long: marker.position.lng(),
              stop_order: "S",
            };
          } else if (marker.label === "D") {
            return {
              stop_name: detailedInfo[detailedInfo.length - 1]?.endName,
              stop_lat: marker.position.lat(),
              stop_long: marker.position.lng(),
              stop_order: "D",
            };
          } else {
            const stopIndex = parseInt(marker.label);
            return {
              stop_name: detailedInfo[stopIndex]?.startName,
              stop_lat: marker.position.lat(),
              stop_long: marker.position.lng(),
              stop_order: parseInt(marker.label).toString(),
            };
          }
        }),
        active: true,
        type: "R",
        updated_at: new Date(),
      };

      console.log(routeDataToSave);

      const response = await fetch(
        process.env.REACT_APP_BACKEND_URI + "/api/routes/save",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(routeDataToSave),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save route");
      }

      const savedRoute = await response.json();
      console.log("Route saved successfully:", savedRoute);

      setIsSaveModalOpen(false);
      setRouteName("");
      toast({
        title: "Success",
        description: "Route saved successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error saving route:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save route",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Flex direction="row" p={5} align="center">
      {!showDetailedInfo && (
        <VStack align="start" width="50%" spacing={4}>
          <HStack width="100%" spacing={4}>
            {areas.map((area) => (
              <Button
                key={area}
                onClick={() => handleAreaClick(area)}
                colorScheme="blue"
              >
                {area}
              </Button>
            ))}
          </HStack>
          {Object.keys(routeData).length > 0 && (
            <Tabs isFitted variant="enclosed">
              <TabList mb="1em">
                {days.map((day) => (
                  <Tab key={day}>{day}</Tab>
                ))}
              </TabList>
              <TabPanels>
                {days.map((day) => (
                  <TabPanel key={day}>
                    <Table variant="simple">
                      <Thead>
                        <Tr>
                          <Th>Start Point</Th>
                          <Th>End Point</Th>
                          <Th>People Count</Th>
                          <Th>Number of Stops</Th>
                          <Th>Action</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {routeData[day]?.map((route, index) => (
                          <Tr key={index}>
                            <Td>{route.StartPoint[0]}</Td>
                            <Td>{route.EndPoint[0]}</Td>
                            <Td>{route.PeopleCount}</Td>
                            <Td>{route.Stops.length}</Td>
                            <Td>
                              <HStack>
                                <Tooltip
                                  label="Show Route"
                                  hasArrow
                                  placement="top"
                                >
                                  <IconButton
                                    icon={<ViewIcon />}
                                    colorScheme="teal"
                                    m="5px"
                                    onClick={() => handleShowRoute(route)}
                                    aria-label="Show Route"
                                  />
                                </Tooltip>
                                <Tooltip
                                  label="View Details"
                                  hasArrow
                                  placement="top"
                                >
                                  <IconButton
                                    icon={<InfoIcon />}
                                    colorScheme="teal"
                                    m="5px"
                                    onClick={handleShowDetailedInfo}
                                    aria-label="View Details"
                                  />
                                </Tooltip>
                                <Tooltip
                                  label="Save Route"
                                  hasArrow
                                  placement="top"
                                >
                                  <IconButton
                                    icon={<CheckIcon />}
                                    colorScheme="teal"
                                    m="5px"
                                    onClick={handleSaveRoute}
                                    aria-label="Save Route"
                                  />
                                </Tooltip>
                              </HStack>
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </TabPanel>
                ))}
              </TabPanels>
            </Tabs>
          )}
        </VStack>
      )}
      {showDetailedInfo && (
        <Box width="50%">
          <Button onClick={handleGoBack} colorScheme="blue">
            Go Back
          </Button>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Source</Th>
                <Th>Destination</Th>
                <Th>Distance</Th>
              </Tr>
            </Thead>
            <Tbody>
              {detailedInfo.map((info, index) => (
                <Tr key={index}>
                  <Td>{info.startName}</Td>
                  <Td>{info.endName}</Td>
                  <Td>{info.distanceText}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      )}
      {isLoaded && (
        <Box width="40%" height="300px" justify="center" marginLeft="6rem">
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={10}
            onLoad={() => console.log("Map loaded")}
            onUnmount={() => console.log("Map unmounted")}
          >
            {selectedRoute && (
              <DirectionsRenderer
                directions={selectedRoute}
                options={{ suppressMarkers: true }}
              />
            )}
            {markers.map((marker, idx) => (
              <Marker
                key={idx}
                position={marker.position}
                label={marker.label}
              />
            ))}
          </GoogleMap>
        </Box>
      )}
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
            <Button colorScheme="blue" mr={3} onClick={handleConfirmSave}>
              Save
            </Button>
            <Button variant="ghost" onClick={() => setIsSaveModalOpen(false)}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
  );
};

export default RecommendedRoutes;
