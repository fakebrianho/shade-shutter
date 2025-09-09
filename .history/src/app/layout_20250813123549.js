import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
	title: 'Photo Processor',
	description: 'Upload and process photos with P5.js',
}

export default function RootLayout({ children }) {
	return (
		<html lang='en'>
			<body className={inter.className}>
				<nav className='bg-blue-600 text-white p-4'>
					<div className='container mx-auto flex justify-between items-center'>
						<h1 className='text-xl font-bold'>Photo Processor</h1>
						<div className='space-x-4'>
							<a href='/' className='hover:underline'>
								Home
							</a>
							<a href='/upload' className='hover:underline'>
								Upload
							</a>
							<a href='/admin' className='hover:underline'>
								Admin
							</a>
						</div>
					</div>
				</nav>
				<main>{children}</main>
			</body>
		</html>
	)
}
