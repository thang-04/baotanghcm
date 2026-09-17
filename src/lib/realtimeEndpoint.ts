export interface RealtimeEndpoint {
  origin: string;
  socketPath: string;
  httpBase: string;
}

export function getRealtimeEndpoint(): RealtimeEndpoint {
  const configuredOrigin = process.env.NEXT_PUBLIC_WS_URL?.replace(/\/$/, '');
  const pageIsSecure = typeof window !== 'undefined' && window.location.protocol === 'https:';
  const configuredIsSecure = configuredOrigin?.startsWith('https://');
  const configuredIsUsable = configuredOrigin && (!pageIsSecure || configuredIsSecure);

  if (configuredIsUsable) {
    return {
      origin: configuredOrigin,
      socketPath: process.env.NEXT_PUBLIC_WS_PATH || '/socket.io',
      httpBase: configuredOrigin,
    };
  }

  if (process.env.NODE_ENV === 'production' && typeof window !== 'undefined') {
    return {
      origin: window.location.origin,
      socketPath: '/api/socket-io/socket.io',
      httpBase: `${window.location.origin}/api/socket-io`,
    };
  }

  return {
    origin: 'http://localhost:3001',
    socketPath: '/socket.io',
    httpBase: 'http://localhost:3001',
  };
}
