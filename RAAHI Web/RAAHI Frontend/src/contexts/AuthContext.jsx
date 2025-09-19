import React, { createContext, useContext, useState, useEffect } from 'react';
import apiService from '../services/api';
import { auth } from '../firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendEmailVerification
} from 'firebase/auth';

// Create the Auth Context
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [firebaseUser, setFirebaseUser] = useState(null);

  // Initialize authentication state on app load
  useEffect(() => {
    initializeAuth();
    
    // Set up Firebase auth state listener
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setFirebaseUser(firebaseUser);
      if (firebaseUser) {
        // Firebase user is signed in
        handleFirebaseAuthChange(firebaseUser);
      } else {
        // Firebase user is signed out
        if (isAuthenticated) {
          clearAuth();
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const handleFirebaseAuthChange = async (firebaseUser) => {
    try {
      // Get Firebase ID token
      const idToken = await firebaseUser.getIdToken();
      
      // Verify with our backend
      const response = await apiService.auth.verifyFirebaseToken({ firebaseToken: idToken });
      
      if (response.success && response.token) {
        // Store backend JWT token and user data
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        setUser(response.data.user);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Firebase auth change error:', error);
      // If backend verification fails, sign out from Firebase
      await signOut(auth);
      clearAuth();
    } finally {
      setIsLoading(false);
    }
  };

  const initializeAuth = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const savedUser = localStorage.getItem('user');

      if (token && savedUser) {
        // Verify token is still valid
        try {
          const userData = await apiService.users.getProfile();
          setUser(userData);
          setIsAuthenticated(true);
        } catch (error) {
          // Token is invalid, clear storage
          clearAuth();
        }
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      clearAuth();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      setIsLoading(true);
      const { email, password } = credentials;
      
      // Sign in with Firebase
      const firebaseCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = firebaseCredential.user;
      
      // Check if email is verified
      if (!firebaseUser.emailVerified) {
        await signOut(auth);
        return { 
          success: false, 
          error: 'Please verify your email address before logging in. Check your inbox for the verification link.' 
        };
      }
      
      // Firebase auth state change will handle the rest
      return { success: true, message: 'Login successful' };
      
    } catch (error) {
      console.error('Login error:', error);
      
      let errorMessage = 'Login failed';
      
      if (error.code) {
        // Firebase error codes
        switch (error.code) {
          case 'auth/user-not-found':
          case 'auth/wrong-password':
          case 'auth/invalid-credential':
            errorMessage = 'Invalid email or password';
            break;
          case 'auth/too-many-requests':
            errorMessage = 'Too many failed attempts. Please try again later';
            break;
          case 'auth/user-disabled':
            errorMessage = 'This account has been disabled';
            break;
          default:
            errorMessage = error.message;
        }
      }
      
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setIsLoading(true);
      
      const { email, password, fullName, ...otherData } = userData;
      
      // Step 1: Create Firebase user
      const firebaseCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = firebaseCredential.user;
      
      // Step 2: Update Firebase user profile
      await updateProfile(firebaseUser, {
        displayName: fullName
      });
      
      // Step 3: Send email verification
      await sendEmailVerification(firebaseUser);
      
      // Step 4: Register with backend
      // Parse fullName into firstName and lastName
      const nameParts = fullName.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      const backendData = {
        email,
        password,
        username: email.split('@')[0], // Use email prefix as username
        firstName,
        lastName,
        ...otherData
      };
      
      const response = await apiService.auth.register(backendData);
      
      if (response.success) {
        // Backend registration successful - Firebase auth state change will handle the rest
        console.log('✅ Registration successful');
        return { success: true, user: response.data.user, requiresVerification: true };
      } else {
        // Backend registration failed, cleanup Firebase user
        await firebaseUser.delete();
        throw new Error(response.error || 'Backend registration failed');
      }
      
    } catch (error) {
      console.error('Registration error:', error);
      
      let errorMessage = 'Registration failed';
      
      if (error.code) {
        // Firebase error codes
        switch (error.code) {
          case 'auth/email-already-in-use':
            errorMessage = 'This email is already registered';
            break;
          case 'auth/weak-password':
            errorMessage = 'Password is too weak. Please use at least 6 characters';
            break;
          case 'auth/invalid-email':
            errorMessage = 'Invalid email address';
            break;
          default:
            errorMessage = error.message;
        }
      } else {
        errorMessage = error.response?.data?.error || error.message || errorMessage;
      }
      
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Sign out from Firebase (this will trigger the auth state change)
      await signOut(auth);
      
      // Try to call backend logout endpoint
      try {
        await apiService.auth.logout();
      } catch (error) {
        console.error('Backend logout error:', error);
        // Continue with logout even if backend call fails
      }
      
    } catch (error) {
      console.error('Logout error:', error);
      // Force clear auth state even if Firebase signOut fails
      clearAuth();
    }
  };

  const clearAuth = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const refreshToken = async () => {
    try {
      const response = await apiService.auth.refreshToken();
      if (response.token) {
        localStorage.setItem('authToken', response.token);
        return true;
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      clearAuth();
      return false;
    }
  };

  const forgotPassword = async (email) => {
    try {
      setIsLoading(true);
      const response = await apiService.auth.forgotPassword(email);
      return { success: true, message: response.message };
    } catch (error) {
      console.error('Forgot password error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Password reset failed';
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (token, newPassword) => {
    try {
      setIsLoading(true);
      const response = await apiService.auth.resetPassword(token, newPassword);
      return { success: true, message: response.message };
    } catch (error) {
      console.error('Reset password error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Password reset failed';
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  // Context value
  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    updateUser,
    refreshToken,
    forgotPassword,
    resetPassword,
    clearAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;