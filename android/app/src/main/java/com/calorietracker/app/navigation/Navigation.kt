package com.calorietracker.app.navigation

import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import com.calorietracker.app.ui.screens.*
import com.calorietracker.app.viewmodel.AuthViewModel
import com.calorietracker.app.viewmodel.MealViewModel

object Routes {
    const val LOGIN = "login"
    const val REGISTER = "register"
    const val DASHBOARD = "dashboard"
    const val ADD_MEAL = "add_meal"
    const val HISTORY = "history"
    const val CAMERA = "camera"
}

@Composable
fun AppNavHost(
    navController: NavHostController,
    authViewModel: AuthViewModel,
    mealViewModel: MealViewModel
) {
    val isLoggedIn by authViewModel.isLoggedIn.collectAsState()
    val startDestination = if (isLoggedIn) Routes.DASHBOARD else Routes.LOGIN

    NavHost(navController = navController, startDestination = startDestination) {
        composable(Routes.LOGIN) {
            LoginScreen(
                authViewModel = authViewModel,
                onNavigateToRegister = { navController.navigate(Routes.REGISTER) },
                onLoginSuccess = {
                    navController.navigate(Routes.DASHBOARD) {
                        popUpTo(Routes.LOGIN) { inclusive = true }
                    }
                }
            )
        }

        composable(Routes.REGISTER) {
            RegisterScreen(
                authViewModel = authViewModel,
                onNavigateToLogin = { navController.popBackStack() },
                onRegisterSuccess = {
                    navController.navigate(Routes.DASHBOARD) {
                        popUpTo(Routes.REGISTER) { inclusive = true }
                    }
                }
            )
        }

        composable(Routes.DASHBOARD) {
            DashboardScreen(
                mealViewModel = mealViewModel,
                authViewModel = authViewModel,
                onNavigateToAddMeal = { navController.navigate(Routes.ADD_MEAL) },
                onNavigateToHistory = { navController.navigate(Routes.HISTORY) },
                onLogout = {
                    authViewModel.logout()
                    navController.navigate(Routes.LOGIN) {
                        popUpTo(0) { inclusive = true }
                    }
                }
            )
        }

        composable(Routes.ADD_MEAL) {
            AddMealScreen(
                mealViewModel = mealViewModel,
                onNavigateToCamera = { navController.navigate(Routes.CAMERA) },
                onSaved = { navController.popBackStack() },
                onBack = { navController.popBackStack() }
            )
        }

        composable(Routes.HISTORY) {
            HistoryScreen(
                mealViewModel = mealViewModel,
                onBack = { navController.popBackStack() }
            )
        }

        composable(Routes.CAMERA) {
            CameraScreen(
                onImageCaptured = { file ->
                    mealViewModel.analyzeFood(file)
                    navController.popBackStack()
                },
                onBack = { navController.popBackStack() }
            )
        }
    }
}
