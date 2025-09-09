'use client'

import { useState } from 'react'
import { useDropzone } from 'react-dropzone'

export default function UploadPage() {
  const [files, setFiles] = useState([])
  const [userInfo, setUserInfo] = useState({ email: '', name: '', project: '' })
  const [uploading, setUploading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: 33,
    onDrop: (acceptedFiles) => {
      setFiles(prev => [...prev, ...acceptedFiles].slice(0, 33))
    }
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (files.length === 0) return

    setUploading(true)
    
    const formData = new FormData()
    files.forEach((file, index) => {
      formData.append(`image_${index}`, file)
    })
    formData.append('userInfo', JSON.stringify(userInfo))

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })
      
      const result = await response.json()
      
      if (result.success) {
        setSubmitted(true)
      }
    } catch (error) {
      console.error('Upload failed:', error)
    } finally {
      setUploading(false)
    }
  }

  const removeFile = (indexToRemove) => {
    setFiles(files.filter((_, index) => index !== indexToRemove))
  }

  if (submitted) {
    return (
      <div className="container mx-auto p-8 text-center">
        <div className="max-w-md mx-auto bg-green-50 p-8 rounded-lg">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-2xl font-bold text-green-800 mb-4">
            Upload Successful!
          </h1>
          <p className="text-green-700 mb-4">
            Your {files.length} images have been submitted for processing.
          </p>
          <p className="text-sm text-green-600">
            You'll receive an email when they're ready.
          </p>
          <button
            onClick={() => {
              setSubmitted(false)
              setFiles([])
              setUserInfo({ email: '', name: '', project: '' })
            }}
            className="mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Upload More Photos
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Upload Your Photos</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* User Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="email"
            placeholder="Your Email"
            required
            value={userInfo.email}
            onChange={(e) => setUserInfo(prev => ({...prev, email: e.target.value}))}
            className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <input
            type="text"
            placeholder="Your Name"
            required
            value={userInfo.name}
            onChange={(e) => setUserInfo(prev => ({...prev, name: e.target.value}))}
            className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <input
            type="text"
            placeholder="Project Name"
            required
            value={userInfo.project}
            onChange={(e) => setUserInfo(prev => ({...prev, project: e.target.value}))}
            className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* File Drop Zone */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed p-8 text-center cursor-pointer rounded-lg transition-colors ${
            isDragActive 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
          }`}
        >
          <input {...getInputProps()} />
          <div className="text-4xl mb-4">📸</div>
          <p className="text-lg mb-2">
            {isDragActive
              ? 'Drop the images here...'
              : 'Drop up to 33 images here, or click to select files'
            }
          </p>
          <p className="text-sm text-gray-500">
            {files.length}/33 files selected
          </p>
        </div>

        {/* Preview Grid */}
        {files.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Selected Images:</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {files.map((file, index) => (
                <div key={index} className="relative group">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Preview ${index}`}
                    className="w-full h-24 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 text-xs