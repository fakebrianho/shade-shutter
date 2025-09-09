/** @type {import('next').NextConfig} */
const nextConfig = {
	images: {
		domains: ['res.cloudinary.com'],
	},
	experimental: {
		serverComponentsExternalPackages: ['mongodb'],
	},
	api: {
		bodyParser: {
			sizeLimit: '10mb',
		},
	},
}

export default nextConfig
