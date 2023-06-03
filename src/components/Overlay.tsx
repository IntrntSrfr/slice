import styles from './styles/Overlay.module.css';

interface Props {
    active?: boolean
}

const Overlay = ({ active = false }: Props) => {
    return (
        <div className={`${styles.overlay} ${active ? styles.active : ''}`}>Loading...</div>
    );
};

export default Overlay;