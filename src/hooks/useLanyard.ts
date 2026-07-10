import { useState, useEffect, useRef } from 'react';

export interface LanyardData {
  discord_user: {
    id: string;
    username: string;
    avatar: string;
    discriminator: string;
    bot: boolean;
    global_name: string;
    display_name: string;
    avatar_decoration_data?: { asset: string; animated?: boolean } | null;
    public_flags?: number;
  };
  discord_status: string;
  activities: {
    type: number;
    name: string;
    state?: string;
    details?: string;
    emoji?: { id?: string; name?: string; animated?: boolean } | null;
    assets?: { large_image?: string; large_text?: string } | null;
    application_id?: string;
  }[];
  active_on_discord_web: boolean;
  active_on_discord_desktop: boolean;
  active_on_discord_mobile: boolean;
  listening_to_spotify: boolean;
  spotify: {
    song: string;
    artist: string;
    album: string;
    album_art_url: string;
    track_id: string;
  } | null;
  kv?: Record<string, string>;
}

export function useLanyard(userId: string) {
  const [data, setData] = useState<LanyardData | null>(null);
  const [loading, setLoading] = useState(true);
  const ws = useRef<WebSocket | null>(null);
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fallbackRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mountedRef = useRef(true);
  const intentionalCloseRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    intentionalCloseRef.current = false;

    const clearHeartbeat = () => {
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
        heartbeatRef.current = null;
      }
    };

    const clearFallback = () => {
      if (fallbackRef.current) {
        clearInterval(fallbackRef.current);
        fallbackRef.current = null;
      }
    };

    const startFallback = async () => {
      // Don't start fallback if already running or if unmounted
      if (fallbackRef.current || !mountedRef.current) return;

      const fetchLanyard = async () => {
        if (!mountedRef.current) return;
        try {
          const res = await fetch(`https://api.lanyard.rest/v1/users/${userId}`);
          if (!res.ok) return;
          const json: { success: boolean; data: LanyardData } = await res.json();
          if (json.success && mountedRef.current) {
            setData(json.data);
            setLoading(false);
          }
        } catch {
          // Network error — silently skip
        }
      };

      await fetchLanyard();
      if (!mountedRef.current) return;
      fallbackRef.current = setInterval(fetchLanyard, 20000);
    };

    const connectWs = () => {
      const socket = new WebSocket('wss://api.lanyard.rest/socket');
      ws.current = socket;

      socket.onmessage = (event: MessageEvent<string>) => {
        const msg = JSON.parse(event.data) as { op: number; d: { heartbeat_interval?: number } & LanyardData; t?: string };

        if (msg.op === 1 && msg.d.heartbeat_interval) {
          const interval = msg.d.heartbeat_interval;
          heartbeatRef.current = setInterval(() => {
            if (socket.readyState === WebSocket.OPEN) {
              socket.send(JSON.stringify({ op: 3 }));
            }
          }, interval);

          socket.send(JSON.stringify({ op: 2, d: { subscribe_to_id: userId } }));
        }

        if ((msg.t === 'INIT_STATE' || msg.t === 'PRESENCE_UPDATE') && mountedRef.current) {
          setData(msg.d as unknown as LanyardData);
          setLoading(false);
        }
      };

      socket.onclose = () => {
        clearHeartbeat();
        // Only start fallback if this wasn't an intentional close (e.g. unmount)
        if (!intentionalCloseRef.current && mountedRef.current) {
          startFallback();
        }
      };

      socket.onerror = () => {
        // Let onclose handle the fallback
        socket.close();
      };
    };

    connectWs();

    return () => {
      mountedRef.current = false;
      intentionalCloseRef.current = true;
      clearHeartbeat();
      clearFallback();
      if (ws.current) {
        ws.current.close();
        ws.current = null;
      }
    };
  }, [userId]);

  return { data, loading };
}
