import { useState } from "react";
import { Box, Typography, IconButton, Button, Paper } from "@mui/material";
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

  const handleColorChange = (label: string) => {
    onColorChange(label, selectedColor); // Update the color in the parent component
    setOpenColorPicker(null); // Close the color picker
  };

  return (
    <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
      {legendItems.map((item) => (
        <Box key={item.label} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {/* Square Button to Open Color Picker */}
          <IconButton
            onClick={() => {
              setOpenColorPicker(item.label); // Open the color picker for this item
              setSelectedColor(item.color); // Set the selected color to the item's color
            }}
            sx={{
              width: 24,
              height: 24,
              backgroundColor: item.color, // Set the square's background color
              "&:hover": { backgroundColor: item.color },
            }}
          />

          {/* Legend Item Label */}
          <Typography variant="body1" color="black">
            {item.label}
          </Typography>

          {/* Color Picker Modal */}
          {openColorPicker === item.label && (
            <Paper
              elevation={3}
              sx={{
                position: "absolute",
                zIndex: 1000,
                mt: 2,
                p: 2,
                backgroundColor: "white", // White background for the container
                borderRadius: 1,
                maxWidth: '230px', // Set a max width to prevent it from being too wide
                width: 'auto', // Allow the width to adjust based on
              }}
            >
              <HexColorPicker
                color={selectedColor} // Current color of the legend item
                onChange={setSelectedColor} // Update the selected color
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