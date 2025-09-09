import styles from './GlassNavbar.module.css'
import Link from 'next/link'

export default function GlassNavbar() {
	return (
		<nav className={styles.glassNavbar}>
			<div className={styles.navContainer}>
				<Link href='/' className={styles.navLink}>
					Home
				</Link>
				<Link href='/upload' className={styles.navLink}>
					Upload
				</Link>
				<Link href='/admin' className={styles.navLink}>
					Admin
				</Link>
			</div>
		</nav>
	)
}