import React from "react";
import { ChakraProvider, CSSReset } from "@chakra-ui/react";
import ShuttleDetail from "./ShuttleDetails";

const ShuttlePage = () => {

  return (
    <ChakraProvider>
      <CSSReset />
      <ShuttleDetail />
    </ChakraProvider>
  );
};

export default ShuttlePage;
