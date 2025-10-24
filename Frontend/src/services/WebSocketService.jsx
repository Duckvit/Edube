import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

class WebSocketService {
  constructor() {
    this.client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      debug: (str) => console.log(str),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });
  }

  connect(onMessageReceived) {
    this.client.onConnect = (frame) => {
      console.log('Connected: ' + frame);
      
      // Subscribe to public messages
      this.client.subscribe('/topic/public', (message) => {
        const chatMessage = JSON.parse(message.body);
        onMessageReceived(chatMessage);
      });
    };

    this.client.onStompError = (frame) => {
      console.error('Broker reported error: ' + frame.headers['message']);
      console.error('Additional details: ' + frame.body);
    };

    this.client.activate();
  }

  sendMessage(chatMessageDto) {
    if (this.client.connected) {
      this.client.publish({
        destination: '/app/chat.send-message',
        body: JSON.stringify(chatMessageDto)
      });
    }
  }

  disconnect() {
    this.client.deactivate();
  }
}

export default new WebSocketService();
