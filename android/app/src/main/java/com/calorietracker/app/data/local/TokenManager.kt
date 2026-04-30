package com.calorietracker.app.data.local

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.intPreferencesKey
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

private val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "auth_prefs")

class TokenManager(private val context: Context) {

    companion object {
        val TOKEN_KEY = stringPreferencesKey("auth_token")
        val USER_ID_KEY = stringPreferencesKey("user_id")
        val USER_NAME_KEY = stringPreferencesKey("user_name")
        val USER_EMAIL_KEY = stringPreferencesKey("user_email")
        val CALORIE_GOAL_KEY = intPreferencesKey("calorie_goal")
    }

    val token: Flow<String?> = context.dataStore.data.map { it[TOKEN_KEY] }
    val userName: Flow<String?> = context.dataStore.data.map { it[USER_NAME_KEY] }
    val calorieGoal: Flow<Int> = context.dataStore.data.map { it[CALORIE_GOAL_KEY] ?: 2000 }

    suspend fun saveAuthData(token: String, userId: String, name: String, email: String, calorieGoal: Int) {
        context.dataStore.edit { prefs ->
            prefs[TOKEN_KEY] = token
            prefs[USER_ID_KEY] = userId
            prefs[USER_NAME_KEY] = name
            prefs[USER_EMAIL_KEY] = email
            prefs[CALORIE_GOAL_KEY] = calorieGoal
        }
    }

    suspend fun clearAll() {
        context.dataStore.edit { it.clear() }
    }
}
