import React, { useState, useEffect } from "react";
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
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
  Alert,
  AlertIcon,
  AlertTitle,
  // ChakraProvider,
  // CSSReset,
  Box,
  // Text,
} from "@chakra-ui/react";
import axios from "axios";
import WarningAlert from "./Misc/Warning";

const VehicleTable = () => {
  const token = localStorage.getItem("token");
  // console.log(token);
  const headers = {
    token: token,
  };
  const backendUrl = `${process.env.REACT_APP_BACKEND_URI}`;
  const [isAdding, setIsAdding] = useState(false);
  const [newVehicle, setNewVehicle] = useState({
    vehicleNumber: "",
    type: "",
    totalCapacity: 0,
    remainingCapacity: 0,
    active: true,
  });
  const [vehicleData, setVehicleData] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editedVehicle, setEditedVehicle] = useState({});
  const [errorResp, setError] = useState("");

  const fetchVehicleData = async () => {
    try {
      const response = await axios.get(
        `${backendUrl}/api/vehicles/getVehicles`,
        {
          headers: headers,
        }
      );
      setVehicleData(response.data);
      console.log(vehicleData);
    } catch (error) {
      if (
        error.response &&
        error.response.status >= 400 &&
        error.response.status <= 500
      ) {
        setError(error.response.data.error);
      }
      console.error("Error fetching vehicle data:", error);
    }
  };

  const handleAdd = () => {
    setIsAdding(true);
  };

  const handleCloseAdd = () => {
    setIsAdding(false);
    setError("");
    setNewVehicle({
      vehicleNumber: "",
      type: "",
      totalCapacity: 0,
      remainingCapacity: 0,
      active: false,
    });
  };
  const handleSaveAdd = async () => {
    try {
      await axios.post(`${backendUrl}/api/vehicles/addVehicles`, newVehicle, {
        headers: headers,
      });
      setIsAdding(false);
      setError("");
      fetchVehicleData();
      setNewVehicle({
        vehicleNumber: "",
        type: "",
        totalCapacity: 0,
        remainingCapacity: 0,
        active: false,
      });
    } catch (error) {
      if (
        error.response &&
        error.response.status >= 400 &&
        error.response.status <= 500
      ) {
        setError(error.response.data.error);
        console.log(errorResp);
      }
      console.error("Error adding new vehicle:", error);
    }
  };

  const handleEdit = (vehicle) => {
    setEditedVehicle(vehicle);
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    try {
      await axios.put(
        `${backendUrl}/api/vehicles/editVehicle/${editedVehicle._id}`,

        editedVehicle,
        {
          headers: headers,
        }
      );
      setIsEditing(false);
      setError("");
      fetchVehicleData();
    } catch (error) {
      if (
        error.response &&
        error.response.status >= 400 &&
        error.response.status <= 500
      ) {
        setError(error.response.data.error);
      }
      console.error("Error editing vehicle:", error);
    }
  };

  const handleDelete = async (vehicleId) => {
    try {
      await axios.delete(
        `${backendUrl}/api/vehicles/deleteVehicle/${vehicleId}`,
        {
          headers: headers,
        }
      );
      fetchVehicleData();
    } catch (error) {
      if (
        error.response &&
        error.response.status >= 400 &&
        error.response.status <= 500
      ) {
        setError(error.response.data.error);
      }
      console.error("Error deleting vehicle:", error);
    }
  };

  useEffect(() => {
    fetchVehicleData();
  }, []);
  // useEffect(() => {
  //   fetchShuttleData();
  // }, []);

  return (
    <>
      <Button colorScheme="teal" onClick={handleAdd} float={"right"}>
        Add Vehicle
      </Button>
      {vehicleData.length === 0 ? (
        <Box mt={"10rem"}>
          <WarningAlert
            title={"The Vehicle Data Is Empty!"}
            description={"Please add data to view them here."}
          />
        </Box>
      ) : (
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Vehicle No</Th>
              <Th>Type</Th>
              <Th>Total Capacity</Th>
              <Th>Remaining Capacity</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {vehicleData.map((vehicle) => (
              <Tr key={vehicle._id}>
                <Td>{vehicle.vehicleNumber}</Td>
                <Td>{vehicle.type}</Td>
                <Td>{vehicle.totalCapacity}</Td>
                <Td>{vehicle.remainingCapacity}</Td>
                <Td>
                  <Button
                    colorScheme="teal"
                    onClick={() => handleEdit(vehicle)}
                    mr={2}
                  >
                    Edit
                  </Button>
                  <Button
                    colorScheme="red"
                    onClick={() => handleDelete(vehicle._id)}
                  >
                    Delete
                  </Button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}

      <Modal isOpen={isAdding} onClose={handleCloseAdd} size="md">
        <ModalContent>
          <ModalHeader>Add New Vehicle</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>Vehicle Number</FormLabel>
              <Input
                type="text"
                value={newVehicle.vehicleNumber}
                onChange={(e) =>
                  setNewVehicle({
                    ...newVehicle,
                    vehicleNumber: e.target.value,
                  })
                }
              />
            </FormControl>

            <FormControl>
              <FormLabel>Type</FormLabel>
              <Input
                type="text"
                value={newVehicle.type}
                onChange={(e) =>
                  setNewVehicle({ ...newVehicle, type: e.target.value })
                }
              />
            </FormControl>

            <FormControl>
              <FormLabel>Total Capacity</FormLabel>
              <Input
                type="number"
                value={newVehicle.totalCapacity}
                onChange={(e) =>
                  setNewVehicle({
                    ...newVehicle,
                    totalCapacity: e.target.value,
                  })
                }
              />
            </FormControl>

            <FormControl>
              <FormLabel>Remaining Capacity</FormLabel>
              <Input
                type="number"
                value={newVehicle.remainingCapacity}
                onChange={(e) =>
                  setNewVehicle({
                    ...newVehicle,
                    remainingCapacity: e.target.value,
                  })
                }
              />
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="teal" onClick={handleSaveAdd}>
              Add Vehicle
            </Button>
            <Button
              onClick={() => {
                setIsAdding(false);
                setError("");
              }}
            >
              Cancel
            </Button>
          </ModalFooter>
          {errorResp && (
            <Alert status="error">
              <AlertIcon />
              <AlertTitle>{errorResp}</AlertTitle>
            </Alert>
          )}
        </ModalContent>
      </Modal>
      <Modal
        isOpen={isEditing}
        onClose={() => {
          setIsEditing(false);
          setError("");
        }}
        size="md"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Vehicle</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>Vehicle Number</FormLabel>
              <Input
                type="text"
                value={editedVehicle.vehicleNumber}
                onChange={(e) =>
                  setEditedVehicle({
                    ...editedVehicle,
                    vehicleNumber: e.target.value,
                  })
                }
              />
            </FormControl>
            <FormControl>
              <FormLabel>Type</FormLabel>
              <Input
                type="text"
                value={editedVehicle.type}
                onChange={(e) =>
                  setEditedVehicle({ ...editedVehicle, type: e.target.value })
                }
              />
            </FormControl>
            <FormControl>
              <FormLabel>Total Capacity</FormLabel>
              <Input
                type="number"
                value={editedVehicle.totalCapacity}
                onChange={(e) =>
                  setEditedVehicle({
                    ...editedVehicle,
                    totalCapacity: parseInt(e.target.value, 10),
                  })
                }
              />
            </FormControl>
            <FormControl>
              <FormLabel>Remaining Capacity</FormLabel>
              <Input
                type="number"
                value={editedVehicle.remainingCapacity}
                onChange={(e) =>
                  setEditedVehicle({
                    ...editedVehicle,
                    remainingCapacity: parseInt(e.target.value, 10),
                  })
                }
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="teal" onClick={handleSaveEdit}>
              Save
            </Button>
            <Button
              onClick={() => {
                setIsEditing(false);
                setError("");
              }}
            >
              Cancel
            </Button>
          </ModalFooter>
          {errorResp && (
            <Alert status="error">
              <AlertIcon />
              <AlertTitle>{errorResp}</AlertTitle>
            </Alert>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default VehicleTable;
