package com.calorietracker.app.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.calorietracker.app.data.models.Meal
import com.calorietracker.app.ui.theme.Green500
import com.calorietracker.app.viewmodel.MealViewModel
import com.calorietracker.app.viewmodel.UiState
import java.text.SimpleDateFormat
import java.util.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HistoryScreen(
    mealViewModel: MealViewModel,
    onBack: () -> Unit
) {
    val mealsState by mealViewModel.meals.collectAsState()

    LaunchedEffect(Unit) {
        val cal = Calendar.getInstance()
        val endDate = SimpleDateFormat("yyyy-MM-dd", Locale.US).format(cal.time)
        cal.add(Calendar.DAY_OF_YEAR, -7)
        val startDate = SimpleDateFormat("yyyy-MM-dd", Locale.US).format(cal.time)
        mealViewModel.loadMeals(startDate, endDate)
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Meal History") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                }
            )
        }
    ) { padding ->
        when (val state = mealsState) {
            is UiState.Loading, is UiState.Idle -> {
                Box(Modifier.fillMaxSize().padding(padding), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator(color = Green500)
                }
            }
            is UiState.Error -> {
                Box(Modifier.fillMaxSize().padding(padding), contentAlignment = Alignment.Center) {
                    Text(state.message, color = MaterialTheme.colorScheme.error)
                }
            }
            is UiState.Success -> {
                val grouped = state.data.groupBy { meal ->
                    try {
                        val sdf = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US).also { it.timeZone = TimeZone.getTimeZone("UTC") }
                        val date = sdf.parse(meal.date)!!
                        SimpleDateFormat("EEEE, MMM d", Locale.getDefault()).format(date)
                    } catch (e: Exception) { "Unknown date" }
                }

                if (state.data.isEmpty()) {
                    Box(Modifier.fillMaxSize().padding(padding), contentAlignment = Alignment.Center) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text("📋", fontSize = 40.sp)
                            Spacer(Modifier.height(8.dp))
                            Text("No meals in this period", color = Color.Gray)
                        }
                    }
                } else {
                    LazyColumn(
                        modifier = Modifier.padding(padding).fillMaxSize(),
                        contentPadding = PaddingValues(16.dp),
                        verticalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        grouped.forEach { (date, meals) ->
                            item {
                                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                                    Text(date, style = MaterialTheme.typography.titleSmall, fontWeight = FontWeight.SemiBold)
                                    Text("${meals.sumOf { it.calories }} kcal", style = MaterialTheme.typography.bodySmall, color = Green500)
                                }
                            }
                            items(meals) { meal ->
                                MealListItem(meal = meal, onDelete = {})
                            }
                        }
                    }
                }
            }
        }
    }
}
