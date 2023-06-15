import styles from './styles/AppLoader.module.css';

const AppLoader = () => {
    return (
        <div className={styles.loader}>
            <div className={styles.ldsEllipsis}>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
            </div>
        </div>
    );
};

export default AppLoader;
