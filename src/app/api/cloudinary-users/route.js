import { NextRequest, NextResponse } from 'next/server'
import { cloudinaryUtils } from '../../../lib/cloudinary'

export const dynamic = 'force-dynamic'

// GET: Retrieve users and their submissions from Cloudinary
export async function GET(request) {
	try {
		const { searchParams } = new URL(request.url)
		const userIdentifier = searchParams.get('user')

		// Get all user folders from Cloudinary
		const result = await cloudinary.api.root_folders()

		// Filter for user folders (folders starting with 'users/')
		const userFolders = result.folders.filter(folder => 
			folder.path.startsWith('users/') && 
			folder.path.split('/').length === 2 // Only direct children of users/
		)

		// Extract user identifiers from folder paths
		const userIdentifiers = userFolders.map(folder => 
			folder.path.replace('users/', '').replace('/', '')
		).filter(Boolean)

		let users = userIdentifiers

		// Filter by specific user if requested
		if (userIdentifier) {
			users = users.filter(user => 
				user.toLowerCase().includes(userIdentifier.toLowerCase())
			)
		}

		// Get detailed information for each user
		const usersWithDetails = await Promise.all(
			users.map(async (user) => {
				try {
					// Get user's submission folders
					const userFolderPath = `users/${user}/`
					const submissionsResult = await cloudinary.api.sub_folders(userFolderPath)
					
					// Get detailed info for each submission
					const submissions = await Promise.all(
						submissionsResult.folders.map(async (submissionFolder) => {
							try {
								const folderContents = await cloudinaryUtils.getFolderContents(
									submissionFolder.path,
									{ maxResults: 100 }
								)

								return {
									submissionId: submissionFolder.name,
									folderPath: submissionFolder.path,
									imageCount: folderContents.success ? folderContents.resources.length : 0,
									resources: folderContents.success ? folderContents.resources : [],
									totalSize: folderContents.success 
										? folderContents.resources.reduce((sum, resource) => sum + (resource.bytes || 0), 0)
										: 0,
									createdAt: folderContents.success && folderContents.resources.length > 0
										? new Date(Math.min(...folderContents.resources.map(r => new Date(r.created_at).getTime())))
										: new Date()
								}
							} catch (error) {
								console.error(`Error getting submission ${submissionFolder.name}:`, error)
								return {
									submissionId: submissionFolder.name,
									folderPath: submissionFolder.path,
									imageCount: 0,
									resources: [],
									totalSize: 0,
									createdAt: new Date()
								}
							}
						})
					)

					// Calculate user totals
					const totalImages = submissions.reduce((sum, sub) => sum + sub.imageCount, 0)
					const totalSize = submissions.reduce((sum, sub) => sum + sub.totalSize, 0)

					return {
						userIdentifier: user,
						folderPath: `users/${user}`,
						submissions: submissions,
						totalSubmissions: submissions.length,
						totalImages,
						totalSize,
						lastActivity: submissions.length > 0 
							? new Date(Math.max(...submissions.map(sub => new Date(sub.createdAt).getTime())))
							: null
					}
				} catch (error) {
					console.error(`Error getting user ${user}:`, error)
					return {
						userIdentifier: user,
						folderPath: `users/${user}`,
						submissions: [],
						totalSubmissions: 0,
						totalImages: 0,
						totalSize: 0,
						lastActivity: null,
						error: error.message
					}
				}
			})
		)

		return NextResponse.json({
			success: true,
			users: usersWithDetails,
			total: usersWithDetails.length,
			filtered: userIdentifier ? true : false,
			filter: userIdentifier
		})
	} catch (error) {
		console.error('Error retrieving users:', error)
		return NextResponse.json(
			{ error: 'Failed to retrieve users from Cloudinary' },
			{ status: 500 }
		)
	}
}