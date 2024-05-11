import { Heading, HStack, Stack, Text } from "@chakra-ui/react";
import { AnimatedText } from "./Misc/AnimatedText";
import { ServiceCard } from "./Misc/ServiceCard";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { FaPerson, FaBuilding, FaBus } from "react-icons/fa6";
import { backendUrl, headers } from "../utils/config";
import ContactForm from "./Forms/ContactForm";

const HomePage = () => {
  const [userData, setUserData] = useState({});
  const [disabled, setDisabled] = useState(true);
  const [disabledStates, setDisabledStates] = useState({
    employee: true,
    employer: true,
    busShuttleProvider: true,
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/auth/getUserData`, {
          headers: headers,
        });
        setUserData(response.data.data || {});
        const userRole = response.data.data.role;
        console.log(userRole);
        setDisabledStates({
          employee: userRole !== "Customer",
          employer: userRole !== "Company",
          busShuttleProvider: userRole !== "ShuttleServiceProvider",
        });
      } catch (error) {
        console.error("Error fetching shuttle data:", error);
      }
    };
    fetchUserData();
  }, []);
  return (
    <Stack spacing="0">
      <Stack
        width="full"
        height="40rem"
        bgImage="/background-3.png"
        backgroundRepeat="no-repeat"
        backgroundSize="cover"
        alignItems="center"
        justify="center"
      >
        <HStack spacing="2" w="35rem" alignItems="center" justify="center">
          <Heading color="white">Making scheduling </Heading>
          <AnimatedText words={["Easy.", "Faster.", "Intelligent."]} />
        </HStack>
      </Stack>
      <Stack
        width="full"
        height="50rem"
        bgColor="yellow.500"
        color="black"
        alignItems="center"
        justify="center"
        p="4rem"
        id="aboutUs"
      >
        <Heading fontWeight="800" opacity="0.3" fontSize="250">
          About Us
        </Heading>
        <Text mt="-10rem" fontSize="30" fontWeight="600" px="9rem">
          Embark on a new era of convenient and reliable shuttle transportation
          with easyShuttle. As a startup passionate about making travel
          accessible and enjoyable, we are excited to introduce you to a fresh
          and modern approach to shuttle services.
          <br></br>
          <br></br>
          <Text fontWeight={"bold"} fontSize="40">
            Our Startup Journey:
          </Text>
          At easyShuttle, we are driven by the vision of creating a
          transportation experience that goes beyond the ordinary. As a newly
          established venture, we bring a dynamic and innovative spirit to the
          world of shuttle services.
        </Text>
      </Stack>
      <Stack
        width="full"
        height="60rem"
        bgColor="black"
        color="white"
        alignItems="center"
        justify="center"
        id="contactUs"
      >
        <Heading
          fontWeight="800"
          opacity="0.3"
          fontSize="220"
          color="yellow.500"
          px="3rem"
        >
          Contact Us
        </Heading>
        <ContactForm />
      </Stack>

      <Stack
        width="full"
        height="50rem"
        bgColor="black"
        color="white"
        alignItems="center"
        justify="center"
        id="manage"
      >
        <Heading
          fontWeight="800"
          opacity="0.3"
          fontSize="220"
          color="yellow.500"
          px="3rem"
        >
          We cater
        </Heading>
        <HStack mt="-10rem" zIndex="100">
          <ServiceCard
            disabled={disabledStates["employee"]}
            title="Employee"
            icon={<FaPerson size="3rem" />}
            buttonText="Book"
            displayText="Looking to hop on to a public transport?"
            msg="Login as employee to access this"
            link="/customer"
          />
          <ServiceCard
            disabled={disabledStates["employer"]}
            title="Employer"
            icon={<FaBuilding size="3rem" />}
            buttonText="Manage"
            displayText="Make your employees happy"
            msg="Login as employeer to access this"
            link="/company"
          />
          <ServiceCard
            disabled={disabledStates["busShuttleProvider"]}
            title="Bus shuttle provider"
            icon={<FaBus size="3rem" />}
            buttonText="Manage"
            displayText="Provider of reliable bus shuttle services!"
            msg="Login as provider to access this"
            link="/shuttleService/manageShuttles"
          />
        </HStack>
      </Stack>
    </Stack>
  );
};

export default HomePage;
