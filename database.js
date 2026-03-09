const store = new Map();

const db = {
    run: function(query, params, callback) {
        // Handle INSERT / UPDATE (Send OTP)
        if (query.includes("INSERT INTO verifications")) {
            const [email, otp, created_at, expires_at] = params;
            store.set(email, { email, otp, created_at, expires_at, attempt_count: 0, is_verified: 0 });
            if (callback) callback(null);
        }
        // Handle UPDATE attempt_count (Wrong OTP)
        else if (query.includes("SET attempt_count")) {
            const [email] = params;
            const record = store.get(email);
            if (record) record.attempt_count += 1;
            if (callback) callback(null);
        }
        // Handle UPDATE is_verified (Success)
        else if (query.includes("SET is_verified")) {
            const [email] = params;
            const record = store.get(email);
            if (record) record.is_verified = 1;
            if (callback) callback(null);
        }
    },
    
    get: function(query, params, callback) {
        // Handle SELECT queries
        const [email] = params;
        const record = store.get(email);
        if (callback) callback(null, record || null);
    }
};

console.log("Using Serverless-Safe In-Memory Database");

module.exports = db;