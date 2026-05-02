import axios from 'axios';
// @ts-ignore
import { Log, getAuthToken } from 'logging_middleware';

const NOTIFICATIONS_URL = 'http://20.207.122.201/evaluation-service/notifications';

export const logger = async (level: string, pkg: string, message: string) => {
    // We swallow errors here so logging doesn't crash the UI
    try {
        await Log("frontend" as any, level as any, pkg as any, message);
    } catch (e) {
        // silent
    }
}

export const fetchNotifications = async (limit?: number, page?: number, notificationType?: string) => {
    try {
        await logger('info', 'api', 'Fetching notifications from server');
        const token = await getAuthToken();
        
        let url = NOTIFICATIONS_URL;
        const params = new URLSearchParams();
        if (limit) params.append('limit', limit.toString());
        if (page) params.append('page', page.toString());
        if (notificationType) params.append('notification_type', notificationType);
        
        if (params.toString()) {
            url += `?${params.toString()}`;
        }

        const response = await axios.get(url, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        await logger('info', 'api', `Successfully fetched ${response.data.notifications?.length || 0} notifications`);
        return response.data.notifications || [];
    } catch (error: any) {
        await logger('error', 'api', `Failed to fetch notifications: ${error.message}`);
        return [];
    }
}
