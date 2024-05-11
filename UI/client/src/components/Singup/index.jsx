import { useState } from "react";
import axios from "axios";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  Text,
  Image,
  HStack,
  Link,
} from "@chakra-ui/react";

const Signup = () => {
  const [data, setData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    role: "",
    active: true,
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = ({ currentTarget: input }) => {
    setData({ ...data, [input.name]: input.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = `${process.env.REACT_APP_BACKEND_URI}/api/user`;
      const { data: res } = await axios.post(url, data);
      navigate("/login");
      console.log(res.message);
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
          <h1>Create Account</h1>
          <HStack>
            <FormControl>
              <FormLabel color={"darkgray"}>First Name</FormLabel>
              <Input
                color={"darkgray"}
                type="text"
                placeholder="First Name"
                name="first_name"
                onChange={handleChange}
                value={data.first_name}
                required
              />
            </FormControl>
            <FormControl>
              <FormLabel>Last Name</FormLabel>
              <Input
                type="text"
                placeholder="Last Name"
                name="last_name"
                onChange={handleChange}
                value={data.last_name}
                required
              />
            </FormControl>
          </HStack>
          <HStack>
            <FormControl mt={4}>
              <FormLabel>Email</FormLabel>
              <Input
                type="email"
                placeholder="Email"
                name="email"
                onChange={handleChange}
                value={data.email}
                required
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
              />
            </FormControl>
          </HStack>
          <FormControl mt={4}>
            <FormLabel>Role</FormLabel>
            <Select
              placeholder="Select Role"
              name="role"
              onChange={handleChange}
              value={data.role}
              required
            >
              <option value="Customer">Customer</option>
              <option value="ShuttleServiceProvider">
                Shuttle Service Provider
              </option>
              <option value="Company">Company</option>
              <option value="Admin">Admin</option>
            </Select>
          </FormControl>
          {error && <Text color="red.500">{error}</Text>}
          <Button type="submit" bg="yellow.500" mt={4}>
            Sign Up
          </Button>
          <HStack mt="1.5rem">
            <Text fontWeight={"bold"} fontSize={"1.2rem"}>
              Already have an account?
            </Text>
            <Link as={RouterLink} to="/login">
              <Text
                fontWeight={"bold"}
                fontSize={"1.2rem"}
                textDecoration={"underline"}
              >
                Sign in
              </Text>
            </Link>
          </HStack>
        </form>
      </Box>
      <Box width="60%" display="flex" justifyContent="center" mt="5rem">
        <Image src="/background.png" alt="Login" width="100%" height={"80%"} />
      </Box>
    </Box>
  );
};

export default Signup;
