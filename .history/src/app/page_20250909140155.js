'use client'
import styles from './page.module.css'
import { useEffect, useRef } from 'react'
import p5 from 'p5'

export default function HomePage() {
	const p5Container = useRef(null)

	useEffect(() => {
		if (typeof window !== 'undefined') {
			const sketch = (p) => {
				p.setup = () => {
					const canvas = p.createCanvas(p.windowWidth, p.windowHeight)
					canvas.position(0, 0)
					p.canvas.style.position = 'fixed'
					p.canvas.style.top = '0'
					p.canvas.style.left = '0'
					p.canvas.style.zIndex = '-1'
				}

				p.draw = () => {
					// Simple animated background with floating particles
					p.background(0, 10)

					// Create floating particles
					for (let i = 0; i < 50; i++) {
						const x =
							p.noise(i * 0.01, p.frameCount * 0.001) * p.width
						const y =
							p.noise(i * 0.01 + 100, p.frameCount * 0.001) *
							p.height
						const size = p.noise(i * 0.01 + 200) * 20 + 5

						p.fill(255, 255, 255, 30)
						p.noStroke()
						p.circle(x, y, size)
					}
				}

				p.windowResized = () => {
					p.resizeCanvas(p.windowWidth, p.windowHeight)
				}
			}

			const p5Instance = new p5(sketch, p5Container.current)

			return () => {
				p5Instance.remove()
			}
		}
	}, [])

	return (
		<div className={styles.landingPage}>
			<div ref={p5Container} />
			<main className={styles.heroSection}>
				<h1 className={styles.heroText}>
					OHKAI STUDIOS - SHUFFLE & SHADE
				</h1>
				<p className={styles.subText}>
					Bespoke Coloring and Painting Books
				</p>
			</main>
		</div>
	)
}
