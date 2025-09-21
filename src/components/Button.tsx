import React from "react";

interface ButtonProps {
    children: React.ReactNode;
    disabled?: boolean;
    onClick?: () => void;
    className?: string;
}

const Button: React.FC<ButtonProps> = ({ children, onClick, className, disabled }) => {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`w-full cursor-pointer font-semibold rounded-lg py-3 ${className}`}
        >
            {children}
        </button>
    );
}

export default Button