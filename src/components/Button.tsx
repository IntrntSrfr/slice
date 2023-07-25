import { CSSProperties, ReactNode } from "react";

const buttonColors = [
    'blue',
    'green',
    'red'
];

type ButtonType = typeof buttonColors[number];

interface Props {
    onClick?: () => void;
    className?: string;
    style?: CSSProperties;
    variant: ButtonType;
    filled?: boolean;
    disabled?: boolean;
    children?: ReactNode;
}

const Button = (props: Props) => {
    return (
        <button className={`btn ${props.variant} ${props.filled ? 'btn-filled' : ''} ${props.className || ''}`} style={props.style} onClick={props.onClick} disabled={props.disabled}>
            {props.children}
        </button>
    );
};

export default Button;
