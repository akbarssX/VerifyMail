const db = require('../database');
const { sendVerificationEmail } = require('../services/emailService');

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// 1. Define our whitelist of major providers
const allowedDomains = [
    'gmail.com', 'googlemail.com',
    'outlook.com', 'hotmail.com', 'live.com', 'msn.com',
    'yahoo.com', 'ymail.com', 'rocketmail.com',
    'icloud.com', 'me.com', 'mac.com',
    'aol.com', 'protonmail.com', 'proton.me'
];

exports.sendOtp = async (req, res) => {
    const { email } = req.body;

    // 2. Standard format check
    if (!email || !emailRegex.test(email)) {
        return res.status(400).json({ error: "Invalid email format" });
    }

    // 3. Extract and check the domain
    const domain = email.split('@')[1].toLowerCase();
    if (!allowedDomains.includes(domain)) {
        return res.status(400).json({ error: "Please use a major email provider (Gmail, Outlook, Proton, Apple, etc.)" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const created_at = Date.now();
    const expires_at = created_at + 5 * 60 * 1000; // 5 mins

    db.run(
        `INSERT INTO verifications (email, otp, created_at, expires_at, attempt_count, is_verified) 
         VALUES (?, ?, ?, ?, 0, 0)
         ON CONFLICT(email) DO UPDATE SET 
         otp=excluded.otp, created_at=excluded.created_at, expires_at=excluded.expires_at, attempt_count=0, is_verified=0`,
        [email, otp, created_at, expires_at],
        async function(err) {
            if (err) return res.status(500).json({ error: "Database error" });

            const emailResult = await sendVerificationEmail(email, otp);
            if (!emailResult.success) {
                return res.status(500).json({ error: "Failed to send email" });
            }

            res.status(200).json({ success: true, otp_sent: true });
        }
    );
};

exports.verifyOtp = (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) return res.status(400).json({ error: "Email and OTP required" });

    db.get(`SELECT * FROM verifications WHERE email = ?`, [email], (err, row) => {
        if (err) return res.status(500).json({ error: "Database error" });
        if (!row) return res.status(400).json({ error: "invalid_otp" });

        const now = Date.now();

        if (row.is_verified) return res.status(200).json({ verified: true });
        
        if (now > row.expires_at) {
            return res.status(400).json({ error: "expired" });
        }

        if (row.attempt_count >= 5) {
            return res.status(400).json({ error: "expired", message: "Max attempts reached. Request a new OTP." });
        }

        if (row.otp !== otp) {
            db.run(`UPDATE verifications SET attempt_count = attempt_count + 1 WHERE email = ?`, [email]);
            return res.status(400).json({ error: "invalid_otp" });
        }

        db.run(`UPDATE verifications SET is_verified = 1 WHERE email = ?`, [email], (err) => {
            if (err) return res.status(500).json({ error: "Database error" });
            res.status(200).json({ verified: true });
        });
    });
};

exports.checkVerification = (req, res) => {
    const { email } = req.query;

    if (!email) return res.status(400).json({ error: "Email query param required" });

    db.get(`SELECT is_verified FROM verifications WHERE email = ?`, [email], (err, row) => {
        if (err) return res.status(500).json({ error: "Database error" });
        if (!row) return res.status(200).json({ verified: false });
        
        res.status(200).json({ verified: row.is_verified === 1 });
    });
};