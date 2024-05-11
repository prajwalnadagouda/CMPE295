import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from "@chakra-ui/react";
import React from "react";

const ErrorAlert = (title) => {
  return (
    <Alert status="error">
      <AlertIcon />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>Please check and submit again.</AlertDescription>
    </Alert>
  );
};

export default ErrorAlert;
