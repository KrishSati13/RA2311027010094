# Stage 1

## Notification System Design: Priority Inbox

### Objective
The objective is to maintain and display a "Priority Inbox" containing the top $n$ (e.g., 10) most important unread notifications. Priority is determined by:
1. **Weight**: Placement > Result > Event
2. **Recency**: The more recent the notification, the higher the priority (used as a tie-breaker for notifications of the same type).

### How to Maintain the Top 10 Efficiently
Given that new notifications will keep coming in continuously, we need a highly efficient mechanism to maintain the top $n$ list without having to re-sort the entire database of notifications every time a new one arrives.

#### 1. Real-time Ingestion via a Min-Heap (Priority Queue)
The most optimal data structure for maintaining the "Top N" items from a stream of data is a **Min-Heap** of size $n$.
- **Heap Logic**: We maintain a Min-Heap of size 10. The priority of nodes in this heap is based on the composite score (Weight + Recency). The root of the Min-Heap represents the 10th highest priority notification (i.e., the *least* priority among the top 10).
- **Insertion**: When a new notification arrives:
  - Calculate its priority score.
  - Compare it with the root of the Min-Heap (the lowest priority in the top 10).
  - If the new notification has a higher priority than the root, we extract the root (removing it from the top 10) and insert the new notification into the heap.
- **Time Complexity**: $O(\log n)$ per incoming notification, where $n = 10$. This means processing a new notification takes constant time $O(1)$ effectively, making it highly scalable for a high volume of incoming notifications.

#### 2. Redis Sorted Sets (Production Implementation)
In a production environment, instead of an in-memory heap per application instance, we can utilize **Redis Sorted Sets (ZSET)**.
- **ZADD**: We can insert the notification into a Redis Sorted Set `user:{id}:priority_inbox`.
- **Scoring Function**: The score can be computed by combining the Weight and the UNIX timestamp. For example, `Score = (Weight * 10^12) + Timestamp`. This guarantees that higher weights always have higher scores, and within the same weight, recent timestamps have higher scores.
- **ZREMRANGEBYRANK**: We can periodically or on-insertion trim the Sorted Set to keep only the top 10 items (e.g., `ZREMRANGEBYRANK user:{id}:priority_inbox 0 -11`).
- **Time Complexity**: $O(\log N)$ for insertion and trimming, which is extremely fast and scalable.

### Architecture Overview
1. **Notification Publisher**: Microservice or module that generates notifications.
2. **Message Broker**: e.g., Kafka or RabbitMQ, capturing the stream of notifications.
3. **Consumer Worker**: Reads notifications from the broker.
4. **Cache/Storage Layer**: The worker computes the score and pushes the notification to a Redis ZSET per user, trimming it to size $n$.
5. **Frontend Application**: Connects via WebSockets for real-time delivery or polls a REST API to fetch the pre-computed Top 10 from Redis.

### Complexity 
- **Time Complexity (Updating)**: $O(\log n)$ using a Min-Heap or Redis ZSET.
- **Space/Storage**: $O(n)$ where $n=10$ (per user), heavily reducing the memory footprint for the priority cache.
