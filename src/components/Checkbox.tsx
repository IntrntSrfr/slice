import styles from './styles/Checkbox.module.css';

interface Props {
    label: string
    checked: boolean
    onChange: () => void
}

const Checkbox = ({ label, checked, onChange }: Props) => {
    return (
        <div className={styles.checkbox} onClick={onChange}>
            <input className={styles.checkboxInner} type="checkbox" checked={checked} readOnly/>
            <label className={styles.checkboxLabel}>{label}</label>
        </div>
    );
    
    return (
        <div className={styles.inpCheckbox} onClick={onChange}>
            <input style={{ cursor: 'pointer' }} type="checkbox" name="check" checked={checked} readOnly />
            <label style={{ cursor: 'pointer' }}>{label}</label>
        </div>
    );
};

export default Checkbox;
