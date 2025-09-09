import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '../../../lib/mongodb'
import { cloudinaryUtils } from '../../../lib/cloudinary'

export const dynamic = 'force-dynamic'

// GET: Retrieve submissions with optional filtering
export async function GET(request) {
	try {
		const { searchParams } = new URL(request.url)
		const userIdentifier = searchParams.get('user')
		const submissionId = searchParams.get('submissionId')
		const limit = parseInt(searchParams.get('limit')) || 50

		const { db } = await connectToDatabase()

		let query = {}
		if (userIdentifier) {
			query.userIdentifier = userIdentifier
		}
		if (submissionId) {
			query.submissionId = submissionId
		}

		const submissions = await db
			.collection('submissions')
			.find(query)
			.sort({ createdAt: -1 })
			.limit(limit)
			.toArray()

		// Enhance submissions with Cloudinary folder information
		const enhancedSubmissions = await Promise.all(
			submissions.map(async (submission) => {
				try {
					// Get Cloudinary folder contents if folder exists
					const folderContents =
						await cloudinaryUtils.getFolderContents(
							submission.cloudinaryFolder,
							{ maxResults: 100 }
						)

					return {
						...submission,
						cloudinaryInfo: folderContents.success
							? {
									resourceCount:
										folderContents.resources.length,
									resources: folderContents.resources.map(
										(resource) => ({
											publicId: resource.public_id,
											url: resource.secure_url,
											format: resource.format,
											bytes: resource.bytes,
											createdAt: resource.created_at,
										})
									),
							  }
							: null,
					}
				} catch (error) {
					console.error(
						`Error enhancing submission ${submission.submissionId}:`,
						error
					)
					return submission
				}
			})
		)

		return NextResponse.json({
			success: true,
			submissions: enhancedSubmissions,
			total: enhancedSubmissions.length,
			query: { userIdentifier, submissionId, limit },
		})
	} catch (error) {
		console.error('Error retrieving submissions:', error)
		return NextResponse.json(
			{ error: 'Failed to retrieve submissions' },
			{ status: 500 }
		)
	}
}

// DELETE: Delete a submission and its Cloudinary folder
export async function DELETE(request) {
	try {
		const { searchParams } = new URL(request.url)
		const submissionId = searchParams.get('submissionId')

		if (!submissionId) {
			return NextResponse.json(
				{ error: 'submissionId is required' },
				{ status: 400 }
			)
		}

		const { db } = await connectToDatabase()

		// Get the submission to find the Cloudinary folder
		const submission = await db
			.collection('submissions')
			.findOne({ submissionId })

		if (!submission) {
			return NextResponse.json(
				{ error: 'Submission not found' },
				{ status: 404 }
			)
		}

		// Delete from Cloudinary if folder exists
		if (submission.cloudinaryFolder) {
			try {
				await cloudinaryUtils.deleteFolder(submission.cloudinaryFolder)
			} catch (cloudinaryError) {
				console.error(
					'Error deleting Cloudinary folder:',
					cloudinaryError
				)
				// Continue with database deletion even if Cloudinary deletion fails
			}
		}

		// Delete from database
		const result = await db
			.collection('submissions')
			.deleteOne({ submissionId })

		if (result.deletedCount === 0) {
			return NextResponse.json(
				{ error: 'Failed to delete submission' },
				{ status: 500 }
			)
		}

		return NextResponse.json({
			success: true,
			message: 'Submission deleted successfully',
			submissionId,
			cloudinaryFolder: submission.cloudinaryFolder,
		})
	} catch (error) {
		console.error('Error deleting submission:', error)
		return NextResponse.json(
			{ error: 'Failed to delete submission' },
			{ status: 500 }
		)
	}
}
