import { useState, useRef, useEffect } from "react";
import { Box, Typography, Button, Paper } from "@mui/material";
import { HexColorPicker } from "react-colorful";

interface LegendItem {
  label: string;
  color: string;
}

interface LegendProps {
  legendItems: LegendItem[];
  onColorChange: (label: string, color: string) => void;
}

const Legend = ({ legendItems, onColorChange }: LegendProps) => {
  const [openColorPicker, setOpenColorPicker] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>("#b32aa9"); // Default color
  const colorPickerRef = useRef<HTMLDivElement | null>(null); // Ref for the color picker modal

  const handleColorChange = (label: string) => {
    onColorChange(label, selectedColor); // Update the color in the parent component
    setOpenColorPicker(null); // Close the color picker
  };

  // Effect to handle clicks outside the color picker
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        colorPickerRef.current &&
        !colorPickerRef.current.contains(event.target as Node)
      ) {
        setOpenColorPicker(null); // Close the color picker if clicked outside
      }
    };

    // Add event listener
    document.addEventListener("mousedown", handleClickOutside);

    // Cleanup event listener on component unmount
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
      {legendItems.map((item) => (
        <Box
          key={item.label}
          sx={{ display: "flex", alignItems: "center", gap: 1 }}
        >
          {/* Color Square (div) to Open Color Picker */}
          <div
            onClick={() => {
              // setOpenColorPicker(item.label);
              // setSelectedColor(item.color);
            }}
            style={{
              width: "24px",
              height: "24px",
              backgroundColor: item.color, // Set the square's background color
              borderRadius: "4px", // Optional: Add rounded corners
              cursor: "pointer", // Show pointer cursor on hover
            }}
          />

          {/* Legend Item Label */}
          <Typography variant="body1" color="black">
            {item.label}
          </Typography>

          {/* Color Picker Modal */}
          {openColorPicker === item.label && (
            <Paper
              ref={colorPickerRef} // Attach the ref to the Paper component
              elevation={3}
              sx={{
                position: "absolute",
                zIndex: 1000,
                mt: 2,
                p: 2,
                backgroundColor: "white",
                borderRadius: 1,
                maxWidth: "230px",
                width: "auto",
              }}
            >
              <HexColorPicker
                color={selectedColor} // Current color of the legend item
                onChange={(newColor) => {
                  setSelectedColor(newColor);
                  onColorChange(item.label, newColor); // Update the legend items state
                }}
              />
              <Button
                onClick={() => handleColorChange(item.label)} // Apply the selected color
                variant="contained"
                sx={{ mt: 1 }}
              >
                Apply Color
              </Button>
            </Paper>
          )}
        </Box>
      ))}
    </Box>
  );
};

export default Legend;