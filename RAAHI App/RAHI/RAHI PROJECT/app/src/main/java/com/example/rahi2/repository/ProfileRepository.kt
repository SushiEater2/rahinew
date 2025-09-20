package com.example.rahi2.repository

import android.content.Context
import android.content.SharedPreferences
import com.example.rahi2.data.User
import com.example.rahi2.data.EmergencyContact
import com.example.rahi2.data.LocationSettings
import com.example.rahi2.data.NotificationSettings
import kotlinx.coroutines.delay

class ProfileRepository(private val context: Context) {

    private val sharedPrefs: SharedPreferences =
        context.getSharedPreferences("raahi_profile", Context.MODE_PRIVATE)

    private val authPrefs: SharedPreferences =
        context.getSharedPreferences("raahi_auth", Context.MODE_PRIVATE)

    suspend fun updateProfile(
        name: String,
        phone: String,
        address: String
    ): Result<User> {
        return try {
            delay(800) // Simulate network call

            val currentUser = getCurrentUser()
            if (currentUser != null) {
                val updatedUser = currentUser.copy(
                    name = name,
                    phone = phone,
                    address = address,
                    updatedAt = System.currentTimeMillis().toString()
                )

                saveUserProfile(updatedUser)
                Result.success(updatedUser)
            } else {
                Result.failure(Exception("User not found"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun updateEmergencyContacts(contacts: List<EmergencyContact>): Result<List<EmergencyContact>> {
        return try {
            delay(600)

            val currentUser = getCurrentUser()
            if (currentUser != null) {
                val updatedUser = currentUser.copy(
                    emergencyContacts = contacts,
                    updatedAt = System.currentTimeMillis().toString()
                )

                saveUserProfile(updatedUser)
                Result.success(contacts)
            } else {
                Result.failure(Exception("User not found"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun updateLocationSettings(settings: LocationSettings): Result<LocationSettings> {
        return try {
            delay(500)

            val currentUser = getCurrentUser()
            if (currentUser != null) {
                val updatedUser = currentUser.copy(
                    locationSettings = settings,
                    updatedAt = System.currentTimeMillis().toString()
                )

                saveUserProfile(updatedUser)
                Result.success(settings)
            } else {
                Result.failure(Exception("User not found"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun updateNotificationSettings(settings: NotificationSettings): Result<NotificationSettings> {
        return try {
            delay(500)

            val currentUser = getCurrentUser()
            if (currentUser != null) {
                val updatedUser = currentUser.copy(
                    notificationSettings = settings,
                    updatedAt = System.currentTimeMillis().toString()
                )

                saveUserProfile(updatedUser)
                Result.success(settings)
            } else {
                Result.failure(Exception("User not found"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    fun getCurrentUser(): User? {
        // Get user data from auth repository (which has the actual login data)
        val authRepository = AuthRepository(context)
        val baseUser = authRepository.getCurrentUser()

        return baseUser?.let { user ->
            // Enhance with profile-specific data from profile prefs
            val savedName = sharedPrefs.getString("user_name", user.name)
            val savedPhone = sharedPrefs.getString("user_phone", user.phone)
            val savedAddress = sharedPrefs.getString("user_address", user.address)

            // Mock emergency contacts for now
            val emergencyContacts = listOf(
                EmergencyContact("Emergency Services", "911", "Emergency"),
                EmergencyContact("Family Member", "+1234567890", "Family")
            )

            user.copy(
                name = savedName ?: user.name,
                phone = savedPhone ?: user.phone,
                address = savedAddress ?: user.address,
                emergencyContacts = emergencyContacts,
                locationSettings = LocationSettings(
                    shareLocation = sharedPrefs.getBoolean("share_location", true),
                    emergencyLocationSharing = sharedPrefs.getBoolean("emergency_location", true)
                ),
                notificationSettings = NotificationSettings(
                    pushNotifications = sharedPrefs.getBoolean("push_notifications", true),
                    emailNotifications = sharedPrefs.getBoolean("email_notifications", false),
                    emergencyAlerts = sharedPrefs.getBoolean("emergency_alerts", true)
                )
            )
        }
    }

    private fun saveUserProfile(user: User) {
        // Save to profile prefs
        sharedPrefs.edit()
            .putString("user_name", user.name)
            .putString("user_email", user.email)
            .putString("user_phone", user.phone)
            .putString("user_address", user.address)
            .putBoolean("share_location", user.locationSettings.shareLocation)
            .putBoolean("emergency_location", user.locationSettings.emergencyLocationSharing)
            .putBoolean("push_notifications", user.notificationSettings.pushNotifications)
            .putBoolean("email_notifications", user.notificationSettings.emailNotifications)
            .putBoolean("emergency_alerts", user.notificationSettings.emergencyAlerts)
            .apply()

        // Also sync back to auth prefs to keep data consistent
        authPrefs.edit()
            .putString("user_name", user.name)
            .putString("user_phone", user.phone)
            .putString("user_address", user.address)
            .apply()
    }

    fun getProfileCompleteness(): Int {
        val user = getCurrentUser() ?: return 0

        var completeness = 0

        if (user.name.isNotBlank()) completeness += 25
        if (user.email.isNotBlank()) completeness += 25
        if (user.phone.isNotBlank()) completeness += 25
        if (user.address.isNotBlank()) completeness += 25

        // Bonus for emergency contacts
        if (user.emergencyContacts.isNotEmpty()) {
            completeness += 20
        }

        return minOf(completeness, 100)
    }
}