import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Select,
  useDisclosure,
  Box,
  Flex,
  Grid,
  GridItem,
  Text,
  Switch,
  InputGroup,
  InputRightElement,
  Tag,
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
  IconButton,
  useToast,
  Stack,
} from "@chakra-ui/react";
import { EditIcon, DeleteIcon } from "@chakra-ui/icons";

import { backendUrl } from "../utils/config";

const ShuttleDetails = () => {
  const addShuttleDisclosure = useDisclosure();
  const editShuttleDisclosure = useDisclosure();
  const [shuttleToEdit, setShuttleToEdit] = useState(null);
  const [shuttle_number, setShuttleNumber] = useState("");
  const [shuttle_name, setShuttleName] = useState("");
  const [vehicle_type, setVehicleType] = useState("");
  const [capacity, setCapacity] = useState("");
  const [shuttles, setShuttles] = useState([]);
  const [viewGrid, setViewGrid] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const toast = useToast();
  const created_by = localStorage.getItem("user_id");

  const vehicleTypeColors = {
    "Mini-Buses": "blue",
    Coaches: "green",
    "Charter Bus": "red",
  };

  useEffect(() => {
    const fetchShuttles = async () => {
      try {
        const response = await axios.get(
          `${backendUrl}/api/shuttle/viewShuttles`,
          {
            params: { created_by, active: true },
          }
        );
        setShuttles(response.data);
      } catch (error) {
        console.error("Error fetching shuttles:", error);
      }
    };
    fetchShuttles();
  }, []);

  const handleAddShuttle = async () => {
    try {
      const response = await axios.post(
        `${backendUrl}/api/shuttle/addShuttle`,
        {
          shuttle_number,
          shuttle_name,
          vehicle_type,
          capacity,
          created_by,
        }
      );
      setShuttles([...shuttles, response.data]);
      addShuttleDisclosure.onClose();
      toast({
        title: "Shuttle added successfully",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error submitting the form:", error);
      toast({
        title: "Error adding shuttle",
        description: error.response.data,
        status: "error",
        duration: 9000,
        isClosable: true,
      });
    }
  };

  const handleEditOpen = (shuttle) => {
    setShuttleToEdit(shuttle);
    setShuttleNumber(shuttle.shuttle_number);
    setShuttleName(shuttle.shuttle_name);
    setVehicleType(shuttle.vehicle_type);
    setCapacity(shuttle.capacity);
    editShuttleDisclosure.onOpen();
  };

  const handleEditShuttle = async () => {
    try {
      const response = await axios.patch(
        `${backendUrl}/api/shuttle/editShuttle/${shuttleToEdit._id}`,
        {
          shuttle_number,
          shuttle_name,
          vehicle_type,
          capacity,
        }
      );
      setShuttles(
        shuttles.map((s) => (s._id === shuttleToEdit._id ? response.data : s))
      );
      editShuttleDisclosure.onClose();
      toast({
        title: "Shuttle updated successfully",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error updating the shuttle:", error);
      toast({
        title: "Error updating shuttle",
        description: error.response.data,
        status: "error",
        duration: 9000,
        isClosable: true,
      });
    }
  };

  const handleDelete = async (shuttleId) => {
    try {
      await axios.patch(`${backendUrl}/api/shuttle/deleteShuttle/${shuttleId}`);
      setShuttles(shuttles.filter((s) => s._id !== shuttleId));
      toast({
        title: "Shuttle deactivated successfully",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error deactivating the shuttle:", error);
      toast({
        title: "Error deactivating shuttle",
        description: error.response.data,
        status: "error",
        duration: 9000,
        isClosable: true,
      });
    }
  };

  const filteredShuttles = shuttles.filter(
    (shuttle) =>
      shuttle.shuttle_number
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      shuttle.shuttle_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shuttle.vehicle_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shuttle.capacity.toString().includes(searchQuery)
  );

  return (
    <div>
      <Flex justifyContent="space-between" alignItems="center" mb="4">
        <InputGroup width="40%">
          <Input
            placeholder="Search shuttles"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <InputRightElement
            width="10%"
            children={
              <Button size="md" fontSize={12} width="100%">
                Search
              </Button>
            }
          />
        </InputGroup>
        <Button onClick={addShuttleDisclosure.onOpen}>Add New Shuttle</Button>
      </Flex>

      <Flex justifyContent="flex-end" mb="4">
        <Text mr={2}>View as Grid:</Text>
        <Switch isChecked={viewGrid} onChange={() => setViewGrid(!viewGrid)} />
      </Flex>

      {viewGrid ? (
        <Box>
          <Grid templateColumns="repeat(auto-fill, minmax(250px, 1fr))" gap={6}>
            {filteredShuttles.map((shuttle) => (
              <GridItem
                key={shuttle._id}
                p={5}
                shadow="md"
                borderWidth="1px"
                borderRadius="md"
              >
                <Text fontWeight="bold">{shuttle.shuttle_name}</Text>
                <Text>Number: {shuttle.shuttle_number}</Text>
                <Tag colorScheme={vehicleTypeColors[shuttle.vehicle_type]}>
                  {shuttle.vehicle_type}
                </Tag>
                <Text>Capacity: {shuttle.capacity}</Text>
                <Stack direction="row" spacing={4} mt={2}>
                  <IconButton
                    aria-label="Edit shuttle"
                    icon={<EditIcon />}
                    colorScheme="blue"
                    onClick={() => handleEditOpen(shuttle)}
                  />
                  <IconButton
                    aria-label="Delete shuttle"
                    icon={<DeleteIcon />}
                    colorScheme="red"
                    onClick={() => handleDelete(shuttle._id)}
                  />
                </Stack>
              </GridItem>
            ))}
          </Grid>
        </Box>
      ) : (
        <Box overflowX="auto">
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Shuttle Number</Th>
                <Th>Shuttle Name</Th>
                <Th>Vehicle Type</Th>
                <Th>Capacity</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredShuttles.map((shuttle) => (
                <Tr key={shuttle._id}>
                  <Td>{shuttle.shuttle_number}</Td>
                  <Td>{shuttle.shuttle_name}</Td>
                  <Td>
                    <Tag colorScheme={vehicleTypeColors[shuttle.vehicle_type]}>
                      {shuttle.vehicle_type}
                    </Tag>
                  </Td>
                  <Td>{shuttle.capacity}</Td>
                  <Td>
                    <Stack direction="row" spacing={4}>
                      <IconButton
                        aria-label="Edit shuttle"
                        icon={<EditIcon />}
                        colorScheme="blue"
                        onClick={() => handleEditOpen(shuttle)}
                      />
                      <IconButton
                        aria-label="Delete shuttle"
                        icon={<DeleteIcon />}
                        colorScheme="red"
                        onClick={() => handleDelete(shuttle._id)}
                      />
                    </Stack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      )}

      {/* Add Shuttle Modal */}
      <Modal
        isOpen={addShuttleDisclosure.isOpen}
        onClose={addShuttleDisclosure.onClose}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add New Shuttle</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>Shuttle Number</FormLabel>
              <Input
                value={shuttle_number}
                onChange={(e) => setShuttleNumber(e.target.value)}
              />
            </FormControl>
            <FormControl mt={4}>
              <FormLabel>Shuttle Name</FormLabel>
              <Input
                value={shuttle_name}
                onChange={(e) => setShuttleName(e.target.value)}
              />
            </FormControl>
            <FormControl mt={4}>
              <FormLabel>Vehicle Type</FormLabel>
              <Select
                placeholder="Select type"
                value={vehicle_type}
                onChange={(e) => setVehicleType(e.target.value)}
              >
                <option value="Mini-Buses">Mini-Buses</option>
                <option value="Coaches">Coaches</option>
                <option value="Charter Bus">Charter Bus</option>
              </Select>
            </FormControl>
            <FormControl mt={4}>
              <FormLabel>Capacity</FormLabel>
              <Select
                placeholder="Select capacity"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
              >
                {Array.from({ length: 100 }, (_, i) => i + 1).map((number) => (
                  <option key={number} value={number}>
                    {number}
                  </option>
                ))}
              </Select>
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleAddShuttle}>
              Save
            </Button>
            <Button variant="ghost" onClick={addShuttleDisclosure.onClose}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default ShuttleDetails;
