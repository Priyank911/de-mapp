# DEmapp CID Scanner Backend

A Node.js backend service that scans CID-based JSON files from Pinata IPFS, extracts user emails, matches them with existing Firestore users, and creates structured avaxvault entries.

## Features

- 🔍 **CID File Scanning**: Fetches and scans all JSON files from Pinata IPFS
- 📧 **Email Extraction**: Intelligently extracts email addresses from JSON content
- 👥 **User Matching**: Matches found emails with existing Firestore users
- 🏦 **Avaxvault Creation**: Creates structured data in new avaxvault collection
- 🔐 **Firebase Integration**: Seamless integration with existing Firestore structure

## Installation

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Copy .env file and configure if needed
# The .env file is already configured with Pinata credentials
```

4. Start the server:
```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

## API Endpoints

### POST /api/scan
Scans all CID files and processes matching users.

**Response:**
```json
{
  "success": true,
  "message": "CID scan and processing completed",
  "processingTime": "5.2 seconds",
  "data": {
    "processed": 2,
    "results": [...],
    "matchingUsers": [...],
    "processedResults": [...]
  }
}
```

### GET /api/avaxvault
Retrieves all avaxvault data.

### GET /api/avaxvault/:userId
Retrieves avaxvault data for a specific user.

### GET /api/status
Health check endpoint.

## Data Structure

The service creates avaxvault entries with this structure:

```
avaxvault collection
└── [userId] (document)
    └── [email@domain.com] (map)
        ├── profile (map)
        │   ├── email: "email@domain.com"
        │   ├── userId: "user_id_here"
        │   └── lastActive: "timestamp"
        ├── wallet (map)
        │   ├── address: "0x..."
        │   ├── type: "Core Wallet"
        │   ├── chainId: "0xa869"
        │   ├── authentication (map)
        │   ├── connection (map)
        │   └── secretKey (map)
        ├── metadata (map)
        │   ├── createdAt: "timestamp"
        │   ├── version: "2.0"
        │   └── migratedAt: "timestamp"
        └── cidFiles (map)
            ├── totalFiles: 3
            ├── processedAt: "timestamp"
            └── files: [
                {
                  "cid": "QmXXX...",
                  "fileName": "data.json",
                  "content": {...},
                  "fileSize": 1024,
                  "datePinned": "timestamp",
                  "metadata": {...},
                  "processedAt": "timestamp"
                }
            ]
```

## How It Works

1. **Fetch CIDs**: Connects to Pinata API and fetches all pinned files
2. **Filter JSON**: Identifies JSON files based on metadata and content type
3. **Extract Emails**: Scans JSON content using regex and field detection
4. **Match Users**: Searches existing Firestore users collection for matching emails
5. **Create Avaxvault**: Copies user data and adds CID information to new collection

## Environment Variables

```env
# Pinata Configuration
PINATA_API_KEY=your_api_key
PINATA_API_SECRET=your_api_secret
PINATA_JWT=your_jwt_token

# Server Configuration
PORT=3001
NODE_ENV=development

# Firebase Configuration
FIREBASE_PROJECT_ID=your_project_id
```

## Usage Example

1. Start the backend server:
```bash
npm run dev
```

2. Trigger a scan:
```bash
curl -X POST http://localhost:3001/api/scan
```

3. View results:
```bash
curl http://localhost:3001/api/avaxvault
```

## Development

- Uses **Express.js** for the web framework
- **Firebase Admin SDK** for Firestore access
- **Axios** for HTTP requests to Pinata API
- **dotenv** for environment configuration
- **cors**, **helmet**, **morgan** for security and logging

## Error Handling

The service includes comprehensive error handling for:
- Network timeouts when fetching CID content
- Invalid JSON content
- Firebase connection issues
- Missing environment variables
- Malformed CID data

## Security

- Uses helmet for security headers
- Firebase Admin SDK for secure Firestore access
- Environment variables for sensitive credentials
- Input validation and sanitization