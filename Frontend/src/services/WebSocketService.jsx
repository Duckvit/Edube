import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

class WebSocketService {
  constructor() {
    this.client = null;
    this.subscriptions = new Map(); // Lưu subscriptions theo conversationId
    this.connected = false;
    this.onConnectCallback = null;
  }

  connect(jwtToken, onConnectCallback) {
    if (this.client && this.connected) {
      console.log('WebSocket already connected');
      if (onConnectCallback) onConnectCallback();
      return;
    }

    // Tạo URL với token trong query parameter cho SockJS handshake
    const wsUrl = `https://be-edube.onrender.com/ws${jwtToken ? `?token=${encodeURIComponent(jwtToken)}` : ''}`;
    const socket = new SockJS(wsUrl);

    this.client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      connectHeaders: jwtToken ? {
        Authorization: `Bearer ${jwtToken}`,
      } : {},
      onConnect: (frame) => {
        console.log('✅ WebSocket connected:', frame);
        this.connected = true;
        if (onConnectCallback) {
          onConnectCallback();
        }
      },
      onStompError: (frame) => {
        console.error('STOMP error:', frame.headers['message']);
        console.error('Additional details:', frame.body);
        this.connected = false;
      },
      onDisconnect: () => {
        console.log('WebSocket disconnected');
        this.connected = false;
        this.subscriptions.clear();
      },
    });

    this.onConnectCallback = onConnectCallback;
    this.client.activate();
  }

  subscribeToConversation(conversationId, onMessageReceived) {
    if (!this.client || !this.connected) {
      console.warn('WebSocket not connected, cannot subscribe');
      return null;
    }

    const destination = `/topic/conversation/${conversationId}`;
    
    // Unsubscribe nếu đã subscribe trước đó
    if (this.subscriptions.has(conversationId)) {
      const oldSubscription = this.subscriptions.get(conversationId);
      oldSubscription.unsubscribe();
    }

    // Subscribe mới
    const subscription = this.client.subscribe(destination, (message) => {
      try {
        const response = JSON.parse(message.body);
        console.log(`📩 Received message for conversation ${conversationId}:`, response);
        if (onMessageReceived) {
          onMessageReceived(response);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    });

    this.subscriptions.set(conversationId, subscription);
    console.log(`✅ Subscribed to conversation ${conversationId}`);
    return subscription;
  }

  unsubscribeFromConversation(conversationId) {
    if (this.subscriptions.has(conversationId)) {
      const subscription = this.subscriptions.get(conversationId);
      subscription.unsubscribe();
      this.subscriptions.delete(conversationId);
      console.log(`❌ Unsubscribed from conversation ${conversationId}`);
    }
  }

  sendMessage(chatMessageDto) {
    if (!this.client || !this.connected) {
      console.error('WebSocket not connected, cannot send message');
      return false;
    }

    try {
      this.client.publish({
        destination: '/app/chat.send-message',
        body: JSON.stringify(chatMessageDto)
      });
      console.log('📤 Message sent via WebSocket');
      return true;
    } catch (error) {
      console.error('Error sending message via WebSocket:', error);
      return false;
    }
  }

  isConnected() {
    return this.connected && this.client && this.client.connected;
  }

  disconnect() {
    if (this.client) {
      // Unsubscribe tất cả
      this.subscriptions.forEach((subscription) => {
        subscription.unsubscribe();
      });
      this.subscriptions.clear();
      
      this.client.deactivate();
      this.client = null;
      this.connected = false;
      console.log('WebSocket disconnected');
    }
  }
}

export default new WebSocketService();
