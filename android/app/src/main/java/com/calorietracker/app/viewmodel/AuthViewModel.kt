package com.calorietracker.app.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.calorietracker.app.data.local.TokenManager
import com.calorietracker.app.data.models.AuthUser
import com.calorietracker.app.data.repository.AuthRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch

sealed class AuthState {
    object Idle : AuthState()
    object Loading : AuthState()
    data class Success(val user: AuthUser) : AuthState()
    data class Error(val message: String) : AuthState()
}

class AuthViewModel(
    private val authRepository: AuthRepository,
    private val tokenManager: TokenManager
) : ViewModel() {

    private val _authState = MutableStateFlow<AuthState>(AuthState.Idle)
    val authState: StateFlow<AuthState> = _authState.asStateFlow()

    private val _isLoggedIn = MutableStateFlow(false)
    val isLoggedIn: StateFlow<Boolean> = _isLoggedIn.asStateFlow()

    init {
        checkSession()
    }

    private fun checkSession() {
        viewModelScope.launch {
            val token = tokenManager.token.first()
            _isLoggedIn.value = !token.isNullOrBlank()
        }
    }

    fun login(email: String, password: String) {
        viewModelScope.launch {
            _authState.value = AuthState.Loading
            authRepository.login(email, password)
                .onSuccess { response ->
                    _authState.value = AuthState.Success(response.user)
                    _isLoggedIn.value = true
                }
                .onFailure { e ->
                    _authState.value = AuthState.Error(parseError(e.message))
                }
        }
    }

    fun register(name: String, email: String, password: String, calorieGoal: Int) {
        viewModelScope.launch {
            _authState.value = AuthState.Loading
            authRepository.register(name, email, password, calorieGoal)
                .onSuccess { response ->
                    _authState.value = AuthState.Success(response.user)
                    _isLoggedIn.value = true
                }
                .onFailure { e ->
                    _authState.value = AuthState.Error(parseError(e.message))
                }
        }
    }

    fun logout() {
        viewModelScope.launch {
            authRepository.logout()
            _isLoggedIn.value = false
            _authState.value = AuthState.Idle
        }
    }

    fun resetState() {
        _authState.value = AuthState.Idle
    }

    private fun parseError(raw: String?): String {
        if (raw == null) return "Unknown error"
        // Try to extract message from JSON error body like {"error":"..."}
        val match = Regex(""""error"\s*:\s*"([^"]+)"""").find(raw)
        return match?.groupValues?.get(1) ?: raw
    }

    class Factory(
        private val authRepository: AuthRepository,
        private val tokenManager: TokenManager
    ) : ViewModelProvider.Factory {
        @Suppress("UNCHECKED_CAST")
        override fun <T : ViewModel> create(modelClass: Class<T>): T =
            AuthViewModel(authRepository, tokenManager) as T
    }
}
