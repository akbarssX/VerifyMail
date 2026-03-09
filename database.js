const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const os = require('os');

// Netlify's read-only environment requires writing SQLite to the temporary directory
const isNetlify = process.env.NETLIFY === 'true' || process.env.CONTEXT;

const dbPath = isNetlify 
    ? path.join(os.tmpdir(), 'verifications.db') 
    : path.join(__dirname, 'verifications.db');

// Initialize Database
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Database opening error: ', err);
    } else {
        console.log(`Connected to SQLite database at: ${dbPath}`);
    }
});

// Create the required table if it doesn't exist
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS verifications (
        email TEXT PRIMARY KEY,
        otp TEXT,
        created_at INTEGER,
        expires_at INTEGER,
        attempt_count INTEGER DEFAULT 0,
        is_verified BOOLEAN DEFAULT 0
    )`, (err) => {
        if (err) {
            console.error('Error creating table: ', err);
        }
    });
});

module.exports = db;