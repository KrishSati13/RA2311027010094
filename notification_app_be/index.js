import express from 'express';
import axios from 'axios';
import { Log, getAuthToken } from 'logging_middleware';

const app = express();
const PORT = 4000;
const NOTIFICATIONS_URL = 'http://20.207.122.201/evaluation-service/notifications';

const PRIORITY_WEIGHTS = {
    'Placement': 3,
    'Result': 2,
    'Event': 1
};

async function fetchNotifications() {
    try {
        const token = await getAuthToken();
        const response = await axios.get(NOTIFICATIONS_URL, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        await Log("backend", "info", "api", "Successfully fetched notifications from test server");
        return response.data.notifications || [];
    } catch (error) {
        console.error("Failed to fetch notifications:", error.message);
        await Log("backend", "error", "api", "Failed to fetch notifications: " + error.message);
        return [];
    }
}

function getTopPriorityNotifications(notifications, n = 10) {
    const sorted = [...notifications].sort((a, b) => {
        const weightA = PRIORITY_WEIGHTS[a.Type] || 0;
        const weightB = PRIORITY_WEIGHTS[b.Type] || 0;
        if (weightA !== weightB) {
            return weightB - weightA;
        }
        const timeA = new Date(a.Timestamp).getTime();
        const timeB = new Date(b.Timestamp).getTime();
        return timeB - timeA;
    });
    return sorted.slice(0, n);
}

app.get('/api/priority-notifications', async (req, res) => {
    try {
        await Log("backend", "info", "handler", "Received request for priority notifications");
        
        const n = req.query.n ? parseInt(req.query.n, 10) : 10;
        const notifications = await fetchNotifications();
        
        const topN = getTopPriorityNotifications(notifications, n);
        
        res.status(200).json({
            success: true,
            count: topN.length,
            data: topN
        });
        await Log("backend", "info", "handler", `Successfully returned top ${n} priority notifications`);
    } catch (error) {
        await Log("backend", "error", "handler", "Error processing priority notifications API");
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

app.listen(PORT, () => {
    console.log(`Backend API Server running on http://localhost:${PORT}`);
});
