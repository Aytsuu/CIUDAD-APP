import * as React from "react";
import Svg, { Path, Defs, LinearGradient, Stop } from "react-native-svg";
const BackgroundCiudad = (props) => (
  <Svg
    width={412}
    height={274}
    viewBox="0 0 412 274"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Path
      d="M-18 -15C-18 -174.334 111.166 -304 270.5 -304C429.834 -304 559 -174.334 559 -15C559 144.334 429.834 274 270.5 274C111.166 274 -18 144.334 -18 -15Z"
      fill="url(#paint0_linear_4765_8285)"
    />
    <Defs>
      <LinearGradient
        id="paint0_linear_4765_8285"
        x1={122.5}
        y1={250.5}
        x2={1111.5}
        y2={-315.5}
        gradientUnits="userSpaceOnUse"
      >
        <Stop stopColor="#1F3273" />
        <Stop offset={1} stopColor="#869EEE" />
      </LinearGradient>
    </Defs>
  </Svg>
);
export default BackgroundCiudad;
