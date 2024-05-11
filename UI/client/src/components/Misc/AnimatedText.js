import { Heading } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import "@fontsource/pacifico";

const FADE_INTERVAL_MS = 1750;
const WORD_CHANGE_INTERVAL_MS = FADE_INTERVAL_MS * 2;

const effects = {
  "fade-in": {
    transition: "opacity 3s ease",
  },
  "fade-out": {
    opacity: "0",
    transition: "opacity 3s ease",
  },
};

export const AnimatedText = (props) => {
  const { words } = props;
  const [fadeProp, setFadeProp] = useState({ fade: "fade-in" });
  const [wordOrder, setWordOrder] = useState(0);

  useEffect(() => {
    const fadeTimeout = setInterval(() => {
      fadeProp.fade === "fade-in"
        ? setFadeProp({ fade: "fade-out" })
        : setFadeProp({ fade: "fade-in" });
    }, FADE_INTERVAL_MS);

    return () => clearInterval(fadeTimeout);
  }, [fadeProp]);

  useEffect(() => {
    const wordTimeout = setInterval(() => {
      setWordOrder((prevWordOrder) => (prevWordOrder + 1) % words.length);
    }, WORD_CHANGE_INTERVAL_MS);

    return () => clearInterval(wordTimeout);
  }, []);

  return (
    <Heading
      color="yellow.500"
      fontFamily="Pacifico"
      fontWeight="400"
      {...effects[fadeProp.fade]}
    >
      {words[wordOrder]}
    </Heading>
  );
};
