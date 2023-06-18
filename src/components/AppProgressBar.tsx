import styles from './styles/AppLoadingBar.module.css';

type ButtonType = 'blue' | 'green' | 'red'

interface Props {
    text?: string
    current: number
    max: number
    variant: ButtonType,
}

const AppProgressBar = (props: Props) => {
    const progress = Math.max(0, Math.min(100, (props.current / props.max) * 100));

    return (
        <div className={`${styles.loadingBar} ${props.variant}`}>
            <div 
                className={styles.loadingBarProgress} 
                style={{ width: `${progress}%` }} 
            >{props.text}</div>
        </div>
    );
};

export default AppProgressBar;