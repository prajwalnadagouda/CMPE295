import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Collapse,
  Flex,
  Heading,
  Text,
  Stack,
  VStack,
  HStack,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Divider,
  Center,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";
import axios from "axios";
import { FaMapMarkerAlt } from "react-icons/fa";
import { MdAirlineSeatReclineNormal } from "react-icons/md";
import { IoTimeOutline } from "react-icons/io5";
import TransportCardList from "../helpers/TransportList";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import MapDisplay from "../helpers/MapDisplay";
import MapComponent from "../helpers/MapComponent";
import { hourglass } from "ldrs";
import { BiSad } from "react-icons/bi";
import { backendUrl, headers } from "../../../utils/config";

hourglass.register();

const TransportCard = ({
  service,
  confirmedSelection,
  setConfirmedSelection,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedTimes, setSelectedTimes] = useState({});
  const [shuttleTimes, setShuttleTimes] = useState([]);
  const [mapDetails, setMapDetails] = useState([]);
  // const [confirmedSelection, setConfirmedSelection] = useState([]);

  const handleConfirm = () => {
    const updatedConfirmedSelection = { ...confirmedSelection };

    if (!updatedConfirmedSelection[service.shuttle_id]) {
      updatedConfirmedSelection[service.shuttle_id] = [];
    }

    updatedConfirmedSelection[service.shuttle_id] = Object.keys(
      selectedTimes
    ).reduce((acc, id) => {
      if (selectedTimes[id]) {
        const selectedSlot = shuttleTimes.find(
          (slot) => slot.id.toString() === id
        );
        if (selectedSlot) {
          const newSelection = {
            shuttle_id: service.shuttle_id,
            route_id: service.route_id,
            stop_src_id: selectedSlot.src_slot_id,
            stop_dst_id: selectedSlot.dest_slot_id,
            date: selectedSlot.date,
          };
          acc.push(newSelection);
        }
      }
      return acc;
    }, []);

    setConfirmedSelection(updatedConfirmedSelection);
  };

  const handleExpand = async () => {
    setIsExpanded(!isExpanded);
    try {
      const dataToSend = {
        shuttle_id: service.shuttle_id,
        route_id: service.route_id,
        src_stop_id: service.src_stop_id,
        dest_stop_id: service.dest_stop_id,
      };
      const response = await axios.post(
        `${backendUrl}/api/shuttles/timeslots`,
        dataToSend,
        {
          headers: headers,
        }
      );
      setShuttleTimes(response.data);
      const route_map = await axios.post(
        `${backendUrl}/api/shuttles/maps`,
        {
          shuttle_id: service.shuttle_id,
          route_id: service.route_id,
        },
        {
          headers: headers,
        }
      );
      setMapDetails(route_map.data);
    } catch (error) {
      console.error("Error sending data:", error);
    }
  };

  const toggleTime = (id) => {
    setSelectedTimes((prevSelectedTimes) => {
      const updatedSelectedTimes = { ...prevSelectedTimes };
      updatedSelectedTimes[id] = !updatedSelectedTimes[id];
      return updatedSelectedTimes;
    });
  };

  const isTimeSelected = (id) => {
    return selectedTimes[id] || false;
  };

  // const places = service.stops.reduce((acc, curr) => {
  //   return [...acc, curr.latlong];
  // }, []);

  // const places = [
  //   {
  //     latitude: 37.3960723,
  //     longitude: 121.9599288,
  //   },
  //   {
  //     latitude: 37.3406668,
  //     longitude: -121.892557,
  //   },
  //   {
  //     latitude: 37.3385286,
  //     longitude: -121.8909244,
  //   },
  //   {
  //     latitude: 37.3370862,
  //     longitude: -121.8898582,
  //   },
  //   {
  //     latitude: 37.3384446,
  //     longitude: -121.8855278,
  //   },
  //   {
  //     latitude: 37.3372,
  //     longitude: -121.88332,
  //   },
  //   {
  //     latitude: 37.3351874,
  //     longitude: -121.8810715,
  //   },
  // ];

  const groupTimeSlotsByDay = () => {
    const timeSlotsByDay = {};
    shuttleTimes.forEach((slot) => {
      if (!timeSlotsByDay[slot.day_of_week]) {
        timeSlotsByDay[slot.day_of_week] = [];
      }
      timeSlotsByDay[slot.day_of_week].push(slot);
    });
    return timeSlotsByDay;
  };

  const formatDate = (timeString) => {
    const [hours, minutes] = timeString.split(":");
    const date = new Date();
    date.setHours(parseInt(hours));
    date.setMinutes(parseInt(minutes));

    const options = {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    };

    return date.toLocaleTimeString("en-US", options);
  };

  return (
    <Box borderWidth="1px" borderRadius="lg" p="4" mb="4" w={"100%"}>
      <Flex justify="space-between" align="center">
        <Stack direction="row" alignItems={"center"} flex={3}>
          <FaMapMarkerAlt />
          <VStack spacing={0}>
            <Text fontWeight="bold" mb="0rem" color="white">
              {service.src_stop_address}
            </Text>
          </VStack>
        </Stack>
        <Stack direction="row" alignItems={"center"} flex={3}>
          <FaMapMarkerAlt />
          <VStack spacing={0}>
            <Text fontWeight="bold" mb="0rem" color="white">
              {service.dest_stop_address}
            </Text>
          </VStack>
        </Stack>

        <HStack flex={2}>
          <IoTimeOutline size="1.5rem" />
          <Text mb={"0rem"} color="white">
            {formatDate(service.closest_time)}
          </Text>
        </HStack>

        <HStack flex={2}>
          <MdAirlineSeatReclineNormal size="1.5rem" />
          <Text mb={"0rem"} color="white">
            {service.capacity}
          </Text>
        </HStack>
        <Stack flex={1.5}>
          <Button
            onClick={handleExpand}
            bg={"yellow.500"}
            color={"white"}
            leftIcon={isExpanded ? <FaChevronUp /> : <FaChevronDown />}
          >
            {isExpanded ? "Hide Details" : "Show Details"}
          </Button>
        </Stack>
      </Flex>
      <Collapse in={isExpanded} animateOpacity>
        <Box mt="2" color={"white"}>
          <Divider />
          <Tabs colorScheme={"teal"}>
            <TabList>
              <Tab>
                <Text color={"white"} mb="0rem">
                  Available Shuttle Services
                </Text>
              </Tab>
              <Tab>
                <Text color={"white"} mb="0rem">
                  Route Details
                </Text>
              </Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                <HStack>
                  <Stack width={"50%"}>
                    <VStack>
                      {Object.entries(groupTimeSlotsByDay()).map(
                        ([day_of_week, dayTimeSlots]) => (
                          <VStack key={day_of_week}>
                            <Heading as="h3" size="md" mb={2}>
                              {day_of_week}
                            </Heading>
                            <HStack>
                              {dayTimeSlots.map((slot) => (
                                <Box
                                  key={slot.id}
                                  border="1px solid gray"
                                  borderRadius={"1rem"}
                                  p={2}
                                  m={1}
                                  cursor="pointer"
                                  bg={
                                    isTimeSelected(slot.id) ? "yellow.500" : ""
                                  }
                                  onClick={() => toggleTime(slot.id)}
                                >
                                  {`${formatDate(slot.time_of_departure)}`}
                                </Box>
                              ))}
                            </HStack>
                          </VStack>
                        )
                      )}
                    </VStack>
                  </Stack>
                  <Divider orientation="vertical" height={"20rem"} />
                  <Stack width={"50%"}>
                    <TransportCardList
                      selectedSlots={selectedTimes}
                      timeSlotData={shuttleTimes}
                      capacity={service.capacity}
                    />
                  </Stack>
                </HStack>
                <Box display={"flex"} justifyContent={"center"}>
                  <Button onClick={handleConfirm} bg="yellow.500">
                    Confirm Selection
                  </Button>
                </Box>
              </TabPanel>
              <TabPanel>
                {mapDetails.length > 0 && (
                  <MapDisplay mapDetails={mapDetails} />
                )}
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>
      </Collapse>
    </Box>
  );
};

