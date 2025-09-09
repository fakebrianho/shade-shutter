import Link from 'next/link'

export default function HomePage() {
	return (
		<div className='container mx-auto p-8 text-center'>
			<h1 className='text-4xl font-bold mb-8'>
				Photo Processing Platform
			</h1>
			<p className='text-xl mb-8 text-gray-600'>
				Upload your photos and let our AI-powered P5.js tools transform
				them
			</p>

			<div className='grid md:grid-cols-2 gap-8 max-w-4xl mx-auto'>
				<div className='bg-blue-50 p-8 rounded-lg'>
					<h2 className='text-2xl font-semibold mb-4'>For Users</h2>
					<p className='mb-4'>
						Upload up to 33 photos for professional processing
					</p>
					<Link
						href='/upload'
						className='bg-blue-500 text-white px-6 py-3 rounded-lg inline-block hover:bg-blue-600'
					>
						Upload Photos
					</Link>
				</div>

				<div className='bg-green-50 p-8 rounded-lg'>
					<h2 className='text-2xl font-semibold mb-4'>For Admins</h2>
					<p className='mb-4'>
						Process uploaded photos with P5.js tools
					</p>
					<Link
						href='/admin'
						className='bg-green-500 text-white px-6 py-3 rounded-lg inline-block hover:bg-green-600'
					>
						Admin Dashboard
					</Link>
				</div>
			</div>
		</div>
	)
}
