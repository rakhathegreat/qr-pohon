import React from "react";

interface InputProps {
  label: string;
  id: string;
  placeholder?: string;
  className?: string;
  type: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const Input: React.FC<InputProps> = ({ label, id, placeholder, type, className, ...props }) => {
  return (
    <div className="w-full">
      <label
        htmlFor={id}
        className="font-inter block text-md font-medium mb-2 text-gray-700"
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        required
        className={`font-inter py-3 px-4 block w-full text-brand-800 bg-brand-100 rounded-lg text-md font-medium focus:outline-none focus:border-2 focus:border-brand-500 disabled:opacity-50 disabled:pointer-events-none ${className}`}
        placeholder={placeholder}
        {...props}
      />
    </div>
  );
};

export default Input;