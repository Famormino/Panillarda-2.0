import React from "react";

type TitleProps = {
    text: string;
};

const Title: React.FC<TitleProps> = ({ text }) => {
    return (
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-4">
            {text}
        </h1>
    );
};

export default Title;
