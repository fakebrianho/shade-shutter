/** @type {import('next').NextConfig} */
const nextConfig = {
	experimental: {
		appDir: false, // Using pages router for simplicity
	},
	images: {
		domains: ['res.cloudinary.com'],
	},
	api: {
		bodyParser: {
			sizeLimit: '50mb',
		},
	},
}

module.exports = nextConfig
