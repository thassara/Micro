import SockJS from 'sockjs-client';
import Stomp from 'stompjs';

const WS_URL = 'http://localhost:8080/delivery-websocket';

export const connectWebSocket = (deliveryId, onMessage) => {
  const socket = new SockJS(WS_URL);
  const stompClient = Stomp.over(socket);
  stompClient.connect({}, () => {
    stompClient.subscribe(`/topic/delivery/${deliveryId}`, (message) => {
      onMessage(JSON.parse(message.body));
    });
  });
  return stompClient;
};

export const connectDriverResponseWebSocket = (deliveryId, onMessage) => {
  const socket = new SockJS(WS_URL);
  const stompClient = Stomp.over(socket);
  stompClient.connect({}, () => {
    stompClient.subscribe(`/topic/delivery/${deliveryId}/driver-response`, (message) => {
      onMessage(JSON.parse(message.body));
    });
  });
  return stompClient;
};