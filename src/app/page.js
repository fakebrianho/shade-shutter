'use client'
import styles from './page.module.css'
import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import GlassNavbar from '@/components/GlassNavbar'

// Dynamically import p5 to avoid SSR issues
const p5 = dynamic(() => import('p5'), { ssr: false })

export default function HomePage() {
	const p5Container = useRef(null)
	const [isClient, setIsClient] = useState(false)

	// Ensure we're on client side before mounting p5
	useEffect(() => {
		setIsClient(true)
	}, [])

	useEffect(() => {
		if (isClient && p5Container.current) {
			const initP5 = async () => {
				const p5Module = await import('p5')
				const p5Constructor = p5Module.default || p5Module
				
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
							const x = p.noise(i * 0.01, p.frameCount * 0.001) * p.width
							const y = p.noise(i * 0.01 + 100, p.frameCount * 0.001) * p.height
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

				const p5Instance = new p5Constructor(sketch, p5Container.current)

				return () => {
					p5Instance.remove()
				}
			}

			const cleanupPromise = initP5()
			
			return () => {
				cleanupPromise.then(cleanup => {
					if (cleanup) cleanup()
				})
			}
		}
	}, [isClient])

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
			<GlassNavbar />
		</div>
	)
}
