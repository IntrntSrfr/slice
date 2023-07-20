import styles from './styles/Overlay.module.css';
import { ReactNode } from "react";

interface Props {
    active?: boolean
    children: ReactNode
}

const Overlay = ({ active = false, children }: Props) => {
    return (
        <div className={`${styles.overlay} ${active ? styles.active : ''}`}>
            {children}
        </div>
    );
};

export default Overlay;
