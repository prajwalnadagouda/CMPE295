// BookingCard.js
import React, { useState } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  IconButton,
  Badge,
  Divider,
  Collapse,
  useColorModeValue,
} from "@chakra-ui/react";
import axios from "axios";
import { EditIcon, DeleteIcon } from "@chakra-ui/icons";
import { backendUrl, headers } from "../utils/config";

const BookingCard = ({ bookingData, canEdit, canDelete, bgColor }) => {
  const [expandedCard, setExpandedCard] = useState(null);
  const defaultBgColor = useColorModeValue("gray.100", "gray.700");

  const handleToggleStops = (index) => {
    setExpandedCard((prevExpandedCard) =>
      prevExpandedCard === index ? null : index
    );
  };

  const handleDelete = async (bookingId) => {
    try {
      const response = await axios.post(
        `${backendUrl}/api/shuttles/deleteBooking`,
        { bookingId: bookingId },
        {
          headers: headers,
        }
      );
      console.log("Booking deleted successfully:", response.data);
    } catch (error) {
      console.error("Error deleting booking:", error);
    }
  };

  return (
    <Box w="full" display="flex" flexWrap="wrap" justifyContent={"center"}>
      {bookingData.map((booking, index) => (
        <Box
          key={index}
          p={4}
          bg={"black" || defaultBgColor}
          rounded="lg"
          overflow="hidden"
          shadow="base"
          position="relative"
          w="auto"
          h={expandedCard === index ? "auto" : "300px"}
          border="1px solid"
          borderColor={"white" || defaultBgColor}
          m={2}
          transition="all 0.2s ease"
        >
          <VStack align="stretch" spacing={2}>
            <HStack justifyContent="space-between">
              <Badge colorScheme="blue">Route {booking.shuttleNumber}</Badge>
              <Badge colorScheme="green">
                Vehicle No. {booking.vehicleName}
              </Badge>
              <Badge colorScheme="red">Capacity {booking.capacity}</Badge>
            </HStack>
            <Divider />
            <HStack>
              <Text fontSize="lg">Bus Start Time: {booking.startTime}</Text>
            </HStack>
            <HStack justifyContent="space-between">
              <Text fontSize="lg" fontWeight="bold">
                {booking.source}
              </Text>
            </HStack>
            <HStack justifyContent="space-between">
              <Text
                fontSize="lg"
                fontWeight="bold"
                cursor="pointer"
                backgroundColor="#808080"
                color="white"
                borderRadius="10px"
                padding="5px"
                onClick={() => handleToggleStops(index)}
              >
                Ride {booking.stops.length} stops
              </Text>
              {/* <Text fontSize="lg">{booking.estimatedTime}</Text> */}
            </HStack>
            <HStack justifyContent="space-between">
              <Text fontSize="lg" fontWeight="bold">
                {booking.destination}
              </Text>
              {/* <Text fontSize="lg">{booking.endTime}</Text> */}
            </HStack>
          </VStack>
          <Collapse in={expandedCard === index} animateOpacity>
            <VStack
              align="stretch"
              p={2}
              mt={2}
              rounded="md"
              shadow="base"
              bg={bgColor || defaultBgColor}
            >
              {booking.stops.map((stop, stopIndex) => (
                <Text key={stopIndex} fontSize="md" pl={4}>
                  {stop}
                </Text>
              ))}
            </VStack>
          </Collapse>
          <HStack mt={2} justifyContent="space-between" alignItems="center">
            {canDelete && (
              <IconButton
                icon={<DeleteIcon w={8} h={6} />}
                aria-label="Delete"
                variant="outline"
                color="red.500"
                onClick={() => handleDelete(5)}
              />
            )}
          </HStack>
        </Box>
      ))}
    </Box>
  );
};

export default BookingCard;
