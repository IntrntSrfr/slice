import { CSSProperties } from "react";

const buttonColors = [
    'blue',
    'green',
    'red'
];

type ButtonType = typeof buttonColors[number];

interface Props {
    onClick?: () => void,
    style?: CSSProperties,
    variant: ButtonType,
    filled?: boolean,
    text: string,
    disabled?: boolean
}

const AppButton = (props: Props) => {
    return (
        <button className={`btn ${props.variant} ${props.filled ? 'btn-filled' : ''}`} style={props.style} onClick={props.onClick} disabled={props.disabled}>
            {props.text}
        </button>
    );
};

export default AppButton;
