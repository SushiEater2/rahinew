const express = require('express');
const { optionalAuthWithGuest } = require('../middleware/auth');
const admin = require('firebase-admin');
const router = express.Router();

// Get Firebase Admin services (lazy initialization)
const getFirebaseServices = () => {
  try {
    return {
      db: admin.database(),
      firestore: admin.firestore(),
      auth: admin.auth()
    };
  } catch (error) {
    console.error('Firebase services not available:', error.message);
    return null;
  }
};

// Panic button trigger endpoint
router.post('/panic', optionalAuthWithGuest, async (req, res) => {
  try {
    const { email, location, timestamp, userAgent, status, userId } = req.body;
    
    // Validate required data
    if (!location || typeof location.latitude !== 'number' || typeof location.longitude !== 'number') {
      return res.status(400).json({
        success: false,
        message: 'Valid location (latitude, longitude) is required for panic alerts'
      });
    }
    
    // Get Firebase Admin services
    const firebase = getFirebaseServices();
    if (!firebase) {
      return res.status(503).json({
        success: false,
        message: 'Firebase services unavailable'
      });
    }
    
    // Generate user ID if not provided
    const finalUserId = userId || `anonymous_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const alertId = `panic_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Create panic alert data for Firestore (following the structure: users/{uid}/panic_alerts/{alertId})
    const panicAlert = {
      latitude: Number(location.latitude),
      longitude: Number(location.longitude),
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      userId: finalUserId,
      userEmail: email || 'anonymous@guest.com',
      userName: req.user ? `${req.user.firstName} ${req.user.lastName}` : 'Anonymous User',
      status: status || 'active',
      resolved: false,
      userAgent: userAgent || 'Unknown',
      isAnonymous: !req.user || req.user === null,
      alertId: alertId
    };
    
    // Save to Firebase Admin Firestore
    // Structure: users/{userId}/panic_alerts/{alertId}
    const userDocRef = firebase.firestore.collection('users').doc(finalUserId);
    const panicAlertRef = userDocRef.collection('panic_alerts').doc(alertId);
    
    // Ensure user document exists
    await userDocRef.set({
      uid: finalUserId,
      email: panicAlert.userEmail,
      displayName: panicAlert.userName,
      isAnonymous: panicAlert.isAnonymous,
      lastActive: admin.firestore.FieldValue.serverTimestamp(),
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    
    // Save panic alert
    await panicAlertRef.set(panicAlert);
    
    console.log('🚨 PANIC ALERT SAVED TO FIRESTORE:', {
      alertId: alertId,
      userId: finalUserId,
      email: panicAlert.userEmail,
      location: { latitude: panicAlert.latitude, longitude: panicAlert.longitude },
      path: `users/${finalUserId}/panic_alerts/${alertId}`
    });
    
    // You can add additional notifications here:
    // - Send SMS to emergency contacts
    // - Email notifications to admin
    // - Push notifications to emergency services
    
    res.json({
      success: true,
      message: 'Panic alert sent successfully to Firebase Admin',
      alertId: alertId,
      userId: finalUserId,
      location: {
        latitude: panicAlert.latitude,
        longitude: panicAlert.longitude
      },
      timestamp: new Date().toISOString(),
      firestorePath: `users/${finalUserId}/panic_alerts/${alertId}`
    });
    
  } catch (error) {
    console.error('❌ Panic Alert Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process panic alert',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get panic alerts (for admin/emergency services)
router.get('/panic-alerts', optionalAuthWithGuest, async (req, res) => {
  try {
    const { limit = 50, status } = req.query;
    
    // Get Firebase Admin services
    const firebase = getFirebaseServices();
    if (!firebase) {
      return res.status(503).json({
        success: false,
        message: 'Firebase services unavailable'
      });
    }
    
    console.log('📈 Fetching panic alerts from Firestore collection group...');
    
    // Use collection group query to get all panic_alerts from all users
    let query = firebase.firestore.collectionGroup('panic_alerts')
      .orderBy('timestamp', 'desc')
      .limit(parseInt(limit));
    
    // Add status filter if provided
    if (status) {
      query = query.where('status', '==', status);
    }
    
    const snapshot = await query.get();
    const alerts = [];
    
    snapshot.forEach(doc => {
      const data = doc.data();
      // Extract user ID from document path: users/{userId}/panic_alerts/{alertId}
      const pathParts = doc.ref.path.split('/');
      const userId = pathParts[1];
      
      alerts.push({
        id: doc.id,
        userId: userId,
        userEmail: data.userEmail || 'Unknown',
        userName: data.userName || 'Unknown User',
        latitude: data.latitude,
        longitude: data.longitude,
        timestamp: data.timestamp,
        status: data.status || 'active',
        resolved: data.resolved || false,
        isAnonymous: data.isAnonymous || false,
        userAgent: data.userAgent,
        alertId: data.alertId,
        // Format timestamp for easier reading
        timestampFormatted: data.timestamp ? data.timestamp.toDate().toISOString() : new Date().toISOString()
      });
    });
    
    console.log(`✅ Retrieved ${alerts.length} panic alerts from Firestore`);
    
    res.json({
      success: true,
      message: 'Panic alerts retrieved successfully from Firebase Admin',
      alerts: alerts,
      count: alerts.length,
      source: 'Firebase Admin Firestore'
    });
    
  } catch (error) {
    console.error('❌ Get Panic Alerts Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve panic alerts',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Update panic alert status
router.put('/panic-alerts/:id/status', optionalAuthWithGuest, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }
    
    const validStatuses = ['active', 'resolved', 'false_alarm', 'in_progress'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be one of: ' + validStatuses.join(', ')
      });
    }
    
    // Update the panic alert in Firebase
    const db = getFirebaseDB();
    if (!db) {
      return res.status(503).json({
        success: false,
        message: 'Firebase database not available'
      });
    }
    
    const alertRef = db.ref(`panic_alerts/${id}`);
    const snapshot = await alertRef.once('value');
    
    if (!snapshot.exists()) {
      return res.status(404).json({
        success: false,
        message: 'Panic alert not found'
      });
    }
    
    await alertRef.update({
      status: status,
      notes: notes || '',
      updatedAt: new Date().toISOString(),
      updatedBy: req.user ? req.user.email : 'system'
    });
    
    console.log(`📋 Panic alert ${id} status updated to: ${status}`);
    
    res.json({
      success: true,
      message: 'Panic alert status updated successfully',
      alertId: id,
      newStatus: status
    });
    
  } catch (error) {
    console.error('❌ Update Panic Alert Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update panic alert status',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Test endpoint to check Firebase connection
router.get('/test-firebase', (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Firebase connection is working',
      timestamp: new Date().toISOString(),
      databaseURL: admin.app().options.databaseURL || 'Not configured'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Firebase connection failed',
      error: error.message
    });
  }
});

module.exports = router;