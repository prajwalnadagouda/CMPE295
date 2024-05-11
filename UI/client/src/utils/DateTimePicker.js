import React from "react";
import { TimePicker } from "chakra-ui-time-picker";
import { Box, FormControl, FormLabel } from "@chakra-ui/react";
import moment from "moment";

const DateTimePicker = ({ label, value, onChange, disabled }) => {
  return (
    <Box>
      <FormControl>
        <FormLabel>{label}</FormLabel>
        <Box>
          <TimePicker
            format={"HH:mm"}
            defaultValue={""}
            onChange={onChange}
            disabled={disabled}
          />
        </Box>
      </FormControl>
    </Box>
  );
};

export default DateTimePicker;
