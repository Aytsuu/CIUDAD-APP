import React from "react";
import { ImageURISource } from "react-native";
import { Marker, Circle } from "react-native-maps";

export const CustomMarker = ({
  lat,
  lng,
  showCircles = true,
  iconUri,
  circleColor,
}: {
  lat: number;
  lng: number;
  showCircles?: boolean;
  iconUri?: ImageURISource;
  circleColor?: string
}) => {

  return (
    <>
      {/* Tracker markers */}
      {iconUri ? (
        <Marker
          coordinate={{
            latitude: lat,
            longitude: lng,
          }}
          image={iconUri}
          anchor={{ x: 0.5, y: 1.0 }}
          zIndex={999}
        />
      ) : (
        <Marker
          coordinate={{
            latitude: lat,
            longitude: lng,
          }}
          pinColor="FF0000"
          anchor={{ x: 0.5, y: 1.0 }}
          zIndex={999}
        />
      )}
      {/* Circles for trackers */}
      {showCircles && (
        <Circle
          center={{
            latitude: lat,
            longitude: lng,
          }}
          radius={40}
          strokeColor={`rgba(${circleColor},0.8)`}
          fillColor={`rgba(${circleColor},0.3)`}
        />
      )}
    </>
  );
};
