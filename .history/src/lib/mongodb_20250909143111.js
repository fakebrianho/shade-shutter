import { MongoClient } from 'mongodb'

const uri = process.env.MONGODB_URI
const options = {
	maxPoolSize: 10,
	serverSelectionTimeoutMS: 5000,
	socketTimeoutMS: 45000,
	// SSL/TLS options to handle connection issues
	tls: true,
	tlsAllowInvalidCertificates: false,
	tlsAllowInvalidHostnames: false,
	// Retry options
	retryWrites: true,
	retryReads: true,
	// Connection timeout
	connectTimeoutMS: 10000,
}

let client
let clientPromise

if (!uri) {
	throw new Error(
		'Please define the MONGODB_URI environment variable inside .env.local'
	)
}

if (process.env.NODE_ENV === 'development') {
	// In development mode, use a global variable so that the value
	// is preserved across module reloads caused by HMR (Hot Module Replacement).
	if (!global._mongoClientPromise) {
		client = new MongoClient(uri, options)
		global._mongoClientPromise = client.connect()
	}
	clientPromise = global._mongoClientPromise
} else {
	// In production mode, it's best to not use a global variable.
	client = new MongoClient(uri, options)
	clientPromise = client.connect()
}

export async function connectToDatabase() {
	try {
		const client = await clientPromise

		// Test the connection
		await client.db('admin').command({ ping: 1 })

		const db = client.db('photo-processor')
		return { client, db }
	} catch (error) {
		console.error('MongoDB connection error:', error)

		if (error.code === 8000) {
			throw new Error(
				'MongoDB authentication failed. Please check your username, password, and database name in your connection string.'
			)
		}

		// Handle SSL/TLS errors specifically
		if (error.message.includes('SSL') || error.message.includes('TLS')) {
			throw new Error(
				'MongoDB SSL connection failed. Please check your connection string format and ensure your MongoDB Atlas cluster allows connections from your IP address.'
			)
		}

		throw new Error(`Failed to connect to MongoDB: ${error.message}`)
	}
}

// Graceful shutdown
process.on('SIGINT', async () => {
	if (client) {
		await client.close()
		process.exit(0)
	}
})
