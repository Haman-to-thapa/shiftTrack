import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import {
  endShiftApi,
  startShiftApi,
} from '../services/api';
import {
  clearActiveShift,
  getActiveShift,
  saveActiveShift,
} from '../storage/shiftStorage';

type Props = {
  onEnded: () => void;
};

const formatDuration = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  return [
    hours.toString().padStart(2, '0'),
    minutes.toString().padStart(2, '0'),
    secs.toString().padStart(2, '0'),
  ].join(':');
};

export default function ActiveShiftScreen({
  onEnded,
}: Props) {
  const [shift, setShift] = useState<any>(null);
  const [elapsed, setElapsed] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const restoreActiveShift = async () => {
      const storedShift = await getActiveShift();

      if (storedShift) {
        setShift(storedShift);
      }
    };

    restoreActiveShift();
  }, []);

  const startShift = async () => {
    try {
      setLoading(true);
      setError('');

      const newShift = await startShiftApi();

      await saveActiveShift(newShift);

      setShift(newShift);
    } catch {
      setError('Unable to start shift.');
    } finally {
      setLoading(false);
    }
  };

  const endShift = async () => {
    if (!shift || loading) return;

    try {
      setLoading(true);
      setError('');

      await endShiftApi(shift.id);

      await clearActiveShift();

      onEnded();
    } catch {
      setError('Unable to end shift.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!shift?.startTime) return;

    const updateTimer = () => {
      const start = new Date(shift.startTime).getTime();
      const now = Date.now();

      const seconds = Math.max(
        0,
        Math.floor((now - start) / 1000),
      );

      setElapsed(seconds);
    };

    updateTimer();

    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [shift?.startTime]);

  if (!shift) {
    return (
      <View style={styles.center}>
        <View style={styles.card}>
          <View style={styles.readyIconCircle}>
            <Ionicons name="time-outline" size={44} color="#2563EB" />
          </View>

          <Text style={styles.title}>No Active Shift</Text>
          <Text style={styles.subtitle}>
            Ready to begin your work day? Tap below to start your live shift timer.
          </Text>

          {error ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={18} color="#DC2626" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={styles.startButton}
            onPress={startShift}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <View style={styles.buttonInner}>
                <Ionicons name="play" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={styles.buttonText}>Start Shift Now</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.center}>
      <View style={[styles.card, styles.activeCard]}>
        {/* Live Tracking Badge */}
        <View style={styles.liveBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>LIVE SHIFT ACTIVE</Text>
        </View>

        {/* Big Timer */}
        <Text style={styles.timer}>{formatDuration(elapsed)}</Text>

        {/* Started Time Info */}
        <View style={styles.startedBox}>
          <Ionicons name="log-in-outline" size={16} color="#64748B" style={{ marginRight: 6 }} />
          <Text style={styles.started}>
            Started at {new Date(shift.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </Text>
        </View>

        {error ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={18} color="#DC2626" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* End Shift Button */}
        <TouchableOpacity
          style={styles.endButton}
          onPress={endShift}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <View style={styles.buttonInner}>
              <Ionicons name="stop" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.buttonText}>End Active Shift</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F8FAFC',
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
  },
  activeCard: {
    borderColor: '#DBEAFE',
  },
  readyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginBottom: 18,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  liveText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#059669',
    letterSpacing: 0.5,
  },
  timer: {
    fontSize: 52,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -1,
    fontVariant: ['tabular-nums'],
    marginBottom: 14,
  },
  startedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 26,
  },
  started: {
    color: '#475569',
    fontSize: 13,
    fontWeight: '600',
  },
  startButton: {
    width: '100%',
    height: 52,
    backgroundColor: '#10B981',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  endButton: {
    width: '100%',
    height: 52,
    backgroundColor: '#DC2626',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  buttonInner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 16,
    width: '100%',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
    flex: 1,
  },
});
