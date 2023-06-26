import styles from './styles/AppLoadingBar.module.css';

interface Props {
    text?: string
    current: number
    max: number
}

const AppProgressBar = (props: Props) => {
    const progress = Math.max(0, Math.min(100, (props.current / props.max) * 100));
    return (
        <div className={styles.loadingBar}>
            <div 
                className={styles.loadingBarProgress} 
                style={{ width: `${progress}%` }} 
            />
            <div className={styles.loadingBarText}>{props.text}{/* {extraDots} */}</div>
        </div>
    );
};

export default AppProgressBar;