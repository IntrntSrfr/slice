import styles from './styles/Checkbox.module.css';

interface Props {
    label: string
    checked: boolean
    onChange: () => void
    disabled?: boolean
}

const Checkbox = ({ label, checked, onChange, disabled = false }: Props) => {
    const handleOnClick = () => {
        if(disabled) return;
        onChange();
    };
    
    return (
        <div className={`${styles.checkbox} ${disabled?styles.disabled:''}`} onClick={handleOnClick}>
            <input className={styles.checkboxInner} type="checkbox" checked={checked} readOnly />
            <label className={styles.checkboxLabel}>{label}</label>
        </div>
    );
};

export default Checkbox;
