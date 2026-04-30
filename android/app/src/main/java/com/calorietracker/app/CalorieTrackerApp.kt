package com.calorietracker.app

import android.app.Application
import com.calorietracker.app.data.local.TokenManager
import com.calorietracker.app.data.repository.AuthRepository
import com.calorietracker.app.data.repository.MealRepository
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch

// Simple manual dependency injection — no Hilt required
class CalorieTrackerApp : Application() {

    lateinit var tokenManager: TokenManager
    lateinit var authRepository: AuthRepository
    val mealRepository: MealRepository by lazy { MealRepository() }

    override fun onCreate() {
        super.onCreate()
        tokenManager = TokenManager(this)
        authRepository = AuthRepository(tokenManager)

        // Restore token for API calls on app startup
        CoroutineScope(Dispatchers.IO).launch {
            val savedToken = tokenManager.token.first()
            if (!savedToken.isNullOrBlank()) {
                com.calorietracker.app.network.RetrofitClient.setToken(savedToken)
            }
        }
    }
}
