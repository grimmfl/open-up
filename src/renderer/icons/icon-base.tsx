import { ReactElement } from 'react';
import { IconHeight, IconWidth } from './icons';

export default function IconBase({
  children,
  width = IconWidth,
  height = IconHeight,
  fill = 'none',
}: {
  children: ReactElement;
  width?: number;
  height?: number;
  fill?: string;
}) {
  return (
    <svg
      width={`${width}px`}
      height={`${height}px`}
      viewBox="0 0 24 24"
      fill={fill}
      xmlns="http://www.w3.org/2000/svg"
    >
      {children}
    </svg>
  );
}
