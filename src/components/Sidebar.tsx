import { ReactNode } from "react";
import styles from './styles/Sidebar.module.css';

interface Props {
    children?: ReactNode;
}

const Sidebar = ({children}: Props) => {
    return (
        <div className={styles.sidebar}>
            {/* 
            <header className={styles.header}>
                <UploadButton onUpload={onUpload}/>
            </header>
             */}
            {children}
            {/* 
            <ProfileList />
             */}
            <footer className={styles.footer}>
                <div className="btn-grp">
                    <a className="btn" href="https://github.com/intrntsrfr/slice" target="_blank" rel="noreferrer">Github</a>
                    <a className="btn" href="https://paypal.me/intrntsrfr" target="_blank" rel="noreferrer">Donate</a>
                </div>
            </footer>
        </div>
    );
};

export default Sidebar;

interface SidebarHeaderProps {
    children?: ReactNode;
} 

export const SidebarHeader = ({children}: SidebarHeaderProps) => {
    return (
        <header className={styles.header}>
            {children}
        </header>
    );
};
