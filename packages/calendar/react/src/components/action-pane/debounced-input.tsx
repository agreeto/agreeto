import { useEffect, useState } from "react";

export const DebouncedInput: React.FC<
  {
    value: string;
    onChange: (value: string) => void;
    debounce?: number;
  } & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange">
> = ({ value: initialValue, onChange, debounce = 500, ...props }) => {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value);
    }, debounce);
    return () => clearTimeout(timeout);
  }, [value]);

  return (
    <input
      {...props}
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  );
};
