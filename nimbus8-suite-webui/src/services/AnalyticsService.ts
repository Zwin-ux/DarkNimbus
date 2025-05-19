import { EventEmitter } from 'events';

export interface AnalyticsData {
  viewers: {
    total: number;
    platforms: {
      twitch?: number;
      youtube?: number;
      kick?: number;
      trovo?: number;
    };
  };
  chatActivity: {
    messagesPerMinute: number;
    activeChatters: number;
    sentiment: number; // -1 to 1 scale
  };
  serverMetrics: {
    cpu: number;
    memory: number;
    responseTime: number;
  };
}

class AnalyticsService extends EventEmitter {
  private data: AnalyticsData = {
    viewers: {
      total: 0,
      platforms: {}
    },
    chatActivity: {
      messagesPerMinute: 0,
      activeChatters: 0,
      sentiment: 0
    },
    serverMetrics: {
      cpu: 0,
      memory: 0,
      responseTime: 0
    }
  };

  constructor() {
    super();
    this.setupPolling();
  }

  private async fetchAnalyticsData() {
    try {
      // TODO: Replace with actual API calls
      const mockData: AnalyticsData = {
        viewers: {
          total: Math.floor(Math.random() * 1000) + 100,
          platforms: {
            twitch: Math.floor(Math.random() * 800) + 50,
            youtube: Math.floor(Math.random() * 300) + 20,
            kick: Math.floor(Math.random() * 100) + 10,
            trovo: Math.floor(Math.random() * 50) + 5
          }
        },
        chatActivity: {
          messagesPerMinute: Math.floor(Math.random() * 50) + 5,
          activeChatters: Math.floor(Math.random() * 100) + 10,
          sentiment: Math.random() * 2 - 1 // Random between -1 and 1
        },
        serverMetrics: {
          cpu: Math.random() * 100,
          memory: Math.random() * 100,
          responseTime: Math.random() * 1000 // ms
        }
      };

      this.data = mockData;
      this.emit('update', this.data);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    }
  }

  private setupPolling() {
    // Update data every 5 seconds
    setInterval(() => this.fetchAnalyticsData(), 5000);
    this.fetchAnalyticsData(); // Initial fetch
  }

  public getCurrentData(): AnalyticsData {
    return this.data;
  }
}

export const analyticsService = new AnalyticsService();
