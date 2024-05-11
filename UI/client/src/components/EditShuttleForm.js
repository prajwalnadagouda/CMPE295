import React, { useState } from "react";
import {
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
  Button,
  Flex,
  VStack,
  Text,
  HStack,
} from "@chakra-ui/react";
import { AddIcon, CloseIcon } from "@chakra-ui/icons";

const EditShuttleForm = ({ isOpen, onClose, shuttle, onSave }) => {
  const [editedShuttle, setEditedShuttle] = useState({ ...shuttle });
  const [newStop, setNewStop] = useState("");
  const [stopsList, setStopsList] = useState([...shuttle.stops]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedShuttle((prevShuttle) => ({ ...prevShuttle, [name]: value }));
  };

  const handleAddStop = () => {
    if (newStop.trim() !== "") {
      setStopsList((prevStops) => [...prevStops, newStop.trim()]);
      setNewStop("");
    }
  };

  const handleRemoveStop = (index) => {
    setStopsList((prevStops) => [
      ...prevStops.slice(0, index),
      ...prevStops.slice(index + 1),
    ]);
  };

  const handleSave = () => {
    setEditedShuttle((prevShuttle) => ({ ...prevShuttle, stops: stopsList }));
    onSave(editedShuttle);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Edit Shuttle Details</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Flex justify="space-between">
            <VStack>
              <HStack align="start">
                <FormControl>
                  <FormLabel>Shuttle Number</FormLabel>
                  <Input
                    disabled
                    type="text"
                    name="shuttleNumber"
                    value={editedShuttle.shuttleNumber}
                    onChange={handleInputChange}
                    readOnly
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Source</FormLabel>
                  <Input
                    type="text"
                    name="source"
                    value={editedShuttle.source}
                    onChange={handleInputChange}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Destination</FormLabel>
                  <Input
                    type="text"
                    name="destination"
                    value={editedShuttle.destination}
                    onChange={handleInputChange}
                  />
                </FormControl>
              </HStack>
              <HStack align="start">
                <FormControl>
                  <FormLabel>Capacity</FormLabel>
                  <Input
                    type="number"
                    name="capacity"
                    value={editedShuttle.capacity}
                    onChange={handleInputChange}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Start Time</FormLabel>
                  <Input
                    type="text"
                    name="startTime"
                    value={editedShuttle.startTime}
                    onChange={handleInputChange}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>End Time</FormLabel>
                  <Input
                    type="text"
                    name="endTime"
                    value={editedShuttle.endTime}
                    onChange={handleInputChange}
                  />
                </FormControl>
              </HStack>
            </VStack>
          </Flex>
          <FormControl mt={4}>
            <FormLabel>Stops List</FormLabel>
            <VStack align="start">
              {stopsList.map((stop, index) => (
                <Flex key={index} justify="space-between" w="100%">
                  <Text>{stop}</Text>
                  <CloseIcon
                    cursor="pointer"
                    color="red.500"
                    onClick={() => handleRemoveStop(index)}
                  />
                </Flex>
              ))}
            </VStack>
            <Flex mt={2}>
              <Input
                type="text"
                placeholder="Add new stop"
                value={newStop}
                onChange={(e) => setNewStop(e.target.value)}
              />
              <AddIcon
                ml={2}
                cursor="pointer"
                color="teal.500"
                onClick={handleAddStop}
              />
            </Flex>
          </FormControl>
          <FormControl>
            <FormLabel>Time to Destination</FormLabel>
            <Input
              type="text"
              name="timeToDestination"
              value={editedShuttle.estimatedTime}
              onChange={handleInputChange}
            />
          </FormControl>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="teal" onClick={handleSave} mr={2}>
            Save Changes
          </Button>
          <Button onClick={onClose}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default EditShuttleForm;
