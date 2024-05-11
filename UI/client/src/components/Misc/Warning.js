import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from "@chakra-ui/react";
import React from "react";

const WarningAlert = ({ title, description }) => {
  return (
    <Alert
      status="info"
      variant="solid"
      flexDirection="row"
      alignItems="center"
      justifyContent="center"
      textAlign="center"
      height="100px"
      borderRadius={10}
    >
      <AlertIcon />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{description}</AlertDescription>
    </Alert>
  );
};

export default WarningAlert;
