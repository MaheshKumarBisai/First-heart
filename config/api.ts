import Constants from 'expo-constants';

// Use environment variable for API URL
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';

export const endpoints = {
    requestOtp: `${API_URL}/auth/request-otp`,
    verifyOtp: `${API_URL}/auth/verify-otp`,
    loginPassword: `${API_URL}/auth/login-password`,
    setPassword: `${API_URL}/auth/set-password`,
    locations: `${API_URL}/locations`,
    theatres: `${API_URL}/theatres`,
    movies: `${API_URL}/movies`,
    bookings: `${API_URL}/booking`,
    myBookings: `${API_URL}/booking/my-bookings`,
    profile: `${API_URL}/auth/me`,
    uploadAvatar: `${API_URL}/users/upload-avatar`,
    shows: `${API_URL}/shows`,
    seats: `${API_URL}/seats`,
    notifications: `${API_URL}/notifications`,
    merchant: {
        stats: `${API_URL}/merchant/dashboard/stats`,
        theatres: `${API_URL}/merchant/theatres`,
        screens: `${API_URL}/merchant/screens`,
        shows: `${API_URL}/merchant/shows`,
        movies: `${API_URL}/merchant/movies`,
        batchShows: `${API_URL}/merchant/shows/batch`,
        checkIn: `${API_URL}/merchant/bookings/check-in`,
    },
    uploadImage: `${API_URL}/upload/image`,
    firebaseVerify: `${API_URL}/auth/firebase-verify`,
};
