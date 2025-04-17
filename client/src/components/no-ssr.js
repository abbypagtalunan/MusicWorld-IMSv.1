import { useEffect, useState } from 'react';

// This component will only render its children on the client side
const NoSSR = ({ children }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null; // Return nothing on the server side
  }

  return <>{children}</>; // Render children on the client side
};

export default NoSSR;
