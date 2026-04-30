package com.calorietracker.app.data.repository

import com.calorietracker.app.data.models.AiFoodResponse
import com.calorietracker.app.data.models.CreateMealRequest
import com.calorietracker.app.data.models.DashboardResponse
import com.calorietracker.app.data.models.MealsResponse
import com.calorietracker.app.network.RetrofitClient
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.MultipartBody
import okhttp3.RequestBody.Companion.asRequestBody
import java.io.File

class MealRepository {

    private val api = RetrofitClient.apiService

    suspend fun getDashboard(): Result<DashboardResponse> = runCatching {
        val r = api.getDashboard()
        if (r.isSuccessful) r.body()!! else throw Exception("Failed to load dashboard")
    }

    suspend fun getMeals(startDate: String? = null, endDate: String? = null): Result<MealsResponse> = runCatching {
        val r = api.getMeals(startDate = startDate, endDate = endDate, limit = 100)
        if (r.isSuccessful) r.body()!! else throw Exception("Failed to load meals")
    }

    suspend fun createMeal(
        title: String,
        calories: Int,
        date: String,
        notes: String? = null,
        aiDetected: Boolean = false,
        aiConfidence: Double? = null
    ): Result<Unit> = runCatching {
        val r = api.createMeal(
            CreateMealRequest(title, calories, date, notes, aiDetected, aiConfidence)
        )
        if (!r.isSuccessful) throw Exception("Failed to save meal")
    }

    suspend fun deleteMeal(id: String): Result<Unit> = runCatching {
        val r = api.deleteMeal(id)
        if (!r.isSuccessful) throw Exception("Failed to delete meal")
    }

    suspend fun analyzeFood(imageFile: File): Result<AiFoodResponse> = runCatching {
        val requestBody = imageFile.asRequestBody("image/*".toMediaTypeOrNull())
        val part = MultipartBody.Part.createFormData("image", imageFile.name, requestBody)
        val r = api.analyzeFood(part)
        if (r.isSuccessful) r.body()!! else throw Exception("Food analysis failed")
    }
}
