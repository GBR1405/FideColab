// components/DelayedSuspense.jsx
import React, { useState, useEffect } from "react";

const DelayedSuspense = ({ children, fallback, minDuration = 2000 }) => {
  const [showFallback, setShowFallback] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowFallback(false);
    }, minDuration);

    return () => clearTimeout(timer);
  }, [minDuration]);

  return (
    <React.Suspense fallback={fallback}>
      {showFallback ? fallback : children}
    </React.Suspense>
  );
};

export default DelayedSuspense;
