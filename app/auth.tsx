import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Mail, Lock, Phone, ChevronLeft, Ticket, Eye, EyeOff, Check, Store } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as SecureStore from 'expo-secure-store';

import { ThemedInput } from '../components/ui/ThemedInput';
import { PrimaryButton } from '../components/ui/PrimaryButton';
import { endpoints } from '../config/api';

import { CustomAlert } from '../components/ui/CustomAlert';

type AuthStep = 'EMAIL' | 'OTP' | 'PASSWORD';

const { width } = Dimensions.get('window');

export default function AuthScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const initialMode = params.mode === 'signup' ? 'signup' : 'signin';

    const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>(initialMode);

    // Steps for SignUp/Forgot: EMAIL -> OTP -> PASSWORD
    const [step, setStep] = useState<AuthStep>('EMAIL');

    // Form State
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [authMethod, setAuthMethod] = useState<'otp' | 'password'>('password');

    // Custom Alert State
    const [alertConfig, setAlertConfig] = useState<{
        visible: boolean;
        type: 'success' | 'error' | 'info';
        title: string;
        message: string;
        actionLabel?: string;
        onAction?: () => void;
    }>({
        visible: false,
        type: 'info',
        title: '',
        message: '',
    });

    const showAlert = (type: 'success' | 'error' | 'info', title: string, message: string, actionLabel?: string, onAction?: () => void) => {
        setAlertConfig({ visible: true, type, title, message, actionLabel, onAction });
    };

    const handleAction = async () => {
        if (mode === 'signin') {
            await handleSignIn();
        } else {
            // SIGN UP or FORGOT PASSWORD FLOW
            if (step === 'EMAIL') {
                await requestOtpCall();
            } else if (step === 'OTP') {
                await verifyOtpCall(mode === 'forgot');
            } else if (step === 'PASSWORD') {
                await setPasswordCall();
            }
        }
    };

    const handleSignIn = async () => {
        if (!email || !email.includes('@')) {
            showAlert('error', 'Invalid Email', 'Please enter a valid email address.');
            return;
        }

        setLoading(true);
        try {
            if (authMethod === 'password') {
                if (!password) {
                    showAlert('error', 'Required', 'Please enter your password.');
                    setLoading(false);
                    return;
                }

                const response = await fetch(endpoints.loginPassword, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password, role: 'MERCHANT' }),
                });
                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.detail || 'Login failed');
                }
                await saveSession(data);

            } else {
                if (step === 'EMAIL') {
                    await requestOtpCall();
                } else {
                    if (!otp) {
                        showAlert('error', 'Required', 'Please enter the OTP.');
                        setLoading(false);
                        return;
                    }
                    await verifyOtpCall(false);
                }
            }
        } catch (error: any) {
            showAlert('error', 'Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    const requestOtpCall = async () => {
        if (!email || !email.includes('@')) {
            showAlert('error', 'Invalid Email', 'Please enter a valid email address.');
            return;
        }
        setLoading(true);
        try {
            const response = await fetch(endpoints.requestOtp, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    role: 'MERCHANT',
                    purpose: mode === 'forgot' ? 'RESET' : 'LOGIN'
                }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.detail || 'Failed to send OTP');

            setStep('OTP');
            showAlert('success', 'OTP Sent', 'Please check your email for the verification code.');
        } catch (error: any) {
            console.log('OTP Request Error:', error);
            showAlert('error', 'Error', error.message || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    const verifyOtpCall = async (isReset: boolean) => {
        if (!otp) {
            showAlert('error', 'Error', 'Please enter the OTP.');
            return;
        }
        setLoading(true);
        try {
            const response = await fetch(endpoints.verifyOtp, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    otp: parseInt(otp),
                    role: 'MERCHANT',
                }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.detail || 'Verification failed');

            await SecureStore.setItemAsync('token', data.access_token);
            await SecureStore.setItemAsync('user_role', 'MERCHANT');

            if (isReset) {
                setStep('PASSWORD');
            } else if (mode === 'signup') {
                // FORCE PASSWORD FOR ALL SIGNUPS
                setStep('PASSWORD');
                if (data.is_new_user) {
                    showAlert('success', 'Success', 'You successfully registered. Please enter a password.');
                } else {
                    showAlert('info', 'Note', 'You were already registered. Please update your partner password if desired.');
                }
            } else {
                // Signed in via OTP
                showAlert(
                    'success',
                    'Welcome back Partner!',
                    'You can now set a password for future logins or proceed to your dashboard.',
                    'Set Password',
                    () => setStep('PASSWORD')
                );
            }
        } catch (error: any) {
            showAlert('error', 'Error', error.message || 'Verification failed');
        } finally {
            setLoading(false);
        }
    };

    const setPasswordCall = async () => {
        if (!password || password.length < 6) {
            showAlert('error', 'Weak Password', 'Password must be at least 6 characters.');
            return;
        }
        if (password !== confirmPassword) {
            showAlert('error', 'Mismatch', 'Passwords do not match.');
            return;
        }

        setLoading(true);
        try {
            const token = await SecureStore.getItemAsync('token');
            const response = await fetch(endpoints.setPassword, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ password }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.detail || 'Failed to set password');

            showAlert('success', 'Success', mode === 'forgot' ? 'Partner password reset successful!' : 'Partner account updated!');
            router.replace('/(tabs)/home');
        } catch (error: any) {
            showAlert('error', 'Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    const saveSession = async (data: any) => {
        await SecureStore.setItemAsync('token', data.access_token);
        await SecureStore.setItemAsync('user_role', 'MERCHANT');
        showAlert('success', 'Welcome Partner!', 'Heading to the dashboard...');
        setTimeout(() => router.replace('/(tabs)/home'), 1500);
    };

    const toggleMode = (newMode: 'signin' | 'signup' | 'forgot') => {
        setMode(newMode);
        setStep('EMAIL');
        setOtp('');
        setPassword('');
        setConfirmPassword('');
        setAuthMethod(newMode === 'signin' ? 'password' : 'otp');
    };

    const getButtonTitle = () => {
        if (mode === 'signup' || mode === 'forgot') {
            if (step === 'EMAIL') return 'Get OTP';
            if (step === 'OTP') return 'Verify OTP';
            if (step === 'PASSWORD') return mode === 'forgot' ? 'Reset Password' : 'Set Password & Finish';
        } else {
            if (authMethod === 'password') return 'Sign In';
            if (step === 'EMAIL') return 'Get OTP';
            return 'Verify & Sign In';
        }
        return 'Submit';
    };

    return (
        <View style={styles.container}>
            <StatusBar style="light" />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ChevronLeft color="#FFF" size={28} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Merchant Portal</Text>
                <View style={{ width: 28 }} />
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
                    <View style={styles.logoContainer}>
                        <LinearGradient colors={['#8A2BE2', '#4B0082']} style={styles.logoBackground}>
                            <Store color="#FFF" size={40} />
                        </LinearGradient>
                    </View>

                    <Text style={styles.welcomeTitle}>
                        {mode === 'signin' ? 'Partner Login' : 'Register Cinema'}
                    </Text>

                    <View style={styles.tabContainer}>
                        <TouchableOpacity style={[styles.tab, mode === 'signin' && styles.activeTab]} onPress={() => toggleMode('signin')}>
                            <Text style={[styles.tabText, mode === 'signin' && styles.activeTabText]}>Sign In</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.tab, mode === 'signup' && styles.activeTab]} onPress={() => toggleMode('signup')}>
                            <Text style={[styles.tabText, mode === 'signup' && styles.activeTabText]}>Sign Up</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.formContainer}>
                        {mode === 'forgot' && (
                            <Text style={[styles.label, { color: '#8A2BE2', textAlign: 'center', marginBottom: 20 }]}>
                                Reset Your Password
                            </Text>
                        )}

                        <Text style={styles.label}>Email Address</Text>
                        <ThemedInput
                            icon={Mail}
                            placeholder="Enter email address"
                            keyboardType="email-address"
                            value={email}
                            onChangeText={setEmail}
                            editable={step === 'EMAIL'}
                            style={step !== 'EMAIL' ? { opacity: 0.7 } : {}}
                            autoCapitalize="none"
                        />

                        {mode === 'signin' && authMethod === 'password' && (
                            <>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Text style={styles.label}>Password</Text>
                                    <TouchableOpacity onPress={() => toggleMode('forgot')}>
                                        <Text style={[styles.linkText, { fontSize: 12, marginBottom: 8 }]}>Forgot Password?</Text>
                                    </TouchableOpacity>
                                </View>
                                <ThemedInput
                                    icon={Lock}
                                    placeholder="Enter password"
                                    secureTextEntry={!showPassword}
                                    value={password}
                                    onChangeText={setPassword}
                                    rightIcon={showPassword ? EyeOff : Eye}
                                    onRightIconPress={() => setShowPassword(!showPassword)}
                                />
                                <TouchableOpacity onPress={() => { setAuthMethod('otp'); setStep('EMAIL'); }}>
                                    <Text style={[styles.linkText, { textAlign: 'right', marginBottom: 20 }]}>Login via OTP</Text>
                                </TouchableOpacity>
                            </>
                        )}

                        {mode === 'signin' && authMethod === 'otp' && step === 'OTP' && (
                            <>
                                <Text style={styles.label}>OTP</Text>
                                <ThemedInput
                                    icon={Lock}
                                    placeholder="Enter 6-digit OTP"
                                    keyboardType="number-pad"
                                    value={otp}
                                    onChangeText={setOtp}
                                    maxLength={6}
                                />
                                <TouchableOpacity onPress={() => { setAuthMethod('password'); }}>
                                    <Text style={[styles.linkText, { textAlign: 'right', marginBottom: 20 }]}>Login via Password</Text>
                                </TouchableOpacity>
                            </>
                        )}

                        {mode === 'signin' && authMethod === 'otp' && step === 'EMAIL' && (
                            <TouchableOpacity onPress={() => { setAuthMethod('password'); }}>
                                <Text style={[styles.linkText, { textAlign: 'right', marginBottom: 20 }]}>Login via Password</Text>
                            </TouchableOpacity>
                        )}

                        {(mode === 'signup' || mode === 'forgot') && (
                            <>
                                {step === 'OTP' && (
                                    <>
                                        <Text style={styles.label}>OTP</Text>
                                        <ThemedInput
                                            icon={Lock}
                                            placeholder="Enter 6-digit OTP"
                                            keyboardType="number-pad"
                                            value={otp}
                                            onChangeText={setOtp}
                                            maxLength={6}
                                        />
                                    </>
                                )}
                                {step === 'PASSWORD' && (
                                    <>
                                        <Text style={styles.label}>{mode === 'forgot' ? 'New Password' : 'Set Password'}</Text>
                                        <ThemedInput
                                            icon={Lock}
                                            placeholder={mode === 'forgot' ? 'Enter new password' : 'Create password'}
                                            secureTextEntry={!showPassword}
                                            value={password}
                                            onChangeText={setPassword}
                                            rightIcon={showPassword ? EyeOff : Eye}
                                            onRightIconPress={() => setShowPassword(!showPassword)}
                                        />
                                        <Text style={styles.label}>Confirm {mode === 'forgot' ? 'New Password' : 'Password'}</Text>
                                        <ThemedInput
                                            icon={Check}
                                            placeholder="Confirm password"
                                            secureTextEntry={!showPassword}
                                            value={confirmPassword}
                                            onChangeText={setConfirmPassword}
                                        />
                                    </>
                                )}
                            </>
                        )}

                        <PrimaryButton
                            title={getButtonTitle()}
                            onPress={handleAction}
                            loading={loading}
                        />

                        {mode === 'forgot' && step === 'EMAIL' && (
                            <TouchableOpacity onPress={() => toggleMode('signin')} style={{ marginTop: 16, alignItems: 'center' }}>
                                <Text style={styles.linkText}>Back to Sign In</Text>
                            </TouchableOpacity>
                        )}

                        {step !== 'EMAIL' && step !== 'PASSWORD' && (
                            <TouchableOpacity onPress={() => { setStep('EMAIL'); setOtp(''); }} style={{ marginTop: 16, alignItems: 'center' }}>
                                <Text style={styles.linkText}>Change Email Address?</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            <CustomAlert
                visible={alertConfig.visible}
                type={alertConfig.type}
                title={alertConfig.title}
                message={alertConfig.message}
                actionLabel={alertConfig.actionLabel}
                onAction={() => {
                    setAlertConfig({ ...alertConfig, visible: false });
                    if (alertConfig.onAction) alertConfig.onAction();
                }}
                onClose={() => setAlertConfig({ ...alertConfig, visible: false })}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0B0B15' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20 },
    backButton: { padding: 4 },
    headerTitle: { color: '#FFF', fontSize: 18, fontWeight: '600' },
    scrollContent: { paddingHorizontal: width * 0.06, paddingBottom: 40 },
    logoContainer: { alignItems: 'center', marginTop: 20, marginBottom: 20 },
    logoBackground: { width: 80, height: 80, borderRadius: 24, alignItems: 'center', justifyContent: 'center', shadowColor: '#8A2BE2', shadowOpacity: 0.5, shadowRadius: 20 },
    welcomeTitle: { fontSize: 28, fontWeight: 'bold', color: '#FFF', textAlign: 'center', marginBottom: 24 },
    tabContainer: { flexDirection: 'row', backgroundColor: '#1F1F2E', borderRadius: 16, padding: 4, marginBottom: 32 },
    tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 12 },
    activeTab: { backgroundColor: '#8A2BE2' },
    tabText: { color: '#9CA3AF', fontWeight: '600', fontSize: 16 },
    activeTabText: { color: '#FFF' },
    formContainer: { marginBottom: 32 },
    label: { color: '#E5E7EB', marginBottom: 8, fontSize: 14, fontWeight: '500' },
    linkText: { color: '#A855F7', fontSize: 14, fontWeight: '500' },
    dividerContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
    dividerLine: { flex: 1, height: 1, backgroundColor: '#2D2D3F' },
    dividerText: { color: '#6B7280', paddingHorizontal: 16, fontSize: 12, fontWeight: '600' },
});