const TransportList = ({
  availableShuttleInfo,
  setShowTransportList,
  setShowBookingAlert,
}) => {
  const [loading, setLoading] = useState(true);
  const [confirmedSelection, setConfirmedSelection] = useState([]);

  const handleSubmit = async () => {
    const flattenedData = Object.entries(confirmedSelection).reduce(
      (acc, [key, value]) => {
        return acc.concat(
          value.map((item) => ({ ...item, shuttle_id: parseInt(key) }))
        );
      },
      []
    );
    try {
      const response = await axios.post(
        `${backendUrl}/api/shuttles/booking`,
        flattenedData,
        { headers: headers }
      );
      console.log("Confirmation sent successfully:", response.data);
      setConfirmedSelection({});
      setShowBookingAlert(true);
      setShowTransportList(false);
      setTimeout(() => {
        setShowBookingAlert(false);
      }, 5000);
    } catch (error) {
      console.error("Error sending confirmation:", error);
    }
  };

  return (
    <Stack alignItems={"center"} justifyContent={"center"} width={"100%"}>
      {availableShuttleInfo.length == 0 && (
        <Box padding={"10rem"}>
          <Box display={"flex"} alignItems="center" justifyContent={"center"}>
            <BiSad size={"3rem"} />
          </Box>
          <Text mb={0} mt={1} fontWeight={"bold"}>
            No Shuttle Services available, Please modify your search.
          </Text>
        </Box>
      )}
      {availableShuttleInfo.length > 0 && (
        <>
          <Heading textAlign={"center"}> Available Shuttle Services</Heading>
          {availableShuttleInfo.map((service, index) => {
            return (
              <TransportCard
                key={index}
                service={service}
                confirmedSelection={confirmedSelection}
                setConfirmedSelection={setConfirmedSelection}
              />
            );
          })}
        </>
      )}
      <Box>
        <Button bg={"yellow.500"} onClick={handleSubmit}>
          Submit
        </Button>
      </Box>
    </Stack>
  );
};

export default TransportList;
