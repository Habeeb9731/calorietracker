package com.calorietracker.app.network

import com.calorietracker.app.data.models.*
import okhttp3.MultipartBody
import retrofit2.Response
import retrofit2.http.*

interface ApiService {

    // ── Auth ──────────────────────────────────────────────────────────────────

    @POST("auth/register")
    suspend fun register(@Body request: RegisterRequest): Response<AuthResponse>

    @POST("auth/login")
    suspend fun login(@Body request: LoginRequest): Response<AuthResponse>

    @GET("auth/me")
    suspend fun getMe(): Response<Map<String, AuthUser>>

    @PATCH("auth/update-goal")
    suspend fun updateGoal(@Body request: UpdateGoalRequest): Response<UpdateGoalResponse>

    // ── Meals ─────────────────────────────────────────────────────────────────

    @GET("meals/dashboard")
    suspend fun getDashboard(): Response<DashboardResponse>

    @GET("meals")
    suspend fun getMeals(
        @Query("startDate") startDate: String? = null,
        @Query("endDate") endDate: String? = null,
        @Query("limit") limit: Int = 50,
        @Query("page") page: Int = 1
    ): Response<MealsResponse>

    @POST("meals")
    suspend fun createMeal(@Body request: CreateMealRequest): Response<Map<String, Any>>

    @DELETE("meals/{id}")
    suspend fun deleteMeal(@Path("id") id: String): Response<DeleteResponse>

    // ── AI Food Detection ─────────────────────────────────────────────────────

    @Multipart
    @POST("analyze-food")
    suspend fun analyzeFood(@Part image: MultipartBody.Part): Response<AiFoodResponse>
}
