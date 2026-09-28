import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { getShiftsApi } from '../services/api';
import { Shift } from '../types/shift';

type Props = {
    onCreateShift: () => void;
    onLogout: () => void;
    onStartShift: () => void;
};

const getWeekStart = () => {
    const date = new Date();
    const day = date.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    date.setDate(date.getDate() + diff);
    return date.toISOString().split('T')[0];
};

const formatTime = (value: string | null) => {
    if (!value) return 'Active';
    return new Date(value).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
    });
};

const formatDate = (dateStr: string) => {
    try {
        const parts = dateStr.split('-');
        if (parts.length === 3) {
            const date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
            return date.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
            });
        }
        return dateStr;
    } catch {
        return dateStr;
    }
};

const getDuration = (shift: Shift) => {
    if (!shift.endTime) return 'In Progress';

    const start = new Date(shift.startTime).getTime();
    const end = new Date(shift.endTime).getTime();

    const minutes = Math.max(0, end - start) / 60000 - shift.breakMinutes;
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);

    return `${hours}h ${mins}m`;
};

export default function ShiftsScreen({ onCreateShift, onLogout, onStartShift }: Props) {
    const isFocused = useIsFocused();
    const [shifts, setShifts] = useState<Shift[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const loadShifts = async () => {
        try {
            setLoading(true);
            setError('');

            const weekStart = getWeekStart();
            const data = await getShiftsApi(weekStart);

            setShifts(data);
        } catch {
            setError('Unable to load shifts.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isFocused) {
            loadShifts();
        }
    }, [isFocused]);

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#2563EB" />
                <Text style={styles.loadingText}>Fetching your weekly schedule...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.center}>
                <View style={styles.errorCard}>
                    <Ionicons name="cloud-offline-outline" size={48} color="#EF4444" />
                    <Text style={styles.errorTitle}>Oops! Something went wrong</Text>
                    <Text style={styles.error}>{error}</Text>
                    <TouchableOpacity
                        style={styles.retryButton}
                        onPress={loadShifts}
                        activeOpacity={0.85}
                    >
                        <Ionicons name="refresh" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                        <Text style={styles.retryText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Top Bar */}
            <View style={styles.topBar}>
                <View>
                    <Text style={styles.greeting}>Welcome back,</Text>
                    <Text style={styles.title}>This Week's Shifts</Text>
                </View>
                <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={onLogout}
                    activeOpacity={0.8}
                >
                    <Ionicons name="log-out-outline" size={18} color="#EF4444" />
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
            </View>

            {/* Quick Actions */}
            <View style={styles.actionRow}>
                <TouchableOpacity
                    style={styles.startButton}
                    onPress={onStartShift}
                    activeOpacity={0.85}
                >
                    <Ionicons name="play" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                    <Text style={styles.actionButtonText}>Start Shift</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.createButton}
                    onPress={onCreateShift}
                    activeOpacity={0.85}
                >
                    <Ionicons name="add" size={20} color="#FFFFFF" style={{ marginRight: 4 }} />
                    <Text style={styles.actionButtonText}>Create Shift</Text>
                </TouchableOpacity>
            </View>

            {/* Shifts List / Empty State */}
            {shifts.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <View style={styles.emptyIconCircle}>
                        <Ionicons name="calendar-outline" size={42} color="#94A3B8" />
                    </View>
                    <Text style={styles.emptyTitle}>No Shifts Recorded</Text>
                    <Text style={styles.emptySubtitle}>You haven't logged any shifts for this week yet.</Text>
                </View>
            ) : (
                <FlatList
                    data={shifts}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item }) => {
                        const isActive = !item.endTime;
                        return (
                            <View style={styles.card}>
                                <View style={styles.cardHeader}>
                                    <View style={styles.dateBadge}>
                                        <Ionicons name="calendar" size={14} color="#2563EB" style={{ marginRight: 6 }} />
                                        <Text style={styles.dateText}>{formatDate(item.date)}</Text>
                                    </View>
                                    <View style={[styles.statusBadge, isActive ? styles.activeBadge : styles.completedBadge]}>
                                        <View style={[styles.statusDot, isActive ? styles.activeDot : styles.completedDot]} />
                                        <Text style={[styles.statusText, isActive ? styles.activeText : styles.completedText]}>
                                            {isActive ? 'In Progress' : 'Completed'}
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.divider} />

                                <View style={styles.cardGrid}>
                                    <View style={styles.gridItem}>
                                        <Text style={styles.gridLabel}>START</Text>
                                        <Text style={styles.gridValue}>{formatTime(item.startTime)}</Text>
                                    </View>
                                    <View style={styles.gridItem}>
                                        <Text style={styles.gridLabel}>END</Text>
                                        <Text style={styles.gridValue}>{formatTime(item.endTime)}</Text>
                                    </View>
                                    <View style={styles.gridItem}>
                                        <Text style={styles.gridLabel}>BREAK</Text>
                                        <Text style={styles.gridValue}>{item.breakMinutes}m</Text>
                                    </View>
                                    <View style={styles.gridItem}>
                                        <Text style={styles.gridLabel}>TOTAL</Text>
                                        <Text style={[styles.gridValue, styles.totalHighlight]}>{getDuration(item)}</Text>
                                    </View>
                                </View>
                            </View>
                        );
                    }}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
        paddingHorizontal: 20,
        paddingTop: 16,
    },
    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 18,
    },
    greeting: {
        fontSize: 13,
        fontWeight: '600',
        color: '#64748B',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        color: '#0F172A',
        letterSpacing: -0.5,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FEF2F2',
        borderWidth: 1,
        borderColor: '#FEE2E2',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 10,
    },
    logoutText: {
        color: '#EF4444',
        fontWeight: '700',
        fontSize: 13,
        marginLeft: 4,
    },
    actionRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 20,
    },
    startButton: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: '#10B981',
        paddingVertical: 14,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 3,
    },
    createButton: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: '#1E293B',
        paddingVertical: 14,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#1E293B',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 3,
    },
    actionButtonText: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: 15,
    },
    list: {
        paddingBottom: 24,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 18,
        padding: 18,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    dateBadge: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dateText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#0F172A',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 20,
    },
    activeBadge: {
        backgroundColor: '#ECFDF5',
        borderWidth: 1,
        borderColor: '#A7F3D0',
    },
    completedBadge: {
        backgroundColor: '#F1F5F9',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginRight: 6,
    },
    activeDot: {
        backgroundColor: '#10B981',
    },
    completedDot: {
        backgroundColor: '#64748B',
    },
    statusText: {
        fontSize: 12,
        fontWeight: '700',
    },
    activeText: {
        color: '#059669',
    },
    completedText: {
        color: '#475569',
    },
    divider: {
        height: 1,
        backgroundColor: '#F1F5F9',
        marginVertical: 14,
    },
    cardGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    gridItem: {
        alignItems: 'flex-start',
    },
    gridLabel: {
        fontSize: 11,
        fontWeight: '600',
        color: '#94A3B8',
        marginBottom: 4,
        letterSpacing: 0.5,
    },
    gridValue: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1E293B',
    },
    totalHighlight: {
        color: '#2563EB',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
        backgroundColor: '#F8FAFC',
    },
    loadingText: {
        marginTop: 14,
        color: '#64748B',
        fontSize: 14,
        fontWeight: '500',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 60,
    },
    emptyIconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#F1F5F9',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1E293B',
        marginBottom: 6,
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#64748B',
        textAlign: 'center',
        maxWidth: 240,
    },
    errorCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#FEE2E2',
        shadowColor: '#EF4444',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 3,
        width: '100%',
        maxWidth: 320,
    },
    errorTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#0F172A',
        marginTop: 12,
        marginBottom: 6,
    },
    error: {
        color: '#64748B',
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 20,
    },
    retryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2563EB',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 12,
    },
    retryText: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: 14,
    },
});