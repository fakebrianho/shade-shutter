'use client'

import { useState, useEffect } from 'react'
import styles from './SubmissionsDashboard.module.css'

export default function SubmissionsDashboard() {
	const [submissions, setSubmissions] = useState([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState(null)
	const [selectedUser, setSelectedUser] = useState('')
	const [users, setUsers] = useState([])

	useEffect(() => {
		fetchSubmissions()
	}, [selectedUser])

	// Ensure users array is always valid and handle empty state
	const validUsers = users
		.filter(Boolean)
		.filter((user, index, arr) => arr.indexOf(user) === index)
	const hasSubmissions = submissions.length > 0
	const hasUsers = validUsers.length > 0

	const fetchSubmissions = async () => {
		try {
			setLoading(true)
			const params = new URLSearchParams()
			if (selectedUser) {
				params.append('user', selectedUser)
			}
			params.append('limit', '100')

			const response = await fetch(`/api/submissions?${params}`)
			const data = await response.json()

			if (data.success) {
				console.log('Raw submissions data:', data.submissions)

				setSubmissions(data.submissions)

				// Extract unique users and ensure they're properly filtered
				const userIdentifiers = data.submissions
					.map((s) => {
						console.log(`Submission ${s.submissionId}:`, {
							userIdentifier: s.userIdentifier,
							userInfo: s.userInfo,
							hasUserIdentifier: !!s.userIdentifier,
							type: typeof s.userIdentifier,
						})

						// Fallback: if userIdentifier is not set, try to get it from userInfo
						if (!s.userIdentifier && s.userInfo) {
							const fallbackId =
								s.userInfo.email || s.userInfo.name
							if (fallbackId) {
								console.log(
									`Using fallback user identifier: ${fallbackId}`
								)
								return fallbackId
							}
						}

						return s.userIdentifier
					})
					.filter(Boolean)

				console.log('Filtered user identifiers:', userIdentifiers)

				const uniqueUsers = [...new Set(userIdentifiers)]
				console.log('Final unique users:', uniqueUsers)

				setUsers(uniqueUsers)
			} else {
				setError(data.error)
			}
		} catch (err) {
			setError('Failed to fetch submissions')
			console.error('Error fetching submissions:', err)
		} finally {
			setLoading(false)
		}
	}

	const deleteSubmission = async (submissionId) => {
		if (
			!confirm(
				'Are you sure you want to delete this submission? This will also delete all images from Cloudinary.'
			)
		) {
			return
		}

		try {
			const response = await fetch(
				`/api/submissions?submissionId=${submissionId}`,
				{
					method: 'DELETE',
				}
			)
			const data = await response.json()

			if (data.success) {
				// Remove from local state
				setSubmissions((prev) =>
					prev.filter((s) => s.submissionId !== submissionId)
				)
				alert('Submission deleted successfully')
			} else {
				alert('Failed to delete submission: ' + data.error)
			}
		} catch (err) {
			console.error('Error deleting submission:', err)
			alert('Failed to delete submission')
		}
	}

	const formatBytes = (bytes) => {
		if (bytes === 0) return '0 Bytes'
		const k = 1024
		const sizes = ['Bytes', 'KB', 'MB', 'GB']
		const i = Math.floor(Math.log(bytes) / Math.log(k))
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
	}

	const formatDate = (dateString) => {
		return new Date(dateString).toLocaleString()
	}

	if (loading) {
		return <div className={styles.loading}>Loading submissions...</div>
	}

	if (error) {
		return <div className={styles.error}>Error: {error}</div>
	}

	return (
		<div className={styles.dashboard}>
			<div className={styles.header}>
				<h2>Submissions Dashboard</h2>
				<div className={styles.controls}>
					<select
						value={selectedUser}
						onChange={(e) => setSelectedUser(e.target.value)}
						className={styles.userFilter}
						disabled={!hasUsers}
					>
						<option value=''>All Users</option>
						{hasUsers ? (
							validUsers.map((user, index) => (
								<option
									key={`user-${user}-${index}`}
									value={user}
								>
									{user}
								</option>
							))
						) : (
							<option value='' disabled>
								{hasSubmissions
									? 'No valid user identifiers found'
									: 'No submissions yet'}
							</option>
						)}
					</select>
					<button
						onClick={fetchSubmissions}
						className={styles.refreshBtn}
					>
						Refresh
					</button>
				</div>
			</div>

			<div className={styles.stats}>
				<div className={styles.statCard}>
					<h3>Total Submissions</h3>
					<p>{submissions.length}</p>
				</div>
				<div className={styles.statCard}>
					<h3>Total Images</h3>
					<p>
						{submissions.reduce(
							(sum, s) => sum + (s.metadata?.totalImages || 0),
							0
						)}
					</p>
				</div>
				<div className={styles.statCard}>
					<h3>Total Size</h3>
					<p>
						{formatBytes(
							submissions.reduce(
								(sum, s) => sum + (s.metadata?.totalSize || 0),
								0
							)
						)}
					</p>
				</div>
			</div>

			<div className={styles.submissionsList}>
				{submissions.length === 0 ? (
					<div className={styles.emptyState}>
						{loading
							? 'Loading submissions...'
							: selectedUser
							? `No submissions found for user: ${selectedUser}`
							: 'No submissions found yet. Upload some images to get started!'}
					</div>
				) : (
					submissions.map((submission) => (
						<div
							key={submission.submissionId}
							className={styles.submissionCard}
						>
							<div className={styles.submissionHeader}>
								<h4>Submission: {submission.submissionId}</h4>
								<div className={styles.submissionMeta}>
									<span
										className={styles.status}
										data-status={submission.status}
									>
										{submission.status}
									</span>
									<span className={styles.date}>
										{formatDate(submission.createdAt)}
									</span>
								</div>
							</div>

							<div className={styles.userInfo}>
								<strong>User:</strong>{' '}
								{submission.userIdentifier}
								{submission.userInfo.email && (
									<span className={styles.email}>
										{' '}
										({submission.userInfo.email})
									</span>
								)}
							</div>

							<div className={styles.folderInfo}>
								<strong>Cloudinary Folder:</strong>
								<code className={styles.folderPath}>
									{submission.cloudinaryFolder}
								</code>
							</div>

							<div className={styles.imagesInfo}>
								<strong>Images:</strong>{' '}
								{submission.images.length}
								{submission.metadata?.totalSize && (
									<span className={styles.size}>
										{' '}
										(
										{formatBytes(
											submission.metadata.totalSize
										)}
										)
									</span>
								)}
							</div>

							{submission.cloudinaryInfo && (
								<div className={styles.cloudinaryInfo}>
									<strong>Cloudinary Resources:</strong>{' '}
									{submission.cloudinaryInfo.resourceCount}
									{submission.cloudinaryInfo.resources
										.length > 0 && (
										<div className={styles.resourcesList}>
											{submission.cloudinaryInfo.resources.map(
												(resource, index) => (
													<div
														key={index}
														className={
															styles.resourceItem
														}
													>
														<img
															src={resource.url}
															alt={`Resource ${
																index + 1
															}`}
															className={
																styles.resourceThumbnail
															}
														/>
														<div
															className={
																styles.resourceDetails
															}
														>
															<span>
																{resource.format.toUpperCase()}
															</span>
															<span>
																{formatBytes(
																	resource.bytes
																)}
															</span>
														</div>
													</div>
												)
											)}
										</div>
									)}
								</div>
							)}

							<div className={styles.actions}>
								<button
									onClick={() =>
										deleteSubmission(
											submission.submissionId
										)
									}
									className={styles.deleteBtn}
								>
									Delete Submission
								</button>
							</div>
						</div>
					))
				)}
			</div>
		</div>
	)
}
