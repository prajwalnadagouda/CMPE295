import { useState } from "react";
import axios from "axios";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Link,
  Text,
  Image,
  HStack,
} from "@chakra-ui/react";
import styles from "./styles.module.css";

const Login = () => {
  const [data, setData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = ({ currentTarget: input }) => {
    setData({ ...data, [input.name]: input.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = `${process.env.REACT_APP_BACKEND_URI}/api/auth`;
      const { data: res } = await axios.post(url, data);
      localStorage.setItem("token", res.data[0]);
      localStorage.setItem("user",res.data[1])
      localStorage.setItem("user_id",res.data[2])
      localStorage.setItem("role",res.data[3])
      window.location = "/";
    } catch (error) {
      console.log("Error", error);
      if (
        error.response &&
        error.response.status >= 400 &&
        error.response.status <= 500
      ) {
        setError(error.response.data.message);
      }
    }
  };

  return (
    <Box display="flex" minH={"100vh"} bg="black">
      <Box
        width="40%"
        display="flex"
        alignItems="flex-start"
        justifyContent="flex-end"
        mt="5rem"
      >
        <form
          onSubmit={handleSubmit}
          style={{
            border: "1px solid white",
            padding: "4rem",
            paddingBottom: "7rem",
            borderRadius: "3rem",
            width: "90%",
            color: "darkgray",
          }}
        >
          <FormControl mt={"2rem"}>
            <FormLabel>Email</FormLabel>
            <Input
              type="email"
              placeholder="Email"
              name="email"
              onChange={handleChange}
              value={data.email}
              required
              size={"lg"}
            />
          </FormControl>
          <FormControl mt={4}>
            <FormLabel>Password</FormLabel>
            <Input
              type="password"
              placeholder="Password"
              name="password"
              onChange={handleChange}
              value={data.password}
              required
              size={"lg"}
            />
          </FormControl>
          {error && <Text color={"red.500"}>{error}</Text>}
          <Button type="submit" bg="yellow.500" mt={4}>
            Sign In
          </Button>
          <Button
            bg="yellow.500"
            mt={4}
            ml={3}
            onClick={() => {
              navigate("/forgotpassword");
              console.log("Forgot clicked");
            }}
          >
            Forgot Password
          </Button>

          <HStack mt="1.5rem">
            <Text fontWeight={"bold"} fontSize={"1.2rem"}>
              New Here?
            </Text>
            <Link as={RouterLink} to="/signup">
              <Text
                fontWeight={"bold"}
                fontSize={"1.2rem"}
                textDecoration={"underline"}
              >
                Sign Up
              </Text>
            </Link>
          </HStack>
        </form>
      </Box>
      <Box width="60%" display="flex" justifyContent="center" mt="5rem">
        <Image src="/background.png" alt="Login" width="100%" height={"80%"} />
      </Box>
    </Box>
    /* <Box ml={8}>
        <Image src="/login.jpg" alt="Login" />
       
      </Box>
    </Box> */
  );
};

export default Login;
