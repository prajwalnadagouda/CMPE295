import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  fonts: {
    heading: `'Noto Sans', sans-serif`,
    body: `'Noto Sans', sans-serif`,
  },
  colors: {
    yellow: {
      100: "#FCCB06",
      500: "#FCCB06",
    },
  },
});

export default theme;
