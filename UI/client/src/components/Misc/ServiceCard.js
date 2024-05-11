import React, { useState, useEffect } from "react";
import {
  Box,
  Center,
  Text,
  Stack,
  Button,
  // useColorModeValue,
} from "@chakra-ui/react";
import { Link } from "react-router-dom";

export const ServiceCard = (props) => {
  const { title, icon, buttonText, displayText, disabled, msg, link } = props;

  return (
    <Center py={6}>
      <Box
        w={"full"}
        bgColor="rgba(255, 255, 255, 0.6)"
        boxShadow="0 0 25px 2px #FCCB06"
        rounded={"md"}
        overflow={"hidden"}
        borderColor="yellow.500"
        borderWidth="0.2rem"
      >
        <Stack textAlign={"center"} p={6} color="black" align={"center"}>
          <Stack align={"center"} justify={"center"}>
            {icon}
            <Text fontSize="lg" fontWeight={800}>
              {title}
            </Text>
          </Stack>
        </Stack>

        <Box bg="black" color="white" px={6} py={10}>
          <Text w="15rem" height="3rem" fontWeight="600">
            {displayText}
          </Text>
          {!disabled ? (
            <Link to={link}>
              <Button
                mt={10}
                w={"full"}
                bg={"yellow.500"}
                color={"black"}
                rounded={"xl"}
              >
                {buttonText}
              </Button>
            </Link>
          ) : (
            <Text mt={10} fontSize="lg" fontWeight={600} color="yellow.500">
              {msg}
            </Text>
          )}
        </Box>
      </Box>
    </Center>
  );
};
