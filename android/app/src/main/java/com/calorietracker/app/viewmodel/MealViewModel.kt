package com.calorietracker.app.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.calorietracker.app.data.models.AiFoodResponse
import com.calorietracker.app.data.models.DashboardResponse
import com.calorietracker.app.data.models.Meal
import com.calorietracker.app.data.repository.MealRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import java.io.File

sealed class UiState<out T> {
    object Idle : UiState<Nothing>()
    object Loading : UiState<Nothing>()
    data class Success<T>(val data: T) : UiState<T>()
    data class Error(val message: String) : UiState<Nothing>()
}

class MealViewModel(private val repository: MealRepository) : ViewModel() {

    private val _dashboard = MutableStateFlow<UiState<DashboardResponse>>(UiState.Idle)
    val dashboard: StateFlow<UiState<DashboardResponse>> = _dashboard.asStateFlow()

    private val _meals = MutableStateFlow<UiState<List<Meal>>>(UiState.Idle)
    val meals: StateFlow<UiState<List<Meal>>> = _meals.asStateFlow()

    private val _aiResult = MutableStateFlow<UiState<AiFoodResponse>>(UiState.Idle)
    val aiResult: StateFlow<UiState<AiFoodResponse>> = _aiResult.asStateFlow()

    private val _saveMeal = MutableStateFlow<UiState<Unit>>(UiState.Idle)
    val saveMeal: StateFlow<UiState<Unit>> = _saveMeal.asStateFlow()

    fun loadDashboard() {
        viewModelScope.launch {
            _dashboard.value = UiState.Loading
            repository.getDashboard()
                .onSuccess { _dashboard.value = UiState.Success(it) }
                .onFailure { _dashboard.value = UiState.Error(it.message ?: "Failed") }
        }
    }

    fun loadMeals(startDate: String? = null, endDate: String? = null) {
        viewModelScope.launch {
            _meals.value = UiState.Loading
            repository.getMeals(startDate, endDate)
                .onSuccess { _meals.value = UiState.Success(it.meals) }
                .onFailure { _meals.value = UiState.Error(it.message ?: "Failed") }
        }
    }

    fun analyzeFood(imageFile: File) {
        viewModelScope.launch {
            _aiResult.value = UiState.Loading
            repository.analyzeFood(imageFile)
                .onSuccess { _aiResult.value = UiState.Success(it) }
                .onFailure { _aiResult.value = UiState.Error(it.message ?: "Analysis failed") }
        }
    }

    fun saveMeal(
        title: String,
        calories: Int,
        date: String,
        notes: String? = null,
        aiDetected: Boolean = false,
        aiConfidence: Double? = null
    ) {
        viewModelScope.launch {
            _saveMeal.value = UiState.Loading
            repository.createMeal(title, calories, date, notes, aiDetected, aiConfidence)
                .onSuccess { _saveMeal.value = UiState.Success(Unit) }
                .onFailure { _saveMeal.value = UiState.Error(it.message ?: "Save failed") }
        }
    }

    fun deleteMeal(id: String) {
        viewModelScope.launch {
            repository.deleteMeal(id).onSuccess {
                // Refresh dashboard after deletion
                loadDashboard()
            }
        }
    }

    fun resetAiResult() { _aiResult.value = UiState.Idle }
    fun resetSaveMeal() { _saveMeal.value = UiState.Idle }

    class Factory(private val repository: MealRepository) : ViewModelProvider.Factory {
        @Suppress("UNCHECKED_CAST")
        override fun <T : ViewModel> create(modelClass: Class<T>): T =
            MealViewModel(repository) as T
    }
}
