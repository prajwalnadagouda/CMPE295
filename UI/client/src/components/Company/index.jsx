import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import {
  Box,
  Text,
  Heading,
  Flex,
  HStack,
  Stack,
  Divider,
} from "@chakra-ui/react";
import { backendUrl, headers } from "../../utils/config";

function Company() {
  const [company, setCompany] = useState();
  const { companyId } = useParams();
  const [error, setError] = useState("");

  const fetchCompanyData = async () => {
    try {
      const response = await axios.get(
        // "https://flrouting.azurewebsites.net/globalmodelstatus"
        "https://routeplanning.onrender.com/globalmodelstatus"
      );
      console.log(response.data);
      setCompany(response.data);
    } catch (error) {
      if (
        error.response &&
        error.response.status >= 400 &&
        error.response.status <= 500
      ) {
        setError(error.response.data.message);
      }
      console.error("Error fetching shuttle data:", error);
    }
  };

  useEffect(() => {
    fetchCompanyData();
  }, []);

  function formatDate(dateString) {
    const date = new Date(dateString);
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZoneName: "short",
    };
    return date.toLocaleDateString("en-US", options);
  }

  return (
    <Flex align="center" justify="center" h="90vh" bg="black">
      <Box
        p={"4rem"}
        border="1px white solid"
        borderRadius={20}
        textAlign="center"
        w="50rem"
      >
        <HStack spacing={10} justify="space-between" w="100%">
          <HStack>
            <Heading color="yellow.500">
              Global Model Last Updated on :{" "}
            </Heading>
            <Text color="white" fontSize="xl">
              {formatDate(company)}
            </Text>
          </HStack>
          {/* <Heading size="xl" color="white" fontWeight="1000">
            {company.companyName}
          </Heading>
          <Stack spacing={0}>
            <HStack>
              <Text color="white" fontWeight="bold" textAlign={"start"}>
                <strong>Resource Count </strong>
              </Text>
              <Text
                // w="20%"
                color="white"
                fontWeight="bold"
                textAlign={"right"}
                paddingLeft={"10rem"}
                textColor={"#FCCB06"}
              >
                {company.resourceCount}
              </Text>
            </HStack>
            <Divider mt={-4} mb={5} />
            <HStack>
              <Text color="white" fontWeight="bold" textAlign={"start"}>
                <strong>Subscription Until </strong>
              </Text>
              <Text
                color="white"
                fontWeight="bold"
                paddingLeft={"9rem"}
                textColor={"#FCCB06"}
              >
                {new Date(company.subscriptionUntil).toLocaleDateString(
                  "en-US",
                  {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }
                )}
              </Text>
            </HStack>
            <Divider mt={-4} mb={5} />
            <HStack>
              <Text color="white" fontWeight="bold" textAlign={"start"}>
                <strong>Joined On </strong>
              </Text>
              <Text
                color="white"
                fontWeight="bold"
                paddingLeft={"12.8rem"}
                textColor={"#FCCB06"}
              >
                {new Date(company.joinedOn).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </Text>
            </HStack>
            <Divider mt={-4} mb={5} />
          </Stack> */}
        </HStack>
      </Box>
    </Flex>
  );
}

export default Company;
