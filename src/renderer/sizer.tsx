import { useContext, useEffect, useRef, useState } from 'react';
import { AppContext } from './contexts';

export default function Sizer() {
  const sizerRef = useRef<HTMLDivElement>(null);

  const [resizeToggle, setResizeToggle] = useState(false);

  const { setWindowSize } = useContext(AppContext);

  useEffect(() => {
    window.onresize = () => {
      setResizeToggle((prev) => !prev);
    };
  }, []);

  useEffect(() => {
    const sizer = sizerRef.current;

    if (sizer == null) return;

    for (let i = 0; i < sizer.children.length; i++) {
      const child = sizer.children[i];

      if (child == null) continue;

      if (child.checkVisibility()) {
        setWindowSize(child.getAttribute('data-size') ?? 'lg');
      }
    }
  }, [sizerRef, resizeToggle]);

  return (
    <div id="sizer" ref={sizerRef}>
      <div
        className="d-block d-sm-none d-md-none d-lg-none d-xl-none"
        data-size="xs"
      ></div>
      <div
        className="d-none d-sm-block d-md-none d-lg-none d-xl-none"
        data-size="sm"
      ></div>
      <div
        className="d-none d-sm-none d-md-block d-lg-none d-xl-none"
        data-size="md"
      ></div>
      <div
        className="d-none d-sm-none d-md-none d-lg-block d-xl-none"
        data-size="lg"
      ></div>
      <div
        className="d-none d-sm-none d-md-none d-lg-none d-xl-block"
        data-size="xl"
      ></div>
    </div>
  );
}
