import { useSwipeable } from "react-swipeable";
import MobileStepper from "@mui/material/MobileStepper";
import { Box, useTheme } from "@mui/material";
import { useEffect, useState } from "react";

export const ProductBanner = ({ images }) => {
  const theme = useTheme();

  const [activeStep, setActiveStep] = useState(0);
  const maxSteps = images.length;

  // AutoPlay logic (same as autoplay of swipeable-views)
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % maxSteps);
    }, 2500);

    return () => clearInterval(timer);
  }, [maxSteps]);

  // Swipe handlers
  const handlers = useSwipeable({
    onSwipedLeft: () =>
      setActiveStep((prev) => (prev + 1) % maxSteps),

    onSwipedRight: () =>
      setActiveStep((prev) =>
        prev === 0 ? maxSteps - 1 : prev - 1
      ),

    trackMouse: true,
  });

  return (
    <>
      <div
        {...handlers}
        style={{
          width: "100%",
          height: "100%",
          overflow: "hidden",
          position: "relative",
        }}
      >
        <Box
          component="img"
          src={images[activeStep]}
          alt="Banner"
          sx={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
          }}
        />
      </div>

      <Box sx={{ alignSelf: "center", mt: 2 }}>
        <MobileStepper
          steps={maxSteps}
          position="static"
          activeStep={activeStep}
          sx={{
            bgcolor: 'transparent',
            '& .MuiMobileStepper-dot': {
                width: 8,
                height: 8,
                transition: '0.3s'
            },
            '& .MuiMobileStepper-dotActive': {
                width: 24,
                borderRadius: '4px'
            }
          }}
        />
      </Box>
    </>
  );
};
