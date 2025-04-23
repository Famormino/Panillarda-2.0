import React, { JSX } from "react";

type TitleProps = {
    text: string;
    className?: string;
    as?: keyof JSX.IntrinsicElements;
};

const Title: React.FC<TitleProps> = ({ text, className = "", as: Component = "h1" }) => {
    const baseStyles = `
        relative inline-block text-4xl font-semibold tracking-tight 
        text-transparent bg-clip-text bg-gradient-to-r 
        from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400
        mb-12 cursor-pointer transform transition-transform duration-300 ease-in-out 
        hover:scale-105 hover:rotate-[-0.5deg]
        after:content-[''] after:absolute after:left-0 
        after:bottom-[-12px] after:w-full after:h-1 
        after:bg-indigo-500 dark:after:bg-indigo-400 
        after:transform after:scale-x-0 hover:after:scale-x-100 
        after:origin-left after:transition-transform after:duration-500
    `;

    return (
        <Component className={`${baseStyles} ${className}`}>
            {text}
        </Component>
    );
};

export default Title;
