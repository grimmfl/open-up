import { IconHeight, IconWidth } from './icons';

export default function CircleIcon({width = null, height = null}: {width?: number | null, height?: number | null }) {
  return (
    <svg
      width={`${width ?? IconWidth}px`}
      height={`${height ?? IconHeight}px`}
      viewBox="0 0 24 24"
      fill="#03cafc"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
        stroke="#0c8bab"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
