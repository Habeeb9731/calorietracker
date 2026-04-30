package com.calorietracker.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.viewModels
import androidx.navigation.compose.rememberNavController
import com.calorietracker.app.navigation.AppNavHost
import com.calorietracker.app.ui.theme.CalorieTrackerTheme
import com.calorietracker.app.viewmodel.AuthViewModel
import com.calorietracker.app.viewmodel.MealViewModel

class MainActivity : ComponentActivity() {

    private val app get() = application as CalorieTrackerApp

    private val authViewModel: AuthViewModel by viewModels {
        AuthViewModel.Factory(app.authRepository, app.tokenManager)
    }

    private val mealViewModel: MealViewModel by viewModels {
        MealViewModel.Factory(app.mealRepository)
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            CalorieTrackerTheme {
                val navController = rememberNavController()
                AppNavHost(
                    navController = navController,
                    authViewModel = authViewModel,
                    mealViewModel = mealViewModel
                )
            }
        }
    }
}
