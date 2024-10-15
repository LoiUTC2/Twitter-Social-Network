import { useEffect, useState, useRef } from 'react';
import { w3cwebsocket as W3CWebSocket } from 'websocket';

const useWebSocket = (url) => {
  const [isConnected, setIsConnected] = useState(false);
  const client = useRef(null);

  useEffect(() => {
    const connect = () => {
      client.current = new W3CWebSocket(url);

      client.current.onopen = () => {
        setIsConnected(true);
        console.log('WebSocket Client Connected');
      };

      client.current.onclose = () => {
        setIsConnected(false);
        console.log('WebSocket Client Disconnected, retrying in 3 seconds...');
        setTimeout(() => connect(), 3000); // Try to reconnect every 3 seconds
      };

      client.current.onerror = (error) => {
        console.error('WebSocket Error: ', error);
      };

    //   client.current.onmessage = (message) => {
    //     console.log('Received: ', message.data);
    //   };
    };

    connect();

    return () => {
      if (client.current) {
        client.current.close();
      }
    };
  }, [url]);

  return { client: client.current, isConnected };
};

export default useWebSocket;
