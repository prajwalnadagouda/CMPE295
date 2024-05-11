import React from "react";
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Divider,
  Stack,
} from "@chakra-ui/react";
import { FaClock, FaChair, FaBus, FaTrain } from "react-icons/fa";

const TransportSlotDetails = ({ slot, capacity }) => {
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
    <Box borderWidth="1px" borderRadius="lg" p="4" mb="4">
      <Heading as="h3" size="md" mb={2}>
        {slot.day_of_week} - {formatDate(slot.time_of_departure)} to{" "}
        {formatDate(slot.time_of_arrival)}
      </Heading>
      <Divider mb={2} />
      <HStack alignItems="flex-start" spacing={"2rem"}>
        <HStack>
          <FaChair />
          <Text mb={"0rem"}>
            {slot.available_capacity} / {capacity} seats available
          </Text>
        </HStack>
        <HStack>
          {slot.vehicleType === "Bus" ? <FaBus /> : <FaTrain />}
          <Text mb={"0rem"}>{slot.vehicle_type}</Text>
        </HStack>
        <HStack>
          <Text mb={"0rem"}>Operator: {slot.shuttle_name}</Text>
        </HStack>
      </HStack>
    </Box>
  );
};

const TransportCardList = ({ selectedSlots, timeSlotData, capacity }) => {
  const filteredKeys = Object.keys(selectedSlots).filter(
    (key) => selectedSlots[key] === true
  );
  const filteredTimeSlots = timeSlotData.filter((slot) =>
    filteredKeys.includes(slot.id.toString())
  );

  return (
    <Stack>
      {Object.keys(filteredTimeSlots).length > 0 && (
        <VStack spacing={4}>
          <Heading as="h2" size="md" mb={4}>
            Selected Time Slot Details
          </Heading>
          {Object.keys(filteredTimeSlots).map((key) => (
            <TransportSlotDetails
              key={key}
              slot={filteredTimeSlots[key]}
              capacity={capacity}
            />
          ))}
        </VStack>
      )}
    </Stack>
  );
};

export default TransportCardList;
