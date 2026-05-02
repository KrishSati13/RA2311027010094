import axios from 'axios';

const AUTH_URL = 'http://20.207.122.201/evaluation-service/auth';
const LOG_URL = 'http://20.207.122.201/evaluation-service/logs';

let cachedToken = null;
let tokenExpiry = null;

// The credentials for fetching the token
const credentials = {
   email: "ks8508@srmist.edu.in",
   name: "krish sati",
   rollNo: "RA2311027010094",
   accessCode: "QkbpxH",
   clientID: "facdb64e-2fd5-4a0a-af92-c1dadb20a453",
   clientSecret: "DfaQKvcYKnNEVQUF"
};

async function getAuthToken() {
    // Check if token is cached and not expired
    if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
        return cachedToken;
    }

    try {
        const response = await axios.post(AUTH_URL, credentials);
        if (response.data && response.data.access_token) {
            cachedToken = response.data.access_token;
            // Token usually expires in a set time, say 1 hour. We subtract 10 seconds for safety margin.
            // The API response returns 'expires_in' which is an absolute unix timestamp in seconds.
            const expiresAt = response.data.expires_in * 1000; 
            tokenExpiry = expiresAt - 10000;
            return cachedToken;
        }
    } catch (error) {
        console.error("Failed to fetch auth token for logging:", error.message);
        throw error;
    }
}

/**
 * 
 * @param {string} stack - "backend" or "frontend"
 * @param {string} level - "debug", "info", "warn", "error", "fatal"
 * @param {string} pkg - e.g. "api", "component", "hook", "page", "state", "style", "utils"
 * @param {string} message - Descriptive message
 */
async function Log(stack, level, pkg, message) {
    try {
        const token = await getAuthToken();
        const payload = {
            stack: stack.toLowerCase(),
            level: level.toLowerCase(),
            package: pkg.toLowerCase(),
            message: message
        };

        const response = await axios.post(LOG_URL, payload, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        // Return true if successful
        return response.data;
    } catch (error) {
        console.error("Logging failed:", error.message);
    }
}

export { Log, getAuthToken };
