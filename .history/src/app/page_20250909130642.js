import styles from './page.module.css'

export default function HomePage() {
	return (
		<div className={styles.landingPage}>
			<main className={styles.heroSection}>
				<h1 className={styles.heroText}>Ohkai Coloring Book</h1>
				<p className={styles.subText}>
					Your landing page with hero text and subtext
				</p>
			</main>
		</div>
	)
}
