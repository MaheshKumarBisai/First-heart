import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, Switch, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Minus, Plus, Save, Settings, MapPin, Building2, Pencil, Trash2, ChevronLeft } from 'lucide-react-native';
import { SeatGrid } from '../../components/cinema/SeatGrid';
import * as SecureStore from 'expo-secure-store';
import { endpoints } from '../../config/api';
import { useRouter, useFocusEffect } from 'expo-router';

export default function CinemaScreen() {
    const router = useRouter();
    // Stages: 'loading' | 'list_theatres' | 'create_theatre' | 'add_hall' | 'edit_theatre'
    const [viewState, setViewState] = useState('loading');

    // Theatre Data
    const [theatres, setTheatres] = useState<any[]>([]); // Array of all theatres
    const [theatre, setTheatre] = useState<any>(null); // Currently selected theatre for adding a hall
    const [newTheatreName, setNewTheatreName] = useState('');
    const [newTheatreCity, setNewTheatreCity] = useState('');

    // Edit Theatre Data
    const [editingTheatre, setEditingTheatre] = useState<any>(null);
    const [editTheatreName, setEditTheatreName] = useState('');
    const [editTheatreCity, setEditTheatreCity] = useState('');

    // Hall Data
    const [hallName, setHallName] = useState('');
    const [selectedTech, setSelectedTech] = useState('IMAX');
    const [rows, setRows] = useState(8);
    const [cols, setCols] = useState(10);
    const [blockedSeats, setBlockedSeats] = useState<string[]>([]);
    const [isAvailable, setIsAvailable] = useState(true);
    const [loading, setLoading] = useState(false);

    useFocusEffect(
        useCallback(() => {
            // Optional: Check theatre status again on focus if needed
            checkTheatreStatus();

            // We can decide if we want to reset form on EVERY focus or just let the user see previous state if they didn't save.
            // User complaint was "when creation complete ... showing same".
            // Since we cleared on save, that handles the "creation complete" case.
            // But if they navigate away WITHOUT saving and come back? They might want their draft.
            // So clearing on Save is the critical fix.
            // I will NOT force clear on focus to preserve "drafts", unless user explicitly wants always new.
            // However, to be safe and "fresh", let's clear if the viewState is 'add_hall' implies we are starting fresh?
            // Actually, checking theatre status again is good.
        }, [])
    );

    useEffect(() => {
        checkTheatreStatus();
    }, []);

    const fetchTheatres = async () => {
        try {
            setLoading(true);
            const token = await SecureStore.getItemAsync('token');
            if (!token) {
                setViewState('create_theatre');
                return;
            }

            const response = await fetch(endpoints.merchant.theatres, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error("Failed to fetch theatres");

            const data = await response.json();

            if (data && data.length > 0) {
                setTheatres(data);
                setViewState('list_theatres');
            } else {
                setViewState('create_theatre');
            }
        } catch (error) {
            console.error("Failed to check theatre status", error);
            setViewState('create_theatre');
        } finally {
            setLoading(false);
        }
    };

    const checkTheatreStatus = async () => {
        await fetchTheatres();
    };

    const handleCreateTheatre = async () => {
        if (!newTheatreName || !newTheatreCity) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        try {
            setLoading(true);
            const token = await SecureStore.getItemAsync('token');

            // Call API to create theatre
            // NOTE: If the user ALREADY has a theatre (e.g. "My Cinema"), this endpoint 
            // might need to be an UPDATE or we handle "already exists" error gracefully.
            // But since we want to "fix" the name, we might want to update if it exists.

            // Let's assume the backend handles "get or create" or we just create a new one 
            // and the backend assigns it to the user.

            const response = await fetch(endpoints.merchant.theatres, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: newTheatreName,
                    city: newTheatreCity
                })
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.detail || 'Failed to create theatre');
            }

            const data = await response.json();

            // Store locally (optional now, but good for defaults)
            await SecureStore.setItemAsync('merchant_theatre_id', data.id.toString());
            await SecureStore.setItemAsync('merchant_theatre_name', data.name);
            await SecureStore.setItemAsync('merchant_theatre_city', data.city);

            setTheatre(data);
            setViewState('add_hall');

            // Clean up form
            setNewTheatreName('');
            setNewTheatreCity('');

        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    const startEditTheatre = (t: any) => {
        setEditingTheatre(t);
        setEditTheatreName(t.name);
        setEditTheatreCity(t.city);
        setViewState('edit_theatre');
    };

    const handleEditTheatre = async () => {
        if (!editTheatreName || !editTheatreCity) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }
        try {
            setLoading(true);
            const token = await SecureStore.getItemAsync('token');
            const response = await fetch(`${endpoints.merchant.theatres}/${editingTheatre.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: editTheatreName,
                    city: editTheatreCity
                })
            });
            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.detail || 'Failed to update theatre');
            }
            Alert.alert('Success', 'Theatre updated successfully!');
            setEditingTheatre(null);
            await fetchTheatres();
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteTheatre = (t: any) => {
        Alert.alert(
            'Delete Cinema',
            `Are you sure you want to delete "${t.name}"? This will also remove all halls, shows, and data associated with it. This action cannot be undone.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setLoading(true);
                            const token = await SecureStore.getItemAsync('token');
                            const response = await fetch(`${endpoints.merchant.theatres}/${t.id}`, {
                                method: 'DELETE',
                                headers: { 'Authorization': `Bearer ${token}` }
                            });
                            if (!response.ok) {
                                const err = await response.json();
                                throw new Error(err.detail || 'Failed to delete theatre');
                            }
                            Alert.alert('Deleted', `"${t.name}" has been removed.`);
                            await fetchTheatres();
                        } catch (error: any) {
                            Alert.alert('Error', error.message);
                        } finally {
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    };

    const handleSaveHall = async () => {
        if (!hallName) {
            Alert.alert('Error', 'Please enter a hall name');
            return;
        }

        try {
            setLoading(true);
            const token = await SecureStore.getItemAsync('token');

            if (!theatre?.id) {
                throw new Error("Theatre ID not found");
            }

            // Create Screen
            const response = await fetch(endpoints.merchant.screens, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    theatre_id: theatre.id,
                    name: hallName,
                    technology: selectedTech,
                    rows: rows,
                    cols: cols,
                    blocked_seats: blockedSeats
                })
            });

            if (!response.ok) {
                const errData = await response.json();

                // If theatre was not found (404), it means our local storage is stale (e.g. after a DB reset)
                if (response.status === 404) {
                    await SecureStore.deleteItemAsync('merchant_theatre_id');
                    await SecureStore.deleteItemAsync('merchant_theatre_name');
                    await SecureStore.deleteItemAsync('merchant_theatre_city');
                    setTheatre(null);
                    setViewState('create_theatre');
                    throw new Error("Your theatre data was reset on the server. Please create your theatre again.");
                }

                throw new Error(errData.detail || "Failed to save screen");
            }

            Alert.alert('Success', 'Theater Hall saved successfully!');

            // Reset Form
            setHallName('');
            setRows(8);
            setCols(10);
            setBlockedSeats([]);
            setSelectedTech('IMAX');

            router.replace('/(tabs)/home'); // Go back to dashboard

        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    const toggleSeat = (seatId: string) => {
        setBlockedSeats(prev =>
            prev.includes(seatId)
                ? prev.filter(id => id !== seatId)
                : [...prev, seatId]
        );
    };

    if (viewState === 'loading') {
        return (
            <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#8A2BE2" />
            </SafeAreaView>
        );
    }

    if (viewState === 'create_theatre') {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Text style={styles.backButton}>{'<'}</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Setup Cinema Profile</Text>
                    <View style={{ width: 24 }} />
                </View>

                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={{ flex: 1 }}
                >
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.content}
                        keyboardShouldPersistTaps="handled"
                    >
                        <Text style={styles.subtext}>First, let's set up your cinema details.</Text>

                        <Text style={styles.label}>Cinema Name</Text>
                        <View style={styles.inputContainer}>
                            <Building2 color="#9CA3AF" size={20} style={{ marginRight: 10 }} />
                            <TextInput
                                style={styles.inputField}
                                placeholder="e.g. Grand Cinema"
                                placeholderTextColor="#4B5563"
                                value={newTheatreName}
                                onChangeText={setNewTheatreName}
                            />
                        </View>

                        <Text style={styles.label}>City</Text>
                        <View style={styles.inputContainer}>
                            <MapPin color="#9CA3AF" size={20} style={{ marginRight: 10 }} />
                            <TextInput
                                style={styles.inputField}
                                placeholder="e.g. Visakhapatnam"
                                placeholderTextColor="#4B5563"
                                value={newTheatreCity}
                                onChangeText={setNewTheatreCity}
                            />
                        </View>

                        <TouchableOpacity style={styles.createButton} onPress={handleCreateTheatre} disabled={loading}>
                            {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveText}>Continue</Text>}
                        </TouchableOpacity>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        );
    }

    if (viewState === 'edit_theatre' && editingTheatre) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => { setEditingTheatre(null); setViewState('list_theatres'); }}>
                        <ChevronLeft size={24} color="#FFF" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Edit Cinema</Text>
                    <View style={{ width: 24 }} />
                </View>

                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={{ flex: 1 }}
                >
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.content}
                        keyboardShouldPersistTaps="handled"
                    >
                        <Text style={styles.subtext}>Update your cinema details below.</Text>

                        <Text style={styles.label}>Cinema Name</Text>
                        <View style={styles.inputContainer}>
                            <Building2 color="#9CA3AF" size={20} style={{ marginRight: 10 }} />
                            <TextInput
                                style={styles.inputField}
                                placeholder="e.g. Grand Cinema"
                                placeholderTextColor="#4B5563"
                                value={editTheatreName}
                                onChangeText={setEditTheatreName}
                            />
                        </View>

                        <Text style={styles.label}>City</Text>
                        <View style={styles.inputContainer}>
                            <MapPin color="#9CA3AF" size={20} style={{ marginRight: 10 }} />
                            <TextInput
                                style={styles.inputField}
                                placeholder="e.g. Visakhapatnam"
                                placeholderTextColor="#4B5563"
                                value={editTheatreCity}
                                onChangeText={setEditTheatreCity}
                            />
                        </View>

                        <TouchableOpacity style={styles.createButton} onPress={handleEditTheatre} disabled={loading}>
                            {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveText}>Save Changes</Text>}
                        </TouchableOpacity>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        );
    }

    if (viewState === 'list_theatres') {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <Text style={[styles.headerTitle, { fontSize: 24 }]}>My Cinemas</Text>
                    <TouchableOpacity style={styles.settingsButton}>
                        <Settings size={24} color="#8A2BE2" />
                    </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    {theatres.map((t, index) => (
                        <View key={index} style={styles.theatreListCard}>
                            <TouchableOpacity
                                style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}
                                onPress={() => {
                                    setTheatre(t);
                                    setViewState('add_hall');
                                }}
                            >
                                <View style={styles.theatreListIcon}>
                                    <Building2 size={24} color="#8A2BE2" />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.theatreListName}>{t.name}</Text>
                                    <Text style={styles.theatreListCity}>{t.city}</Text>
                                </View>
                            </TouchableOpacity>
                            <View style={styles.theatreActions}>
                                <TouchableOpacity style={styles.actionBtn} onPress={() => startEditTheatre(t)}>
                                    <Pencil size={16} color="#A855F7" />
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.actionBtn, styles.deleteBtn]} onPress={() => handleDeleteTheatre(t)}>
                                    <Trash2 size={16} color="#EF4444" />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.addScreenBadge}
                                    onPress={() => {
                                        setTheatre(t);
                                        setViewState('add_hall');
                                    }}
                                >
                                    <Plus size={14} color="#FFF" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))}

                    <TouchableOpacity
                        style={styles.addNewTheatreBtn}
                        onPress={() => setViewState('create_theatre')}
                    >
                        <Plus size={20} color="#8A2BE2" />
                        <Text style={styles.addNewTheatreText}>Add New Cinema</Text>
                    </TouchableOpacity>
                </ScrollView>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Text style={styles.backButton}>{'<'}</Text>
                </TouchableOpacity>
                <View>
                    <Text style={styles.headerTitle}>Add Theater Hall</Text>
                    <Text style={styles.headerSubtitle}>{theatre?.name} • {theatre?.city}</Text>
                </View>
                <TouchableOpacity style={styles.settingsButton}>
                    <Settings size={24} color="#8A2BE2" />
                </TouchableOpacity>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                >

                    <Text style={styles.label}>Hall Name</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. Grand Auditorium"
                        placeholderTextColor="#4B5563"
                        value={hallName}
                        onChangeText={setHallName}
                    />

                    <Text style={styles.label}>Technology</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.techScroll}>
                        {['IMAX', 'Dolby Cinema', 'RealD 3D', '4DX'].map(tech => (
                            <TouchableOpacity
                                key={tech}
                                style={[styles.techChip, selectedTech === tech && styles.activeTechChip]}
                                onPress={() => setSelectedTech(tech)}
                            >
                                <Text style={[styles.techText, selectedTech === tech && styles.activeTechText]}>{tech}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    <View style={styles.dimensionsContainer}>
                        <View style={styles.dimensionBox}>
                            <Text style={styles.dimLabel}>ROWS</Text>
                            <View style={styles.counter}>
                                <TouchableOpacity onPress={() => setRows(Math.max(4, rows - 1))} style={styles.counterBtn}>
                                    <Minus size={16} color="#A855F7" />
                                </TouchableOpacity>
                                <Text style={styles.counterText}>{rows}</Text>
                                <TouchableOpacity onPress={() => setRows(Math.min(20, rows + 1))} style={styles.counterBtn}>
                                    <Plus size={16} color="#A855F7" />
                                </TouchableOpacity>
                            </View>
                        </View>
                        <View style={styles.dimensionBox}>
                            <Text style={styles.dimLabel}>COLS</Text>
                            <View style={styles.counter}>
                                <TouchableOpacity onPress={() => setCols(Math.max(4, cols - 1))} style={styles.counterBtn}>
                                    <Minus size={16} color="#A855F7" />
                                </TouchableOpacity>
                                <Text style={styles.counterText}>{cols}</Text>
                                <TouchableOpacity onPress={() => setCols(Math.min(15, cols + 1))} style={styles.counterBtn}>
                                    <Plus size={16} color="#A855F7" />
                                </TouchableOpacity>
                            </View>
                        </View>
                        <View style={[styles.dimensionBox, { alignItems: 'flex-end', paddingRight: 10 }]}>
                            <Text style={styles.dimLabel}>TOTAL SEATS</Text>
                            <Text style={styles.totalSeats}>{rows * cols}</Text>
                        </View>
                    </View>

                    <Text style={styles.sectionTitle}>Interactive Seat Map</Text>
                    <View style={styles.gridHeader}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <View style={[styles.dot, styles.availableDot]} />
                            <Text style={styles.statusText}>Available</Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <View style={[styles.dot, styles.blockedDot]} />
                            <Text style={styles.statusText}>Maintenance</Text>
                        </View>
                    </View>

                    <SeatGrid
                        rows={rows}
                        cols={cols}
                        blockedSeats={blockedSeats}
                        onToggleSeat={toggleSeat}
                    />

                    <Text style={styles.sectionTitle}>Global Visibility</Text>
                    <View style={styles.visibilityCard}>
                        <View>
                            <Text style={styles.visTitle}>Hall Available</Text>
                            <Text style={styles.visSub}>Visible to customers for booking</Text>
                        </View>
                        <Switch
                            value={isAvailable}
                            onValueChange={setIsAvailable}
                            trackColor={{ false: "#374151", true: "#8A2BE2" }}
                            thumbColor="#FFF"
                        />
                    </View>

                </ScrollView>
            </KeyboardAvoidingView>

            <View style={styles.footer}>
                <TouchableOpacity style={styles.saveButton} onPress={handleSaveHall} disabled={loading}>
                    {loading ? (
                        <ActivityIndicator color="#FFF" />
                    ) : (
                        <>
                            <Save size={20} color="#FFF" style={{ marginRight: 8 }} />
                            <Text style={styles.saveText}>Save Theater</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0B0B15' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20 },
    backButton: { color: '#FFF', fontSize: 24 },
    headerTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
    headerSubtitle: { color: '#9CA3AF', fontSize: 12 },
    settingsButton: { padding: 4, backgroundColor: '#1F1F2E', borderRadius: 8 },
    content: { padding: 20 },
    scrollContent: { padding: 20, paddingBottom: 100 },
    subtext: { color: '#9CA3AF', marginBottom: 32 },
    label: { color: '#9CA3AF', marginBottom: 8, fontSize: 14 },
    inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1F1F2E', borderRadius: 12, paddingHorizontal: 16, marginBottom: 24, borderWidth: 1, borderColor: '#2D2D3F', height: 56 },
    inputField: { flex: 1, color: '#FFF', fontSize: 16 },
    createButton: { backgroundColor: '#8A2BE2', padding: 18, borderRadius: 16, alignItems: 'center', marginTop: 24 },

    input: { backgroundColor: '#1F1F2E', borderRadius: 12, padding: 16, color: '#FFF', marginBottom: 24, borderWidth: 1, borderColor: '#2D2D3F' },
    techScroll: { marginBottom: 24, flexDirection: 'row' },
    techChip: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, backgroundColor: '#1F1F2E', marginRight: 12, borderWidth: 1, borderColor: '#2D2D3F' },
    activeTechChip: { backgroundColor: '#8A2BE2', borderColor: '#8A2BE2' },
    techText: { color: '#FFF', fontWeight: '600' },
    activeTechText: { color: '#FFF' },
    dimensionsContainer: { flexDirection: 'row', gap: 12, marginBottom: 32, backgroundColor: '#1F1F2E', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#2D2D3F' },
    dimensionBox: { flex: 1 },
    dimLabel: { color: '#6B7280', fontSize: 10, marginBottom: 8, letterSpacing: 1 },
    counter: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    counterBtn: { width: 32, height: 32, borderRadius: 8, backgroundColor: '#2D2D3F', alignItems: 'center', justifyContent: 'center' },
    counterText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
    totalSeats: { color: '#A855F7', fontSize: 32, fontWeight: 'bold' },
    sectionTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold', marginBottom: 16, marginTop: 16 },
    gridHeader: { flexDirection: 'row', justifyContent: 'flex-end', gap: 16, marginBottom: 12 },
    dot: { width: 8, height: 8, borderRadius: 4 },
    availableDot: { backgroundColor: '#10B981' },
    blockedDot: { backgroundColor: '#F59E0B' },
    statusText: { color: '#9CA3AF', fontSize: 12 },
    visibilityCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#1F1F2E', padding: 16, borderRadius: 16, marginBottom: 24, borderWidth: 1, borderColor: '#2D2D3F' },
    visTitle: { color: '#FFF', fontSize: 16, fontWeight: '600' },
    visSub: { color: '#9CA3AF', fontSize: 12 },
    footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, backgroundColor: '#0B0B15', borderTopWidth: 1, borderTopColor: '#1F1F2E' },
    saveButton: { backgroundColor: '#8A2BE2', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 16 },
    saveText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },

    // List Theatres Styles
    theatreListCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1F1F2E', padding: 16, borderRadius: 16, marginBottom: 16, borderWidth: 1, borderColor: '#2D2D3F' },
    theatreListIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(138, 43, 226, 0.15)', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
    theatreListName: { color: '#FFF', fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
    theatreListCity: { color: '#9CA3AF', fontSize: 14 },
    addScreenBadge: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#8A2BE2', width: 32, height: 32, borderRadius: 8 },
    addNewTheatreBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#8A2BE2', borderStyle: 'dashed', marginTop: 8 },
    addNewTheatreText: { color: '#8A2BE2', fontSize: 16, fontWeight: 'bold', marginLeft: 8 },
    theatreActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    actionBtn: { width: 32, height: 32, borderRadius: 8, backgroundColor: 'rgba(168, 85, 247, 0.1)', alignItems: 'center', justifyContent: 'center' },
    deleteBtn: { backgroundColor: 'rgba(239, 68, 68, 0.1)' },
});
