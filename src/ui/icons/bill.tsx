import * as React from 'react';
import type { SvgProps } from 'react-native-svg';
import Svg, { Path } from 'react-native-svg';

export const Bill = ({ color = '#000', ...props }: SvgProps) => (
  <Svg width={32} height={32} fill="none" viewBox="0 0 24 24" {...props}>
    <Path
      d="M16.755 2H7.24502C6.08614 2 5.50671 2 5.03939 2.16261C4.15322 2.47096 3.45748 3.18719 3.15795 4.09946C3 4.58055 3 5.17705 3 6.37006V20.3742C3 21.2324 3.985 21.6878 4.6081 21.1176C4.97417 20.7826 5.52583 20.7826 5.8919 21.1176L6.375 21.5597C7.01659 22.1468 7.98341 22.1468 8.625 21.5597C9.26659 20.9726 10.2334 20.9726 10.875 21.5597C11.5166 22.1468 12.4834 22.1468 13.125 21.5597C13.7666 20.9726 14.7334 20.9726 15.375 21.5597C16.0166 22.1468 16.9834 22.1468 17.625 21.5597L18.1081 21.1176C18.4742 20.7826 19.0258 20.7826 19.3919 21.1176C20.015 21.6878 21 21.2324 21 20.3742V6.37006C21 5.17705 21 4.58055 20.842 4.09946C20.5425 3.18719 19.8468 2.47096 18.9606 2.16261C18.4933 2 17.9139 2 16.755 2Z"
      stroke="#1C274C"
      stroke-width="1.5"
    // fill={color}
    />
    <Path
      d="M10.5 11L17 11"
      stroke="#1C274C"
      stroke-width="1.5"
      stroke-linecap="round"
    // fill={color}
    />
    <Path
      d="M7 11H7.5"
      stroke="#1C274C"
      stroke-width="1.5"
      stroke-linecap="round"
    // fill={color}
    />
    <Path
      d="M7 7.5H7.5"
      stroke="#1C274C"
      stroke-width="1.5"
      stroke-linecap="round"
    // fill={color}
    />
    <Path
      d="M7 14.5H7.5"
      stroke="#1C274C"
      stroke-width="1.5"
      stroke-linecap="round"
    // fill={color}
    />
    <Path
      d="M10.5 7.5H17"
      stroke="#1C274C"
      stroke-width="1.5"
      stroke-linecap="round"
    // fill={color}
    />
    <Path
      d="M10.5 14.5H17"
      stroke="#1C274C"
      stroke-width="1.5"
      stroke-linecap="round"
    // fill={color}
    />
  </Svg>
);
