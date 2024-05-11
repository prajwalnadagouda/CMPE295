import React, { useState, useEffect } from "react";
import {
  ChakraProvider,
  CSSReset,
  Box,
  VStack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from "@chakra-ui/react";
import { useNavigate } from 'react-router-dom'; 
import ViewShuttleRoutes from "../NewBooking";
import ViewBookings from "../BookingsDetails";
import theme from "../../theme";

const Customer = () => {
  const [tabIndex, setTabIndex] = useState(0);
  const navigate = useNavigate(); 

  useEffect(() => {
    const role = localStorage.getItem("role");
    if(role !== "Customer") {
      navigate('/'); 
    }
  }, []);

  return (
    <ChakraProvider theme={theme}>
      <CSSReset />
      <Box
        bg="black"
        color="gray"
        minH="100vh"
        p={8}
        display="flex"
        padding={"3rem"}
        width={"100%"}
      >
        <VStack spacing={8} align="stretch" w="100%" maxW="2000px">
          <Tabs
            isFitted
            colorScheme="teal"
            index={tabIndex}
            onChange={(index) => setTabIndex(index)}
          >
            <TabList>
              <Tab>New booking</Tab>
              <Tab>View bookings</Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                <ViewShuttleRoutes />
              </TabPanel>
              <TabPanel>
                <ViewBookings />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </VStack>
      </Box>
    </ChakraProvider>
  );
};

export default Customer;
