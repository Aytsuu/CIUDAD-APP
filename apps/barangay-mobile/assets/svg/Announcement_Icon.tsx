import * as React from "react";
import Svg, { Path } from "react-native-svg";
const Announcement_Icon = ({ color = "grey", ...props }) => (
  <Svg
    width={35}
    height={35}
    viewBox="0 0 35 35"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Path
      d="M17.4987 5.83398V5.83398C19.9778 5.83398 21.2173 5.83398 22.2409 6.07658C25.5524 6.86141 28.1379 9.44698 28.9228 12.7584C29.1654 13.782 29.1654 15.0216 29.1654 17.5006V25.1673C29.1654 27.0529 29.1654 27.9957 28.5796 28.5815C27.9938 29.1673 27.051 29.1673 25.1654 29.1673H17.4987C15.0196 29.1673 13.7801 29.1673 12.7565 28.9247C9.44502 28.1399 6.85946 25.5543 6.07463 22.2429C5.83203 21.2193 5.83203 19.9797 5.83203 17.5007V17.5007"
      stroke={color}
      strokeWidth={1.5}
    />
    <Path
      d="M13.125 16.041L21.875 16.041"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M7.29297 11.666L7.29297 2.91602"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M2.91797 7.29102L11.668 7.29102"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M17.5 21.875H21.875"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
export default Announcement_Icon;
