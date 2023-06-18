import styles from './styles/Overlay.module.css';

interface Props {
    active?: boolean
    children?: React.ReactNode
}

const Overlay = ({ active = false, children}: Props) => {
    return (
        <div className={`${styles.overlay} ${active ? styles.active : ''}`}>
            {children}
        </div>
    );
};

export default Overlay;