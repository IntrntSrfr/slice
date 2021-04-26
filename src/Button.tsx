import React from 'react'


interface Props {
    onClick: () => void,
    styles: string,
    text: string
}

function Button(props: Props) {

    return (
        <button className={props.styles} onClick={props.onClick}>
            {props.text}
        </button>
    )
}

export default Button