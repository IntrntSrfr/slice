import { CSSProperties } from "react"

type ButtonType = 'blue' | 'green'

interface Props {
    onClick?: () => void,
    style?: CSSProperties,
    variant: ButtonType,
    text: string
}

const Button = (props: Props) => {
    return (
        <button className={`btn ${props.variant}`} style={props.style} onClick={props.onClick}>
            {props.text}
        </button>
    )
}

export default Button