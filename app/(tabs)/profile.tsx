import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Modal, TextInput, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import {
    User,
    Mail,
    Phone,
    Settings,
    Bell,
    Shield,
    ChevronRight,
    LogOut,
    Building2,
    BarChart3,
    HelpCircle,
    LucideIcon,
    Edit2,
    X,
    Check
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { useProfile } from '../../hooks/useProfile';
import { endpoints } from '../../config/api';

interface ProfileItemProps {
    icon: LucideIcon;
    label: string;
    value?: string;
    onPress?: () => void;
    isLast?: boolean;
    color?: string;
}

interface SectionHeaderProps {
    title: string;
}

const { width, height } = Dimensions.get('window');

export default function ProfileScreen() {
    const router = useRouter();
    const { profile, loading, updating, error, refetch, updateProfile } = useProfile();

    // Edit Modal State
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editData, setEditData] = useState({
        name: '',
        email: '',
        mobile: '',
        avatar_url: ''
    });
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);

    const handleLogout = async () => {
        await SecureStore.deleteItemAsync('token');
        await SecureStore.deleteItemAsync('user_role');
        // @ts-ignore - Expo router path type conflict
        router.replace('/auth');
    };

    const openEditModal = () => {
        setEditData({
            name: profile?.name || '',
            email: profile?.email || '',
            mobile: profile?.mobile || '',
            avatar_url: profile?.avatar_url || ''
        });
        setSelectedImage(null);
        setEditModalVisible(true);
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            setSelectedImage(result.assets[0].uri);
        }
    };

    const takePhoto = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'Camera permission is required to take photos');
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            setSelectedImage(result.assets[0].uri);
        }
    };

    const uploadImage = async (uri: string) => {
        setUploading(true);
        try {
            const formData = new FormData();
            const filename = uri.split('/').pop() || 'photo.jpg';
            const match = /\.(\w+)$/.exec(filename);
            let type = 'image/jpeg';
            if (match) {
                const ext = match[1].toLowerCase();
                type = ext === 'jpg' ? 'image/jpeg' : `image/${ext}`;
            }

            // @ts-ignore
            formData.append('file', { uri, name: filename, type });
            formData.append('folder', 'profiles/merchants');

            const token = await SecureStore.getItemAsync('token');
            const response = await fetch(endpoints.uploadImage, {
                method: 'POST',
                body: formData,
                headers: {
                    'Authorization': `Bearer ${token}`
                },
            });

            if (!response.ok) throw new Error('Failed to upload image');

            const data = await response.json();
            return data.url;
        } catch (err) {
            console.error('Upload Error:', err);
            throw err;
        } finally {
            setUploading(false);
        }
    };

    const handleSaveProfile = async () => {
        try {
            let finalAvatarUrl = editData.avatar_url;

            if (selectedImage) {
                finalAvatarUrl = await uploadImage(selectedImage);
            }

            await updateProfile({
                name: editData.name,
                email: editData.email,
                mobile: editData.mobile,
                avatar_url: finalAvatarUrl
            });
            setEditModalVisible(false);
            Alert.alert('Success', 'Profile updated successfully!');
        } catch (err: any) {
            Alert.alert('Error', err.message || 'Failed to update profile');
        }
    };

    const ProfileItem = ({ icon: Icon, label, value, onPress, isLast, color = "#FFF" }: ProfileItemProps) => (
        <TouchableOpacity
            style={[styles.profileItem, isLast && styles.noBorder]}
            onPress={onPress}
            disabled={!onPress}
        >
            <View style={styles.itemLeft}>
                <View style={[styles.iconContainer, { backgroundColor: color + '15' }]}>
                    <Icon size={20} color={color} />
                </View>
                <View>
                    <Text style={styles.itemLabel}>{label}</Text>
                    {value && <Text style={styles.itemValue}>{value}</Text>}
                </View>
            </View>
            {onPress && <ChevronRight size={20} color="#4B5563" />}
        </TouchableOpacity>
    );

    const SectionHeader = ({ title }: SectionHeaderProps) => (
        <Text style={styles.sectionHeader}>{title}</Text>
    );

    if (loading && !profile) {
        return (
            <View style={[styles.container, styles.center]}>
                <ActivityIndicator size="large" color="#8A2BE2" />
            </View>
        );
    }

    const getAvatarUri = (url: string | null | undefined) => {
        if (!url) return 'https://ui-avatars.com/api/?name=M&background=1F1F2E&color=8A2BE2&size=200';
        if (url.startsWith('http') || url.startsWith('file') || url.startsWith('content') || url.startsWith('ph://') || url.startsWith('assets-library://')) {
            return url;
        }
        // Prepend base API URL if it's a relative path (starts with /)
        if (url.startsWith('/')) {
            const baseUrl = endpoints.uploadAvatar.split('/users/upload-avatar')[0];
            return `${baseUrl}${url}`;
        }
        return url;
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Header Profile Section */}
                <View style={styles.header}>
                    <View style={styles.avatarWrapper}>
                        <LinearGradient
                            colors={['#8A2BE2', '#4B0082']}
                            style={styles.avatarGradient}
                        >
                            <Image
                                source={{ uri: getAvatarUri(profile?.avatar_url) }}
                                style={styles.avatarImage}
                            />
                        </LinearGradient>
                        <TouchableOpacity style={styles.editAvatarBtn} onPress={openEditModal}>
                            <Edit2 size={14} color="#FFF" />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.userName}>{profile?.name || profile?.email || 'Merchant'}</Text>
                </View>

                {/* Personal Info Section */}
                <View style={styles.sectionRow}>
                    <SectionHeader title="PERSONAL INFO" />
                </View>
                <View style={styles.sectionCard}>
                    <ProfileItem
                        icon={User}
                        label="Full Name"
                        value={profile?.name || 'Not Set'}
                        color="#8A2BE2"
                    />
                    <ProfileItem
                        icon={Mail}
                        label="Email Address"
                        value={profile?.email || 'Not Set'}
                        color="#3B82F6"
                    />
                    <ProfileItem
                        icon={Phone}
                        label="Phone Number"
                        value={profile?.mobile || 'Not Set'}
                        color="#10B981"
                        isLast
                    />
                </View>

                {/* Business Management */}
                <SectionHeader title="BUSINESS MANAGEMENT" />
                <View style={styles.sectionCard}>
                    <ProfileItem
                        icon={Building2}
                        label="Theatre Settings"
                        onPress={() => router.push('/cinema')}
                        color="#F59E0B"
                    />
                    <ProfileItem
                        icon={BarChart3}
                        label="Revenue Analytics"
                        onPress={() => router.push('/home')}
                        color="#6366F1"
                        isLast
                    />
                </View>


                {/* Logout Button */}
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <LogOut size={20} color="#FFF" style={{ marginRight: 10 }} />
                    <Text style={styles.logoutText}>Log Out Account</Text>
                </TouchableOpacity>

                <Text style={styles.versionText}>Version 1.2.0 • Build 42</Text>
            </ScrollView >

            {/* Edit Profile Modal */}
            <Modal
                visible={editModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setEditModalVisible(false)}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.modalOverlay}
                >
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Edit Profile</Text>
                            <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                                <X size={24} color="#9CA3AF" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            <View style={styles.modalBody}>
                                <Text style={styles.inputLabel}>FULL NAME</Text>
                                <TextInput
                                    style={styles.input}
                                    value={editData.name}
                                    onChangeText={(t) => setEditData({ ...editData, name: t })}
                                    placeholder="Enter your name"
                                    placeholderTextColor="#4B5563"
                                />

                                <Text style={styles.inputLabel}>EMAIL ADDRESS</Text>
                                <TextInput
                                    style={styles.input}
                                    value={editData.email}
                                    onChangeText={(t) => setEditData({ ...editData, email: t })}
                                    placeholder="Enter your email"
                                    placeholderTextColor="#4B5563"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />

                                <Text style={styles.inputLabel}>MOBILE NUMBER</Text>
                                <TextInput
                                    style={styles.input}
                                    value={editData.mobile}
                                    onChangeText={(t) => setEditData({ ...editData, mobile: t })}
                                    placeholder="Enter mobile number"
                                    placeholderTextColor="#4B5563"
                                    keyboardType="phone-pad"
                                />

                                <Text style={styles.inputLabel}>PROFILE PHOTO</Text>
                                <View style={styles.photoSelectionContainer}>
                                    <Image
                                        source={{ uri: getAvatarUri(selectedImage || profile?.avatar_url) }}
                                        style={styles.previewImage}
                                    />
                                    <View style={styles.photoButtons}>
                                        <TouchableOpacity style={styles.photoBtn} onPress={pickImage}>
                                            <Text style={styles.photoBtnText}>Gallery</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={styles.photoBtn} onPress={takePhoto}>
                                            <Text style={styles.photoBtnText}>Camera</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>

                            <View style={styles.modalFooter}>
                                <TouchableOpacity
                                    style={styles.cancelBtn}
                                    onPress={() => setEditModalVisible(false)}
                                >
                                    <Text style={styles.cancelBtnText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.saveBtn}
                                    onPress={handleSaveProfile}
                                    disabled={updating || uploading}
                                >
                                    {updating || uploading ? (
                                        <ActivityIndicator size="small" color="#FFF" />
                                    ) : (
                                        <>
                                            <Check size={20} color="#FFF" style={{ marginRight: 8 }} />
                                            <Text style={styles.saveBtnText}>Save Changes</Text>
                                        </>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0B0B15' },
    center: { justifyContent: 'center', alignItems: 'center' },
    scrollContent: { paddingHorizontal: width * 0.05, paddingVertical: 20, paddingBottom: 40 },
    header: {
        alignItems: 'center',
        marginBottom: 32,
        marginTop: 10,
    },
    avatarWrapper: {
        position: 'relative',
        marginBottom: 16,
    },
    avatarGradient: {
        width: 100,
        height: 100,
        borderRadius: 50,
        padding: 3,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarImage: {
        width: 94,
        height: 94,
        borderRadius: 47,
        borderWidth: 3,
        borderColor: '#0B0B15',
    },
    // New Styles
    photoSelectionContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
        backgroundColor: '#0B0B15',
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#2D2D3F',
    },
    previewImage: {
        width: 60,
        height: 60,
        borderRadius: 30,
        borderWidth: 2,
        borderColor: '#8A2BE2',
    },
    photoButtons: {
        flex: 1,
        flexDirection: 'row',
        gap: 10,
    },
    photoBtn: {
        flex: 1,
        height: 40,
        backgroundColor: '#2D2D3F',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#4B5563',
    },
    photoBtnText: {
        color: '#FFF',
        fontSize: 13,
        fontWeight: '600',
    },
    editAvatarBtn: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#8A2BE2',
        width: 30,
        height: 30,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#0B0B15',
    },
    userName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFF',
        marginBottom: 4,
    },
    userRole: {
        fontSize: 14,
        color: '#9CA3AF',
        fontWeight: '500',
    },
    sectionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    editText: {
        fontSize: 14,
        color: '#8A2BE2',
        fontWeight: '600',
    },
    sectionHeader: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#6B7280',
        letterSpacing: 1,
        marginBottom: 8,
        marginLeft: 4,
    },
    sectionCard: {
        backgroundColor: '#1F1F2E',
        borderRadius: 16,
        marginBottom: 24,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#2D2D3F',
    },
    profileItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#2D2D3F',
    },
    noBorder: {
        borderBottomWidth: 0,
    },
    itemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    itemLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFF',
    },
    itemValue: {
        fontSize: 13,
        color: '#9CA3AF',
        marginTop: 2,
    },
    logoutButton: {
        flexDirection: 'row',
        backgroundColor: '#EF444420',
        borderWidth: 1,
        borderColor: '#EF4444',
        borderRadius: 16,
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8,
    },
    logoutText: {
        color: '#EF4444',
        fontSize: 16,
        fontWeight: 'bold',
    },
    versionText: {
        textAlign: 'center',
        color: '#4B5563',
        fontSize: 12,
        marginTop: 32,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#1F1F2E',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        padding: 24,
        maxHeight: '90%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFF',
    },
    modalBody: {
        gap: 15,
    },
    inputLabel: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#6B7280',
        letterSpacing: 1,
        marginBottom: 4,
    },
    input: {
        backgroundColor: '#0B0B15',
        borderRadius: 12,
        height: 54,
        paddingHorizontal: 16,
        color: '#FFF',
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#2D2D3F',
    },
    modalFooter: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 24,
        paddingBottom: Platform.OS === 'ios' ? 20 : 10,
    },
    cancelBtn: {
        flex: 1,
        height: 54,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#2D2D3F',
    },
    cancelBtnText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
    },
    saveBtn: {
        flex: 2,
        height: 54,
        borderRadius: 16,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#8A2BE2',
    },
    saveBtnText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    }
});
