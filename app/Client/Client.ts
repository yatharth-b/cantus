import {useEffect, useState} from "react";

export default function Client({
  children,
  fallback = null,
}: {
  children?: any;
  fallback?: React.ReactNode;
}) {

  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  return ready ? children : null;
}