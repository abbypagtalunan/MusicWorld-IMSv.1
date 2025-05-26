// components/MinimumScreenGuard.jsx
"use client";

import { useEffect, useState } from "react";

export default function MinimumScreenGuard({ children }) {
  const MIN_WIDTH = 360;

  const [isTooSmall, setIsTooSmall] = useState(false);
  const [isUnsupportedDevice, setIsUnsupportedDevice] = useState(false);

  useEffect(() => {
    const checkSizeAndDevice = () => {
      const width = window.innerWidth;
      const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

      setIsUnsupportedDevice(hasTouch);
      setIsTooSmall(width < MIN_WIDTH);
    };

    checkSizeAndDevice();

    window.addEventListener("resize", checkSizeAndDevice);
    return () => window.removeEventListener("resize", checkSizeAndDevice);
  }, []);

  // Unsupported Device Modal (Mobile/Tablet)
  if (isUnsupportedDevice) {
    return (
      <div className="fixed inset-0 z-50 bg-white flex items-center justify-center p-4">
        <div className="max-w-md w-full mx-auto text-center bg-white border border-gray-300 rounded-lg shadow-lg p-6">
          <h1 className="text-xl font-bold mb-2 text-blue-950">Unsupported Device</h1>
          <p className="text-sm text-gray-600">
            This system only works on desktops and laptops. Please switch to a supported device.
          </p>
        </div>
      </div>
    );
  }

  // Everything is good — render the app
  return children;
}