import React, { useState } from "react";
import {
  Button,
  Divider,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  VStack,
  HStack,
  Text,
  Heading,
} from "@chakra-ui/react";

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form Data:", formData);
  };

  return (
    <>
      <HStack
        spacing={8}
        align="center"
        justify="center"
        mt="-5rem"
        zIndex="100"
      >
        <VStack align="start" spacing={2} w="20%">
          <Heading>Get in touch</Heading>
          <Text fontWeight="bold">Email: easyShuttle@gmail.com</Text>
          <Text fontWeight="bold">Phone: +123 456 7890</Text>
          <p>
            Welcome to our contact section! We value your inquiries and
            feedback. Feel free to reach out to us via email or phone. Our team
            is here to assist you.
          </p>
        </VStack>

        <VStack
          as="form"
          spacing={4}
          align="start"
          onSubmit={handleSubmit}
          w="50%"
        >
          <HStack w={"44.5rem"}>
            <FormControl>
              <FormLabel htmlFor="name">Name</FormLabel>
              <Input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
              />
            </FormControl>

            <FormControl>
              <FormLabel htmlFor="email">Email</FormLabel>
              <Input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
            </FormControl>
          </HStack>
          <FormControl>
            <FormLabel htmlFor="message">Message</FormLabel>
            <Textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              h="120px"
            />
          </FormControl>

          <Button type="submit" bg={"yellow.500"} color={"black"}>
            Send
          </Button>
        </VStack>
      </HStack>
      <Divider mt={"4rem"} />
    </>
  );
};

export default ContactForm;
