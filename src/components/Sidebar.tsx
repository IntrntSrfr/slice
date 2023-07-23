import ProfileList from "./ProfileList";
import styles from './styles/Sidebar.module.css';
import UploadButton from "./UploadButton";

interface Props {
    onUpload: (file: File) => void;
}

const Sidebar = ({onUpload}: Props) => {
    return (
        <div className={styles.sidebar}>
            <header className={styles.header}>
                <UploadButton onUpload={onUpload}/>
            </header>
            <ProfileList />
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
