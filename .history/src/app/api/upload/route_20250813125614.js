import { NextRequest, NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import { join } from 'path'
import cloudinary from '../../../lib/cloudinary'
import { connectToDatabase } from '../../../lib/mongodb'

// Configure body size limit for this route
export const maxDuration = 300 // 5 minutes
export const dynamic = 'force-dynamic'

export async function POST(request) {
	try {
		const formData = await request.formData()

		const userInfoString = formData.get('userInfo')
		const userInfo = JSON.parse(userInfoString)

		// Get all image files
		const imageFiles = []
		for (const [key, value] of formData.entries()) {
			if (key.startsWith('image_') && value instanceof File) {
				imageFiles.push(value)
			}
		}

		if (imageFiles.length === 0) {
			return NextResponse.json(
				{ error: 'No images provided' },
				{ status: 400 }
			)
		}

		// Check file sizes (limit to 50MB total)
		let totalSize = 0
		const maxSize = 50 * 1024 * 1024 // 50MB

		for (const file of imageFiles) {
			totalSize += file.size
			if (totalSize > maxSize) {
				return NextResponse.json(
					{ error: 'Total file size exceeds 50MB limit' },
					{ status: 413 }
				)
			}
		}

		// Generate unique submission ID
		const submissionId = `sub_${Date.now()}_${Math.random()
			.toString(36)
			.substr(2, 9)}`

		// Upload to Cloudinary
		const uploadPromises = imageFiles.map(async (file, index) => {
			// Convert File to Buffer
			const bytes = await file.arrayBuffer()
			const buffer = Buffer.from(bytes)

			// Upload to Cloudinary
			return new Promise((resolve, reject) => {
				cloudinary.uploader
					.upload_stream(
						{
							folder: `submissions/${submissionId}`,
							public_id: `image_${index}`,
							transformation: [
								{ quality: 'auto' },
								{ fetch_format: 'auto' },
							],
						},
						(error, result) => {
							if (error) reject(error)
							else
								resolve({
									cloudinaryId: result.public_id,
									url: result.secure_url,
									originalName: file.name,
									processed: false,
									processedUrl: null,
								})
						}
					)
					.end(buffer)
			})
		})

		const uploadedImages = await Promise.all(uploadPromises)

		// Save to database
		const { db } = await connectToDatabase()
		await db.collection('submissions').insertOne({
			submissionId,
			userInfo,
			images: uploadedImages,
			status: 'pending',
			createdAt: new Date(),
			processedAt: null,
		})

		return NextResponse.json({
			success: true,
			submissionId,
			imageCount: uploadedImages.length,
		})
	} catch (error) {
		console.error('Upload error:', error)

		// Handle specific MongoDB errors
		if (error.code === 8000) {
			return NextResponse.json(
				{
					error: 'Database connection failed. Please check your MongoDB credentials.',
				},
				{ status: 500 }
			)
		}

		return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
	}
}
