import mqtt, { MqttClient } from 'mqtt';
import { EventItem, HomeworkItem, TeacherPost, Student } from '../types';

export interface AppState {
  events: EventItem[];
  homework: HomeworkItem[];
  posts: TeacherPost[];
  students: Student[];
  version: number;
  lastUpdated?: string;
  senderDeviceId?: string;
}

// Generate unique device ID for peer communication
export const DEVICE_ID = `dev-${Math.random().toString(36).substring(2, 9)}-${Date.now().toString(36)}`;

// Global Channel for Bina Bangsa School Portal
const TOPIC_SYNC = 'bbs/portal/v1/state-sync';
const TOPIC_REQUEST = 'bbs/portal/v1/request-state';

// Reliable Public High-Speed WebSocket MQTT Brokers
const BROKERS = [
  'wss://broker.emqx.io:8084/mqtt',
  'wss://broker.hivemq.com:8884/mqtt',
];

// Cloud Snapshot KV Fallback API (works globally without server configuration)
const CLOUD_STORAGE_KEY = 'bbs_school_portal_global_v1';
const CLOUD_STORAGE_ENDPOINT = `https://kv.val.run/${CLOUD_STORAGE_KEY}`;

let client: MqttClient | null = null;
let currentBrokerIndex = 0;
let isConnected = false;
let syncListeners: ((state: AppState) => void)[] = [];
let connectionListeners: ((connected: boolean) => void)[] = [];
let latestKnownState: AppState | null = null;

/**
 * Initialize Cloud Synchronization (MQTT WebSockets + Cloud State Snapshot)
 */
export function initCloudSync(
  onStateReceived: (state: AppState) => void,
  onStatusChange?: (connected: boolean) => void
): () => void {
  syncListeners.push(onStateReceived);
  if (onStatusChange) {
    connectionListeners.push(onStatusChange);
    onStatusChange(isConnected);
  }

  // Connect to MQTT Broker if not already initialized
  if (!client) {
    setupMqttConnection();
  }

  // Also fetch latest cloud snapshot immediately
  fetchCloudSnapshot().then((remoteState) => {
    if (remoteState && (!latestKnownState || remoteState.version > latestKnownState.version)) {
      latestKnownState = remoteState;
      notifyListeners(remoteState);
    }
  });

  return () => {
    syncListeners = syncListeners.filter((l) => l !== onStateReceived);
    if (onStatusChange) {
      connectionListeners = connectionListeners.filter((l) => l !== onStatusChange);
    }
  };
}

function setupMqttConnection() {
  const brokerUrl = BROKERS[currentBrokerIndex];
  console.log(`[CloudSync] Connecting to real-time broker: ${brokerUrl}`);

  try {
    client = mqtt.connect(brokerUrl, {
      clientId: `bbs_${DEVICE_ID}`,
      clean: true,
      connectTimeout: 5000,
      reconnectPeriod: 3000,
      keepalive: 30,
    });

    client.on('connect', () => {
      console.log('[CloudSync] Real-time broker connected successfully!');
      isConnected = true;
      notifyConnection(true);

      // Subscribe to school topics
      client?.subscribe([TOPIC_SYNC, TOPIC_REQUEST], { qos: 0 }, (err) => {
        if (!err) {
          // Announce presence and request latest state from any online peer
          publishStateRequest();
        }
      });
    });

    client.on('message', (topic, message) => {
      try {
        const raw = message.toString();
        const payload = JSON.parse(raw);

        if (topic === TOPIC_SYNC) {
          const incomingState: AppState = payload;
          // Ignore our own broadcast echoes unless it's a version advance
          if (incomingState.senderDeviceId === DEVICE_ID) {
            return;
          }

          if (!latestKnownState || incomingState.version >= latestKnownState.version) {
            latestKnownState = incomingState;
            notifyListeners(incomingState);
            // Cache locally
            saveToLocalCache(incomingState);
          }
        } else if (topic === TOPIC_REQUEST) {
          // Another device just connected and asked for the latest state
          if (payload.senderDeviceId !== DEVICE_ID && latestKnownState) {
            publishFullState(latestKnownState);
          }
        }
      } catch (e) {
        console.warn('[CloudSync] Failed to parse incoming broker message:', e);
      }
    });

    client.on('error', (err) => {
      console.warn('[CloudSync] Broker connection error:', err);
      tryNextBroker();
    });

    client.on('close', () => {
      isConnected = false;
      notifyConnection(false);
    });
  } catch (err) {
    console.warn('[CloudSync] Failed to initialize MQTT client:', err);
    tryNextBroker();
  }
}

function tryNextBroker() {
  if (client) {
    try {
      client.end(true);
    } catch {}
    client = null;
  }
  currentBrokerIndex = (currentBrokerIndex + 1) % BROKERS.length;
  setTimeout(setupMqttConnection, 4000);
}

function notifyListeners(state: AppState) {
  syncListeners.forEach((fn) => {
    try {
      fn(state);
    } catch (e) {
      console.error('[CloudSync] Listener error:', e);
    }
  });
}

function notifyConnection(status: boolean) {
  connectionListeners.forEach((fn) => {
    try {
      fn(status);
    } catch (e) {}
  });
}

/**
 * Request latest state from online peers
 */
export function publishStateRequest() {
  if (client && isConnected) {
    try {
      client.publish(
        TOPIC_REQUEST,
        JSON.stringify({
          senderDeviceId: DEVICE_ID,
          timestamp: Date.now(),
        })
      );
    } catch (e) {}
  }
}

/**
 * Broadcast full app state to all connected devices worldwide
 */
export function broadcastStateChange(state: AppState) {
  const versionedState: AppState = {
    ...state,
    version: (state.version || (latestKnownState?.version || 0)) + 1,
    lastUpdated: new Date().toISOString(),
    senderDeviceId: DEVICE_ID,
  };

  latestKnownState = versionedState;
  saveToLocalCache(versionedState);

  // 1. Instant MQTT WebSockets broadcast to all open devices
  publishFullState(versionedState);

  // 2. Cloud Snapshot Storage (persists even if all browser windows close)
  persistCloudSnapshot(versionedState);
}

function publishFullState(state: AppState) {
  if (client && isConnected) {
    try {
      client.publish(TOPIC_SYNC, JSON.stringify(state));
    } catch (e) {
      console.warn('[CloudSync] Failed to publish MQTT message:', e);
    }
  }
}

/**
 * Persist global state snapshot to free public cloud KV store
 */
async function persistCloudSnapshot(state: AppState) {
  try {
    // Save to Cloud KV
    await fetch(CLOUD_STORAGE_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(state),
    });
  } catch (err) {
    // Silently ignore snapshot save errors as MQTT & Local cache handle real-time sync
  }
}

/**
 * Fetch latest global state snapshot from cloud KV store
 */
export async function fetchCloudSnapshot(): Promise<AppState | null> {
  try {
    const res = await fetch(CLOUD_STORAGE_ENDPOINT);
    if (!res.ok) return null;
    const data = await res.json();
    if (data && Array.isArray(data.events) && Array.isArray(data.homework)) {
      return data as AppState;
    }
    return null;
  } catch (err) {
    return null;
  }
}

function saveToLocalCache(state: AppState) {
  try {
    localStorage.setItem('bbs_events', JSON.stringify(state.events));
    localStorage.setItem('bbs_homework', JSON.stringify(state.homework));
    localStorage.setItem('bbs_posts', JSON.stringify(state.posts));
    localStorage.setItem('bbs_sync_version', String(state.version));
  } catch (e) {}
}
