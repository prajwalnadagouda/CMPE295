import React from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Box,
  Text,
} from "@chakra-ui/react";

const VehicleDetailsModal = ({ isOpen, onClose, vehicleDetails }) => {
  if (!vehicleDetails) {
    return null;
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Vehicle Details</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Box>
            <Text fontWeight="bold">Vehicle Number:</Text>
            <Text>{vehicleDetails.vehicleNumber}</Text>

            <Text fontWeight="bold">Type:</Text>
            <Text>{vehicleDetails.type}</Text>

            <Text fontWeight="bold">Total Capacity:</Text>
            <Text>{vehicleDetails.totalCapacity}</Text>

            <Text fontWeight="bold">Remaining Capacity:</Text>
            <Text>{vehicleDetails.remainingCapacity}</Text>
          </Box>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default VehicleDetailsModal;
