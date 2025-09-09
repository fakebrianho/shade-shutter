import styles from './page.module.css'

export default function HomePage() {
	return (
		<div className={styles.landingPage}>
			<main className={styles.heroSection}>
				<h1 className={styles.heroText}>
					Ohkai Studios - Shuffle & Shade
				</h1>
				<p className={styles.subText}>
					Bespoke Coloring and Painting Books
				</p>
			</main>
		</div>
	)
}
