import styles from './styles/ProgressBar.module.css';

interface Props {
    text?: string
    current: number
    max: number
}

const ProgressBar = (props: Props) => {
    const progress = Math.max(0, Math.min(100, (props.current / props.max) * 100));
    return (
        <div className={styles.loadingBar}>
            <div
                className={styles.loadingBarProgress}
                style={{ width: `${progress}%` }}
            />
            <div className={styles.loadingBarText}>{props.text}</div>
        </div>
    );
};

export default ProgressBar;
