import { HomeFooter } from 'rspress/theme'
import styles from './index.module.less'

export default () => {
    return (
        <div className={styles.homeFooterWrapper}>
            <HomeFooter />
        </div>
    )
}
