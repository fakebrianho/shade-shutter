import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
})

// Utility functions for better Cloudinary organization
export const cloudinaryUtils = {
	// Create a new collection/folder structure
	async createFolder(folderPath) {
		try {
			// Cloudinary automatically creates folders when you upload to them
			// This function can be used for validation or future folder management
			return { success: true, folderPath }
		} catch (error) {
			console.error('Error creating folder:', error)
			return { success: false, error: error.message }
		}
	},

	// Get all resources in a specific folder
	async getFolderContents(folderPath, options = {}) {
		try {
			const result = await cloudinary.api.resources({
				type: 'upload',
				prefix: folderPath,
				max_results: options.maxResults || 100,
				...options,
			})
			return { success: true, resources: result.resources }
		} catch (error) {
			console.error('Error getting folder contents:', error)
			return { success: false, error: error.message }
		}
	},

	// Delete a folder and all its contents
	async deleteFolder(folderPath) {
		try {
			// Get all resources in the folder
			const { resources } = await cloudinary.api.resources({
				type: 'upload',
				prefix: folderPath,
				max_results: 500,
			})

			// Delete all resources in the folder
			if (resources.length > 0) {
				const publicIds = resources.map(resource => resource.public_id)
				await cloudinary.api.delete_resources(publicIds)
			}

			return { success: true, deletedCount: resources.length }
		} catch (error) {
			console.error('Error deleting folder:', error)
			return { success: false, error: error.message }
		}
	},

	// Get user's submission folders
	async getUserSubmissions(userIdentifier) {
		try {
			const result = await cloudinary.api.resources({
				type: 'upload',
				prefix: `users/${userIdentifier}/submissions/`,
				max_results: 100,
				context: true,
			})
			return { success: true, submissions: result.resources }
		} catch (error) {
			console.error('Error getting user submissions:', error)
			return { success: false, error: error.message }
		}
	},

	// Generate organized folder path
	generateFolderPath(userIdentifier, submissionId) {
		const sanitizedUserIdentifier = userIdentifier.replace(/[^a-zA-Z0-9-_]/g, '_')
		return `users/${sanitizedUserIdentifier}/submissions/${submissionId}`
	},

	// Validate folder path format
	validateFolderPath(folderPath) {
		const validFormat = /^users\/[a-zA-Z0-9-_]+\/submissions\/[a-zA-Z0-9-_]+$/
		return validFormat.test(folderPath)
	},
}

export default cloudinary
