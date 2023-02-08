import React from 'react'
import styles from './styles/Checkbox.module.css'

interface Props {
    label: string
    checked: boolean
    onChange: () => void
}

const Checkbox = ({label, checked, onChange}: Props) => {
  return (
    <div className={styles.inpCheckbox} onClick={onChange}>
        <input type="checkbox" name="check" checked={checked} readOnly/>
        <label>{label}</label>
    </div>
  )
}

export default Checkbox