interface SelectProps {
  children: React.ReactNode;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  className?: string;
}

export default function Select({
  children,
  value,
  onChange,
  className,
}: SelectProps) {
  return (
    <select
      value={value}
      onChange={onChange}
      className={`w-full p-2 rounded-md bg-[#86a9cf] text-white ${className}`}
    >
      {children}
    </select>
  );
}
