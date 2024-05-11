import { useState } from "react";
import axios from "axios";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Text,
  Image,
  VStack,
  Link,
  Center,
} from "@chakra-ui/react";

const ForgetPassword = () => {
  const [data, setData] = useState({
    email: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = ({ currentTarget: input }) => {
    setError("");
    setData({ ...data, [input.name]: input.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const url = `${process.env.REACT_APP_BACKEND_URI}/api/users/forgotPassword`;
      const { email, confirmPassword } = data;
      console.log("here in data", { email, confirmPassword });
      const res = await axios.put(url, { email, confirmPassword });
      console.log(res);
      if (res.status === 201) {
        alert("User's password changed successfully");
        navigate("/login");
      }
    } catch (error) {
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
            borderRadius: "3rem",
            width: "90%",
            color: "darkgray",
          }}
        >
          <VStack>
            <FormControl>
              <FormLabel>Email</FormLabel>
              <Input
                type="text"
                placeholder="Email Id"
                name="email"
                onChange={handleChange}
                value={data.email}
                required
              />
            </FormControl>
            <FormControl>
              <FormLabel>New Password</FormLabel>
              <Input
                type="password"
                placeholder="New Password"
                name="newPassword"
                onChange={handleChange}
                value={data.newPassword}
                required
              />
            </FormControl>
            <FormControl>
              <FormLabel>Confirm Password</FormLabel>
              <Input
                type="password"
                placeholder="Confirm Password"
                name="confirmPassword"
                onChange={handleChange}
                value={data.confirmPassword}
                required
              />
            </FormControl>
          </VStack>

          <Button bg="yellow.500" mt={4} type="submit">
            Submit
          </Button>
        </form>
      </Box>
      <Box width="60%" display="flex" justifyContent="center" mt="5rem">
        <Image
          src="../background.png"
          alt="Login"
          width="100%"
          height={"80%"}
        />
      </Box>
    </Box>
  );
};

export default ForgetPassword;
