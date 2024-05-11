import React from "react";
import { Routes, Route, NavLink, Outlet } from "react-router-dom";
import { ChakraProvider, Box, VStack, Tab, TabList, Tabs } from "@chakra-ui/react";
import ViewRoutes from "./ViewRoutes";
import ShuttlePage from "./Shuttle";
import AddShuttleRoute from "./AddShuttleRoute";
import RecommendedRoutes from "./RecommendedRoutes";

const ShuttleServiceHome = () => {
  return (
    <ChakraProvider>
      <Box
        bg="black"
        color="white"
        minH="100vh"
        p={8}
        display="flex"
        padding={"3rem"}
      >
        <VStack spacing={8} align="stretch" w="100%" maxW="2000px">
          <Tabs isFitted colorScheme="teal">
            <TabList>
              <Tab as={NavLink} to="manageShuttles">Manage Shuttles</Tab>
              <Tab as={NavLink} to="addRoute">Add Route</Tab>
              <Tab as={NavLink} to="recommendedRoutes">Recommended Routes</Tab>
              <Tab as={NavLink} to="viewAssign">View and Assign to Routes</Tab>
            </TabList>
          </Tabs>
          <Outlet />  {/* This is where the nested routes will render their components */}
        </VStack>
      </Box>
    </ChakraProvider>
  );
};

export default ShuttleServiceHome;
