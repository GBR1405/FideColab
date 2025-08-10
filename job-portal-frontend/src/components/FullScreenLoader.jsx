import React, { useEffect, useState } from 'react';
import "../styles/FullScreenLoader.css";

const FullScreenLoader = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const delay = setTimeout(() => setVisible(true), 400); // espera 400ms

    return () => clearTimeout(delay);
  }, []);

  return visible ? (
    <div className="fullscreen-loader-container fade-in">
      <div className="loader"></div>
    </div>
  ) : null;
};

export default FullScreenLoader;
