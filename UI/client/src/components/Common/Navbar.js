import React from "react";
import { Button as Btn, HStack, Image, Stack } from "@chakra-ui/react";
import { Link } from "react-scroll";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const NewNavBar = ({ isLoggedIn }) => {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate("/login");
  };

  const handleLogout = async () => {
    try {
      await axios.post(`${process.env.REACT_APP_BACKEND_URI}/api/auth/logout`);
      localStorage.removeItem("token");
      window.location = "/login";
    } catch (error) {
      console.error("Logout failed", error);
    }
  };
  return (
    <Stack justify="center" align="center" bgColor="black" pt="1rem">
      <a href="/">
        <Image src="/easy_shuttle_logo_white.png" height="3rem"></Image>
      </a>
      <HStack>
        <Link to="aboutUs" smooth={true} duration={500}>
          <Btn variant="ghost" color="white">
            About
          </Btn>
        </Link>
        <Link to="contactUs" smooth={true} duration={500}>
          <Btn variant="ghost" color="white">
            Contact
          </Btn>
        </Link>
        <Link to="manage" smooth={true} duration={500}>
          <Btn variant="ghost" color="white">
            Manage
          </Btn>
        </Link>
        {isLoggedIn ? (
          <Btn variant="ghost" color="white" onClick={handleLogout}>
            Logout
          </Btn>
        ) : (
          <Btn variant="ghost" color="white" onClick={handleLogin}>
            Login
          </Btn>
        )}
      </HStack>
    </Stack>
  );
};

export default NewNavBar;