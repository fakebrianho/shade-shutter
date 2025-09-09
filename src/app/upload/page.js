'use client'

import { useState } from 'react'
import { useDropzone } from 'react-dropzone'
import Link from 'next/link'
import imageCompression from 'browser-image-compression'
import styles from './upload.module.css'

export default function UploadPage() {
	// Phase management
	const [phase, setPhase] = useState('form') // 'form' or 'upload'
	
	const [files, setFiles] = useState([])
	const [userInfo, setUserInfo] = useState({
		email: '',
		name: '',
		project: '',
	})
	const [uploading, setUploading] = useState(false)
	const [submitted, setSubmitted] = useState(false)
	const [compressing, setCompressing] = useState(false)
	const [uploadError, setUploadError] = useState('')

	// Function to compress images
	const compressImages = async (files) => {
		setCompressing(true)
		const compressedFiles = []

		for (const file of files) {
			try {
				// Only compress if file is larger than 5MB
				if (file.size > 5 * 1024 * 1024) {
					const options = {
						maxSizeMB: 8, // Target 8MB max
						maxWidthOrHeight: 1920, // Max width or height
						useWebWorker: true,
						fileType: 'image/jpeg', // Convert to JPEG for better compression
						initialQuality: 0.8, // Start with 80% quality
					}

					const compressedFile = await imageCompression(file, options)
					compressedFiles.push(compressedFile)
				} else {
					compressedFiles.push(file)
				}
			} catch (error) {
				console.error('Error compressing file:', file.name, error)
				// If compression fails, use original file
				compressedFiles.push(file)
			}
		}

		setCompressing(false)
		return compressedFiles
	}

	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		accept: {
			'image/*': ['.jpeg', '.jpg', '.png', '.webp'],
		},
		maxFiles: 33,
		onDrop: async (acceptedFiles) => {
			setUploadError('') // Clear any previous errors
			const compressedFiles = await compressImages(acceptedFiles)
			setFiles((prev) => [...prev, ...compressedFiles].slice(0, 33))
		},
	})

	// Handle form submission - move to upload phase
	const handleFormSubmit = (e) => {
		e.preventDefault()
		if (userInfo.email && userInfo.name && userInfo.project) {
			setPhase('upload')
		}
	}

	// Handle final upload submission
	const handleUploadSubmit = async (e) => {
		e.preventDefault()
		if (files.length === 0) return

		setUploading(true)
		setUploadError('')

		const formData = new FormData()
		files.forEach((file, index) => {
			formData.append(`image_${index}`, file)
		})
		formData.append('userInfo', JSON.stringify(userInfo))

		try {
			const response = await fetch('/api/upload', {
				method: 'POST',
				body: formData,
			})

			const result = await response.json()

			if (result.success) {
				setSubmitted(true)
			} else {
				setUploadError(
					result.error || 'Upload failed. Please try again.'
				)
			}
		} catch (error) {
			console.error('Upload failed:', error)
			setUploadError(
				'Network error. Please check your connection and try again.'
			)
		} finally {
			setUploading(false)
		}
	}

	const removeFile = (indexToRemove) => {
		setFiles(files.filter((_, index) => index !== indexToRemove))
	}

	const resetForm = () => {
		setPhase('form')
		setSubmitted(false)
		setFiles([])
		setUserInfo({ email: '', name: '', project: '' })
		setUploadError('')
	}

	// Success screen
	if (submitted) {
		return (
			<div className={styles.uploadContainer}>
				<div className={styles.successContainer}>
					<div className='text-6xl mb-4'>✅</div>
					<h1 className={`${styles.whiteText} text-2xl font-bold mb-4`}>
						Upload Successful!
					</h1>
					<p className={`${styles.successText} mb-4`}>
						Your {files.length} images have been submitted for
						processing.
					</p>
					<p className={`${styles.mutedText} text-sm`}>
						You'll receive an email when they're ready.
					</p>
					<button
						onClick={resetForm}
						className={`${styles.submitButton} mt-4`}
					>
						Upload More Photos
					</button>
				</div>
			</div>
		)
	}

	// Phase 1: User Information Form
	if (phase === 'form') {
		return (
			<div className={styles.uploadContainer}>
				<div className={styles.glassForm}>
					<h1 className={styles.formTitle}>Let's Get Started</h1>
					
					<form onSubmit={handleFormSubmit} className='space-y-6'>
						<div className='space-y-4'>
							<div>
								<label className={styles.formLabel}>Email Address</label>
								<input
									type='email'
									placeholder='your@email.com'
									required
									value={userInfo.email}
									onChange={(e) =>
										setUserInfo((prev) => ({
											...prev,
											email: e.target.value,
										}))
									}
									className={styles.formInput}
								/>
							</div>
							
							<div>
								<label className={styles.formLabel}>Full Name</label>
								<input
									type='text'
									placeholder='John Doe'
									required
									value={userInfo.name}
									onChange={(e) =>
										setUserInfo((prev) => ({
											...prev,
											name: e.target.value,
										}))
									}
									className={styles.formInput}
								/>
							</div>
							
							<div>
								<label className={styles.formLabel}>Project Name</label>
								<input
									type='text'
									placeholder='My Awesome Project'
									required
									value={userInfo.project}
									onChange={(e) =>
										setUserInfo((prev) => ({
											...prev,
											project: e.target.value,
										}))
									}
									className={styles.formInput}
								/>
							</div>
						</div>

						<button
							type='submit'
							disabled={!userInfo.email || !userInfo.name || !userInfo.project}
							className={`${styles.submitButton} w-full`}
						>
							Continue to Upload
						</button>
					</form>
				</div>
			</div>
		)
	}

	// Phase 2: File Upload Interface
	return (
		<div className={styles.uploadContainer}>
			<div className={styles.glassUpload}>
				<div className='flex justify-between items-center mb-6'>
					<h1 className={`${styles.whiteText} text-2xl font-bold`}>
						Upload Your Photos
					</h1>
					<button
						onClick={() => setPhase('form')}
						className={`${styles.formInput} text-sm`}
					>
						← Back to Info
					</button>
				</div>

				<form onSubmit={handleUploadSubmit} className='space-y-6'>
					<div className={`${styles.mutedText} text-center mb-4`}>
						Project: <span className={styles.whiteText}>{userInfo.project}</span>
					</div>

					{/* File Drop Zone */}
					<div
						{...getRootProps()}
						className={`${styles.dropZone} ${isDragActive ? styles.dropZoneActive : ''}`}
					>
						<input {...getInputProps()} />
						<div className='text-4xl mb-4'>📸</div>
						<p className={`${styles.whiteText} text-lg mb-2`}>
							{isDragActive
								? 'Drop your images here...'
								: 'Drop up to 33 images here, or click to select files'}
						</p>
						<p className={`${styles.mutedText} text-sm`}>
							{files.length}/33 files selected
						</p>
						{compressing && (
							<p className={`${styles.whiteText} text-sm mt-2`}>
								🔄 Compressing images to reduce file size...
							</p>
						)}
					</div>

					{/* Preview Grid */}
					{files.length > 0 && (
						<div>
							<h3 className={`${styles.whiteText} text-lg font-semibold mb-4`}>
								Selected Images:
							</h3>
							<div className={styles.previewGrid}>
								{files.map((file, index) => (
									<div key={index} className={styles.previewItem}>
										<img
											src={URL.createObjectURL(file)}
											alt={`Preview ${index}`}
											className={styles.previewImage}
										/>
										<button
											type='button'
											onClick={() => removeFile(index)}
											className={styles.removeButton}
										>
											×
										</button>
										<div className={styles.fileInfo}>
											<div className={styles.fileName}>{file.name}</div>
											<div className={styles.fileSize}>
												{(file.size / (1024 * 1024)).toFixed(1)} MB
											</div>
										</div>
									</div>
								))}
							</div>
						</div>
					)}

					{/* Error Display */}
					{uploadError && (
						<div className={styles.errorContainer}>
							<div className='flex items-center'>
								<span className='mr-2'>⚠️</span>
								<span className={styles.errorText}>{uploadError}</span>
							</div>
						</div>
					)}

					<button
						type='submit'
						disabled={
							uploading ||
							compressing ||
							files.length === 0
						}
						className={`${styles.submitButton} w-full`}
					>
						{compressing ? (
							<div className='flex items-center justify-center'>
								<div className={styles.spinner}></div>
								Compressing images...
							</div>
						) : uploading ? (
							<div className='flex items-center justify-center'>
								<div className={styles.spinner}></div>
								Uploading {files.length} images...
							</div>
						) : (
							`Submit ${files.length} Images`
						)}
					</button>
				</form>
			</div>
		</div>
	)
}