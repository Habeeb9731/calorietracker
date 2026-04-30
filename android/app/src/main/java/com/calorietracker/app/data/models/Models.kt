package com.calorietracker.app.data.models

import com.google.gson.annotations.SerializedName

// ── Auth ──────────────────────────────────────────────────────────────────────

data class RegisterRequest(
    val name: String,
    val email: String,
    val password: String,
    val calorieGoal: Int = 2000
)

data class LoginRequest(
    val email: String,
    val password: String
)

data class AuthUser(
    val id: String,
    val name: String,
    val email: String,
    val calorieGoal: Int
)

data class AuthResponse(
    val message: String,
    val token: String,
    val user: AuthUser
)

// ── Meals ─────────────────────────────────────────────────────────────────────

data class Meal(
    @SerializedName("_id") val id: String,
    val title: String,
    val calories: Int,
    val date: String,
    val notes: String? = null,
    val imageUrl: String? = null,
    val aiDetected: Boolean = false,
    val aiConfidence: Double? = null
)

data class CreateMealRequest(
    val title: String,
    val calories: Int,
    val date: String,
    val notes: String? = null,
    val aiDetected: Boolean = false,
    val aiConfidence: Double? = null
)

data class MealsResponse(
    val meals: List<Meal>,
    val total: Int,
    val page: Int,
    val limit: Int
)

data class DeleteResponse(val message: String)

// ── Dashboard ─────────────────────────────────────────────────────────────────

data class WeeklyDataPoint(
    val date: String,
    val calories: Int
)

data class DashboardResponse(
    val dailyTotal: Int,
    val dailyMeals: List<Meal>,
    val weeklyData: List<WeeklyDataPoint>,
    val calorieGoal: Int
)

// ── AI Food Detection ─────────────────────────────────────────────────────────

data class AiFoodResponse(
    val foodName: String,
    val calories: Int,
    val confidence: Double,
    val description: String
)

// ── Update Goal ───────────────────────────────────────────────────────────────

data class UpdateGoalRequest(val calorieGoal: Int)
data class UpdateGoalResponse(val message: String, val calorieGoal: Int)
