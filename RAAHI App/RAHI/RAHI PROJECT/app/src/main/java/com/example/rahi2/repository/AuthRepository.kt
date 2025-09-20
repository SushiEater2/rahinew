package com.example.rahi2.repository

import android.content.Context
import android.content.SharedPreferences
import com.example.rahi2.data.User
import com.example.rahi2.data.LoginRequest
import com.example.rahi2.data.RegisterRequest
import com.example.rahi2.data.AuthResponse
import kotlinx.coroutines.delay

class AuthRepository(private val context: Context) {

    private val sharedPrefs: SharedPreferences =
        context.getSharedPreferences("raahi_auth", Context.MODE_PRIVATE)

    private val tokenKey = "auth_token"
    private val userKey = "current_user"

    // Mock users for testing (replace with actual API calls)
    private val mockUsers = mutableListOf(
        User(
            id = "1",
            name = "John Doe",
            email = "john@example.com",
            phone = "+1234567890",
            address = "123 Main St, City"
        ),
        User(
            id = "2",
            name = "Jane Smith",
            email = "jane@example.com",
            phone = "+1987654321",
            address = "456 Oak Ave, Town"
        )
    )

    suspend fun login(email: String, password: String): Result<AuthResponse> {
        return try {
            // Simulate network delay
            delay(1000)

            // Mock validation - in real app, this would be an API call
            if (email.isNotEmpty() && password.length >= 6) {
                // Create user with the actual email entered by user
                val user = User(
                    id = "user_${System.currentTimeMillis()}",
                    name = extractNameFromEmail(email), // Extract name from email
                    email = email, // Use actual email from login
                    phone = "+1234567890",
                    address = "123 Main St, City",
                    createdAt = System.currentTimeMillis().toString()
                )

                val token = "mock_jwt_token_${System.currentTimeMillis()}"
                val authResponse = AuthResponse(token = token, user = user)

                // Save token and user locally
                saveAuthToken(token)
                saveCurrentUser(user)

                Result.success(authResponse)
            } else {
                Result.failure(Exception("Invalid credentials"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun register(
        name: String,
        email: String,
        password: String,
        phone: String,
        address: String
    ): Result<AuthResponse> {
        return try {
            // Simulate network delay
            delay(1500)

            // Mock validation
            if (name.isNotEmpty() && email.isNotEmpty() && password.length >= 6) {
                val newUser = User(
                    id = "user_${System.currentTimeMillis()}",
                    name = name, // Use actual name from registration
                    email = email, // Use actual email from registration
                    phone = phone, // Use actual phone from registration
                    address = address, // Use actual address from registration
                    createdAt = System.currentTimeMillis().toString()
                )

                val token = "mock_jwt_token_${System.currentTimeMillis()}"
                val authResponse = AuthResponse(token = token, user = newUser)

                // Save token and user locally
                saveAuthToken(token)
                saveCurrentUser(newUser)

                Result.success(authResponse)
            } else {
                Result.failure(Exception("Invalid registration data"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    fun logout() {
        clearAuthToken()
        clearCurrentUser()
    }

    fun isAuthenticated(): Boolean {
        return getAuthToken() != null
    }

    fun getCurrentUser(): User? {
        // Get the stored user data
        val userId = sharedPrefs.getString(userKey, null)
        val userEmail = sharedPrefs.getString("user_email", null)
        val userName = sharedPrefs.getString("user_name", null)
        val userPhone = sharedPrefs.getString("user_phone", null)
        val userAddress = sharedPrefs.getString("user_address", null)

        return if (userId != null && userEmail != null) {
            User(
                id = userId,
                name = userName ?: extractNameFromEmail(userEmail),
                email = userEmail,
                phone = userPhone ?: "",
                address = userAddress ?: "",
                createdAt = System.currentTimeMillis().toString()
            )
        } else {
            null
        }
    }

    private fun saveAuthToken(token: String) {
        sharedPrefs.edit()
            .putString(tokenKey, token)
            .apply()
    }

    private fun getAuthToken(): String? {
        return sharedPrefs.getString(tokenKey, null)
    }

    private fun clearAuthToken() {
        sharedPrefs.edit()
            .remove(tokenKey)
            .apply()
    }

    private fun saveCurrentUser(user: User) {
        sharedPrefs.edit()
            .putString(userKey, user.id)
            .putString("user_email", user.email)
            .putString("user_name", user.name)
            .putString("user_phone", user.phone)
            .putString("user_address", user.address)
            .apply()
    }

    private fun clearCurrentUser() {
        sharedPrefs.edit()
            .remove(userKey)
            .remove("user_email")
            .remove("user_name")
            .remove("user_phone")
            .remove("user_address")
            .apply()
    }

    // Helper function to extract name from email
    private fun extractNameFromEmail(email: String): String {
        return email.substringBefore("@")
            .split(".", "_", "-")
            .joinToString(" ") { it.replaceFirstChar { char -> char.uppercase() } }
    }
}