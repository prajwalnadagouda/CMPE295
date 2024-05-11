import React, { useState, useEffect } from "react";
import {
  ChakraProvider,
  CSSReset,
  Box,
  Center,
  VStack,
  Switch,
  FormControl,
  FormLabel,
  useColorModeValue,
} from "@chakra-ui/react";
import axios from "axios";
import BookingCard from "./BookingCard";
import { backendUrl, headers } from "../utils/config";

const BookingsDetails = () => {
  const [upcomingData, setUpcomingData] = useState([]);
  const [pastData, setPastData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const upcomingResponse = await axios.get(
          `${backendUrl}/api/routes/upcomingBookings`,
          { headers: headers }
        );
        setUpcomingData(upcomingResponse.data);

        const pastResponse = await axios.get(
          `${backendUrl}/api/routes/pastBookings`,
          { headers: headers }
        );
        setPastData(pastResponse.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const pastBookingsBgColor = useColorModeValue("gray.300", "gray.800");
  const [showPastBookings, setShowPastBookings] = useState(false);

  return (
    <Box>
      {showPastBookings ? (
        <VStack spacing={4}>
          <Center>
            <h2>Past bookings</h2>
          </Center>
          <BookingCard
            bookingData={pastData}
            canEdit={false}
            canDelete={false}
            bgColor={pastBookingsBgColor}
          />
        </VStack>
      ) : (
        <VStack spacing={4}>
          <Center>
            <h2>Bookings</h2>
          </Center>
          <BookingCard
            bookingData={upcomingData}
            canEdit={true}
            canDelete={true}
          />
        </VStack>
      )}
    </Box>
  );
};

export default BookingsDetails;
