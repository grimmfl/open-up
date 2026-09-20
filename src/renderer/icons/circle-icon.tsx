import IconBase from './icon-base';

export default function CircleIcon({
  width,
  height,
}: {
  width?: number;
  height?: number;
}) {
  return (
    <IconBase width={width} height={height} fill="#03cafc">
      <path
        d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
        stroke="#0c8bab"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </IconBase>
  );
}
