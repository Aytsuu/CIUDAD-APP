import React from "react";

export function useDebounce<T>(value: T, delay: number = 500): T {
  const [ debounceValue, setDebounceValue ] = React.useState<T>(value);

  React.useEffect(() => {
    const handler = setTimeout(() => setDebounceValue(value), delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debounceValue;
}