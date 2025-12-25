import React from 'react';
import Svg, { Path, Circle, Defs, RadialGradient, Stop } from 'react-native-svg';

export const EggIcon = ({ size = 64, color = "#F59E0B" }: { size?: number; color?: string }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <Defs>
        <RadialGradient id="grad" cx="50" cy="50" r="50" fx="50" fy="50">
            <Stop offset="0%" stopColor="#FFFBEB" stopOpacity="1" />
            <Stop offset="100%" stopColor="#FEF3C7" stopOpacity="1" />
        </RadialGradient>
      </Defs>
      {/* Egg Shape */}
      <Path
        d="M50 5 C 25 5, 10 35, 10 60 C 10 85, 25 95, 50 95 C 75 95, 90 85, 90 60 C 90 35, 75 5, 50 5 Z"
        fill="url(#grad)"
        stroke={color}
        strokeWidth="3"
      />
      {/* Spots */}
      <Circle cx="35" cy="40" r="3" fill={color} opacity="0.4" />
      <Circle cx="65" cy="50" r="4" fill={color} opacity="0.4" />
      <Circle cx="45" cy="70" r="2" fill={color} opacity="0.4" />
      <Circle cx="70" cy="30" r="2" fill={color} opacity="0.4" />
      <Circle cx="25" cy="60" r="2.5" fill={color} opacity="0.4" />
    </Svg>
  );
};
