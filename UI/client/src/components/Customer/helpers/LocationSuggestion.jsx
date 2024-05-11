import React, { useEffect, useRef, useState } from "react";
import {
  Input,
  Stack,
  FormControl,
  FormLabel,
  Box,
  HStack,
  Text,
  Link,
  Spinner,
} from "@chakra-ui/react";
import { AutoComplete } from "@choc-ui/chakra-autocomplete";
import { GoArrowSwitch } from "react-icons/go";
import { MdGpsFixed } from "react-icons/md";

let autoComplete1;
let autoComplete2;

const REACT_APP_GOOGLE_MAPS_KEY = "AIzaSyAVsncCwLE96YCjIGZAcVOcOyH-p7FN35E";

// const loadScript = (url, callback) => {
//   let script = document.createElement("script");
//   script.type = "text/javascript";
//   script.async = true;

//   if (script.readyState) {
//     script.onreadystatechange = function () {
//       if (script.readyState === "loaded" || script.readyState === "complete") {
//         script.onreadystatechange = null;
//         callback();
//       }
//     };
//   } else {
//     script.onload = () => callback();
//   }

//   script.src = url;
//   document.getElementsByTagName("head")[0].appendChild(script);
// };

const SearchLocationInput = ({
  setSelectedLocation,
  setDestinationLocation,
  placeholder1,
  placeholder2,
}) => {
  const [query, setQuery] = useState("");
  const [query2, setQuery2] = useState("");
  const [loading, setLoading] = useState(false);

  const autoCompleteRef1 = useRef("");
  const autoCompleteRef2 = useRef("");

  const handleScriptLoad = () => {
    //
    autoComplete1 = new window.google.maps.places.Autocomplete(
      autoCompleteRef1.current,
      {
        componentRestrictions: { country: "USA" },
      }
    );

    autoComplete2 = new window.google.maps.places.Autocomplete(
      autoCompleteRef2.current,
      {
        componentRestrictions: { country: "USA" },
      }
    );

    autoComplete1.addListener("place_changed", () =>
      handlePlaceSelect(autoComplete1, true)
    );
    autoComplete2.addListener("place_changed", () =>
      handlePlaceSelect(autoComplete2, false)
    );
  };

  const handlePlaceSelect = (autoComplete, flag) => {
    // console.log(autoComplete);
    const addressObject = autoComplete.getPlace();

    // console.log(addressObject, "--address");

    const selectedQuery = addressObject.formatted_address;
    if (flag) {
      setQuery(selectedQuery);
    } else {
      setQuery2(selectedQuery);
    }

    const latLng = {
      lat: addressObject?.geometry?.location?.lat(),
      lng: addressObject?.geometry?.location?.lng(),
    };
    if (flag) {
      setSelectedLocation(latLng);
    } else {
      setDestinationLocation(latLng);
    }
  };

//   useEffect(() => {
//     loadScript(
//       `https://maps.googleapis.com/maps/api/js?key=${REACT_APP_GOOGLE_MAPS_KEY}&libraries=places`,
//       handleScriptLoad
//     );
//   }, []);

  const getCurrentLocation = () => {
    setLoading(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        const latLng = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setSelectedLocation(latLng);
        reverseGeocodeLatLng(latLng);
      });
    } else {
      alert("Geolocation is not supported by your browser");
      setLoading(false);
    }
  };

  const reverseGeocodeLatLng = (latLng) => {
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: latLng }, (results, status) => {
      if (status === "OK") {
        if (results[0]) {
          setQuery(results[0].formatted_address);
        } else {
          alert("No results found");
        }
      } else {
        alert("Geocoder failed due to: " + status);
      }
      setLoading(false);
    });
  };

  return (
    <Stack spacing={4} direction={"row"}>
      <FormControl>
        <FormLabel>Source</FormLabel>
        <AutoComplete>
          <Input
            ref={autoCompleteRef1}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={placeholder1}
            value={query}
          />
        </AutoComplete>

        {!loading ? (
          <Link onClick={getCurrentLocation}>
            <HStack mt={2}>
              <MdGpsFixed mt={0} />
              <Text mb={0}>Current Location</Text>
            </HStack>
          </Link>
        ) : (
          <Stack mt={2}>
            <Spinner />
          </Stack>
        )}
      </FormControl>
      <Box display="flex" alignItems="center">
        <GoArrowSwitch size={"1.5rem"} />
      </Box>
      <FormControl>
        <FormLabel>Destination</FormLabel>
        <AutoComplete>
          <Input
            ref={autoCompleteRef2}
            onChange={(event) => setQuery2(event.target.value)}
            placeholder={placeholder2}
            value={query2}
          />
        </AutoComplete>
      </FormControl>
    </Stack>
  );
};

export default SearchLocationInput;
