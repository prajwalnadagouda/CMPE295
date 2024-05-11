import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App";
// import { ChakraProvider } from "@chakra-ui/react";

ReactDOM.render(
  <React.StrictMode>
    {/* <ChakraProvider> */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
    {/* </ChakraProvider> */}
  </React.StrictMode>,
  document.getElementById("root")
);
