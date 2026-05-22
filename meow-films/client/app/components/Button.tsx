interface ButtonProps {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  type: "button" | "submit" | "reset";
  className?: string;
}
export default function Button({
  children,
  onClick,
  disabled,
  type,
  className,
}: ButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      type={type}
      className={`bg-[#c38eb4] text-white cursor-pointer p-2 rounded-md hover:bg-[#86a9cf] transition-all duration-300 ${className}`}
    >
      {children}
    </button>
  );
}
