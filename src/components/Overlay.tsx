import AppLoader from './AppLoader';
import styles from './styles/Overlay.module.css';

interface Props {
    active?: boolean
}

const Overlay = ({ active = false }: Props) => {
    return (
        <div className={`${styles.overlay} ${active ? styles.active : ''}`}>
            {/* Loading... */}
            <AppLoader/>
        </div>
    );
};

export default Overlay;