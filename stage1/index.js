import axios from 'axios';
import { Log, getAuthToken } from 'logging_middleware';

const NOTIFICATIONS_URL = 'http://20.207.122.201/evaluation-service/notifications';

async function fetchNotifications() {
    try {
        const token = await getAuthToken();
        const response = await axios.get(NOTIFICATIONS_URL, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        await Log("backend", "info", "api", "Successfully fetched notifications from server");
        return response.data.notifications || [];
    } catch (error) {
        console.error("Failed to fetch notifications:", error.message);
        await Log("backend", "error", "api", "Failed to fetch notifications: " + error.message);
        return [];
    }
}

// Weight mapping: Placement > Result > Event
const PRIORITY_WEIGHTS = {
    'Placement': 3,
    'Result': 2,
    'Event': 1
};

/**
 * Prioritizes and returns the top N notifications.
 * @param {Array} notifications - Array of notification objects.
 * @param {number} n - Number of top notifications to return.
 * @returns {Array} - Top N notifications.
 */
function getTopPriorityNotifications(notifications, n = 10) {
    // Sort notifications
    const sorted = [...notifications].sort((a, b) => {
        const weightA = PRIORITY_WEIGHTS[a.Type] || 0;
        const weightB = PRIORITY_WEIGHTS[b.Type] || 0;
        
        if (weightA !== weightB) {
            return weightB - weightA; // Higher weight first
        }
        
        // If weights are equal, sort by recency (Timestamp)
        const timeA = new Date(a.Timestamp).getTime();
        const timeB = new Date(b.Timestamp).getTime();
        
        return timeB - timeA; // Most recent first
    });
    
    return sorted.slice(0, n);
}

async function runStage1() {
    const notifications = await fetchNotifications();
    console.log(`Fetched ${notifications.length} notifications`);
    
    const top10 = getTopPriorityNotifications(notifications, 10);
    console.log(`\nTop 10 Priority Notifications:`);
    top10.forEach((n, i) => {
        console.log(`${i + 1}. [${n.Type}] ${n.Message} (${n.Timestamp})`);
    });

    await Log("backend", "info", "handler", "Successfully computed top priority notifications");
}

runStage1();
