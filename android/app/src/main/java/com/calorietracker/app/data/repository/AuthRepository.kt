package com.calorietracker.app.data.repository

import com.calorietracker.app.data.local.TokenManager
import com.calorietracker.app.data.models.AuthResponse
import com.calorietracker.app.data.models.LoginRequest
import com.calorietracker.app.data.models.RegisterRequest
import com.calorietracker.app.network.RetrofitClient

class AuthRepository(private val tokenManager: TokenManager) {

    private val api = RetrofitClient.apiService

    suspend fun register(name: String, email: String, password: String, calorieGoal: Int): Result<AuthResponse> {
        return runCatching {
            val response = api.register(RegisterRequest(name, email, password, calorieGoal))
            if (response.isSuccessful) {
                val body = response.body()!!
                saveSession(body)
                body
            } else {
                throw Exception(response.errorBody()?.string() ?: "Registration failed")
            }
        }
    }

    suspend fun login(email: String, password: String): Result<AuthResponse> {
        return runCatching {
            val response = api.login(LoginRequest(email, password))
            if (response.isSuccessful) {
                val body = response.body()!!
                saveSession(body)
                body
            } else {
                throw Exception(response.errorBody()?.string() ?: "Login failed")
            }
        }
    }

    private suspend fun saveSession(auth: AuthResponse) {
        RetrofitClient.setToken(auth.token)
        tokenManager.saveAuthData(
            token = auth.token,
            userId = auth.user.id,
            name = auth.user.name,
            email = auth.user.email,
            calorieGoal = auth.user.calorieGoal
        )
    }

    suspend fun logout() {
        RetrofitClient.setToken(null)
        tokenManager.clearAll()
    }
}
