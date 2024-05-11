import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import { ChakraProvider } from "@chakra-ui/react";
import "@fontsource/noto-sans";
import Signup from "./components/Singup";
import Login from "./components/Login";
import HomePage from "./components/HomePage";
import NewNavBar from "./components/Common/Navbar";
import Footer from "./components/Common/Footer";
import ShuttleServiceHome from "./components/shuttleServiceHome";
import ForgotPassword from "./components/ForgotPassword";
import Company from "./components/Company";
import Customer from "./components/Customer";
import theme from "./theme";
import ShuttlePage from "./components/Shuttle";
import AddShuttleRoute from "./components/AddShuttleRoute";
import RecommendedRoutes from "./components/RecommendedRoutes";
import ViewAssign from "./components/ViewAssign";
import NewBooking from "./components/NewBooking";
import BookingsDetails from "./components/BookingsDetails";

function App() {
  const storedToken = localStorage.getItem("token");
  const isLoggedIn = !!storedToken;

  return (
    <ChakraProvider theme={theme}>
      <NewNavBar isLoggedIn={isLoggedIn} />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/signup" element={isLoggedIn ? <Navigate to="/" /> : <Signup />} />
        <Route path="/login" element={isLoggedIn ? <Navigate to="/" /> : <Login />} />
        <Route path="/forgotPassword" element={isLoggedIn ? <Navigate to="/" /> : <ForgotPassword />} />
        <Route path="/customer" element={!isLoggedIn ? <Navigate to="/login" /> : <Customer />} />
        <Route path="/company" element={!isLoggedIn ? <Navigate to="/login" /> : <Company />} />
        <Route path="/shuttleService/*" element={!isLoggedIn ? <Navigate to="/login" /> : <ShuttleServiceHome />}>
          <Route path="manageShuttles" element={<ShuttlePage />} />
          <Route path="addRoute" element={<AddShuttleRoute />} />
          <Route path="recommendedRoutes" element={<RecommendedRoutes />} />
          <Route path="viewAssign" element={<ViewAssign />} />
        </Route>
        <Route path="/customer/*" element={!isLoggedIn ? <Navigate to="/login" /> : <Customer />}>
          <Route path="newBooking" element={<NewBooking />} />
          <Route path="viewBooking" element={<BookingsDetails />}/>
        </Route>
      </Routes>
      <Footer />
    </ChakraProvider>
  );
}

export default App;
