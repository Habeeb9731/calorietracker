package com.calorietracker.app.ui.screens

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.History
import androidx.compose.material.icons.filled.Logout
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.calorietracker.app.data.models.DashboardResponse
import com.calorietracker.app.data.models.Meal
import com.calorietracker.app.data.models.WeeklyDataPoint
import com.calorietracker.app.ui.theme.Green500
import com.calorietracker.app.ui.theme.Red400
import com.calorietracker.app.ui.theme.Yellow400
import com.calorietracker.app.viewmodel.MealViewModel
import com.calorietracker.app.viewmodel.AuthViewModel
import com.calorietracker.app.viewmodel.UiState
import java.text.SimpleDateFormat
import java.util.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DashboardScreen(
    mealViewModel: MealViewModel,
    authViewModel: AuthViewModel,
    onNavigateToAddMeal: () -> Unit,
    onNavigateToHistory: () -> Unit,
    onLogout: () -> Unit
) {
    val dashboardState by mealViewModel.dashboard.collectAsState()

    LaunchedEffect(Unit) { mealViewModel.loadDashboard() }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("CalorieTracker 🥗", fontWeight = FontWeight.Bold) },
                actions = {
                    IconButton(onClick = onNavigateToHistory) {
                        Icon(Icons.Default.History, contentDescription = "History")
                    }
                    IconButton(onClick = onLogout) {
                        Icon(Icons.Default.Logout, contentDescription = "Logout")
                    }
                }
            )
        },
        floatingActionButton = {
            FloatingActionButton(onClick = onNavigateToAddMeal, containerColor = Green500) {
                Icon(Icons.Default.Add, contentDescription = "Add Meal", tint = Color.White)
            }
        }
    ) { padding ->
        when (val state = dashboardState) {
            is UiState.Loading, is UiState.Idle -> {
                Box(Modifier.fillMaxSize().padding(padding), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator(color = Green500)
                }
            }
            is UiState.Error -> {
                Box(Modifier.fillMaxSize().padding(padding), contentAlignment = Alignment.Center) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text(state.message, color = MaterialTheme.colorScheme.error)
                        Spacer(Modifier.height(12.dp))
                        Button(onClick = { mealViewModel.loadDashboard() }) { Text("Retry") }
                    }
                }
            }
            is UiState.Success -> {
                DashboardContent(
                    data = state.data,
                    onDeleteMeal = { mealViewModel.deleteMeal(it) },
                    modifier = Modifier.padding(padding)
                )
            }
        }
    }
}

@Composable
private fun DashboardContent(
    data: DashboardResponse,
    onDeleteMeal: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    LazyColumn(
        modifier = modifier.fillMaxSize(),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        item { DailyProgressCard(consumed = data.dailyTotal, goal = data.calorieGoal) }
        item { WeeklyBarChart(data = data.weeklyData, goal = data.calorieGoal) }
        item {
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                Text("Today's Meals", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.SemiBold)
                Text("${data.dailyMeals.size} logged", style = MaterialTheme.typography.bodySmall, color = Color.Gray)
            }
        }
        if (data.dailyMeals.isEmpty()) {
            item {
                Box(Modifier.fillMaxWidth().padding(vertical = 32.dp), contentAlignment = Alignment.Center) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text("🍽️", fontSize = 40.sp)
                        Spacer(Modifier.height(8.dp))
                        Text("No meals logged today", color = Color.Gray)
                    }
                }
            }
        } else {
            items(data.dailyMeals) { meal ->
                MealListItem(meal = meal, onDelete = { onDeleteMeal(meal.id) })
            }
        }
    }
}

@Composable
fun DailyProgressCard(consumed: Int, goal: Int) {
    val pct = (consumed.toFloat() / goal).coerceIn(0f, 1f)
    val isOver = consumed > goal
    val barColor = when {
        isOver -> Red400
        pct > 0.8f -> Yellow400
        else -> Green500
    }

    Card(modifier = Modifier.fillMaxWidth()) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                Text("Today's Progress", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.SemiBold)
                Text("Goal: $goal kcal", style = MaterialTheme.typography.labelSmall, color = Color.Gray)
            }
            Spacer(Modifier.height(12.dp))
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.Bottom) {
                Column {
                    Text("$consumed", style = MaterialTheme.typography.headlineLarge, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.onSurface)
                    Text("kcal consumed", style = MaterialTheme.typography.bodySmall, color = Color.Gray)
                }
                if (isOver) {
                    Text("${consumed - goal} over", style = MaterialTheme.typography.titleMedium, color = Red400, fontWeight = FontWeight.SemiBold)
                } else {
                    Text("${goal - consumed} left", style = MaterialTheme.typography.titleMedium, color = Green500, fontWeight = FontWeight.SemiBold)
                }
            }
            Spacer(Modifier.height(12.dp))
            Box(Modifier.fillMaxWidth().height(10.dp).clip(RoundedCornerShape(50)).background(Color(0xFFF3F4F6))) {
                Box(Modifier.fillMaxWidth(pct).fillMaxHeight().clip(RoundedCornerShape(50)).background(barColor))
            }
            Spacer(Modifier.height(4.dp))
            Text("${(pct * 100).toInt()}% of daily goal", style = MaterialTheme.typography.labelSmall, color = Color.Gray, modifier = Modifier.align(Alignment.End))
        }
    }
}

@Composable
fun WeeklyBarChart(data: List<WeeklyDataPoint>, goal: Int) {
    val maxCal = maxOf(data.maxOfOrNull { it.calories } ?: goal, goal).toFloat()

    Card(modifier = Modifier.fillMaxWidth()) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text("Weekly Summary", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.SemiBold)
            Spacer(Modifier.height(12.dp))
            Canvas(modifier = Modifier.fillMaxWidth().height(140.dp)) {
                val barWidth = size.width / (data.size * 1.8f)
                val gap = size.width / data.size
                val goalY = size.height * (1 - goal / maxCal)

                data.forEachIndexed { i, point ->
                    val barH = size.height * (point.calories / maxCal)
                    val x = i * gap + (gap - barWidth) / 2
                    drawRoundRect(
                        color = if (point.calories > goal) Red400 else Green500,
                        topLeft = Offset(x, size.height - barH),
                        size = Size(barWidth, barH),
                        cornerRadius = androidx.compose.ui.geometry.CornerRadius(8f, 8f)
                    )
                }
                // Goal reference line
                drawLine(color = Yellow400, start = Offset(0f, goalY), end = Offset(size.width, goalY), strokeWidth = 2f)
            }
            Spacer(Modifier.height(6.dp))
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                data.forEach { point ->
                    val sdf = SimpleDateFormat("EEE", Locale.getDefault())
                    val day = try { sdf.format(SimpleDateFormat("yyyy-MM-dd", Locale.US).parse(point.date)!!) } catch (e: Exception) { "" }
                    Text(day, style = MaterialTheme.typography.labelSmall, color = Color.Gray)
                }
            }
        }
    }
}

@Composable
fun MealListItem(meal: Meal, onDelete: () -> Unit) {
    Card(modifier = Modifier.fillMaxWidth()) {
        Row(
            modifier = Modifier.padding(12.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Box(
                modifier = Modifier.size(42.dp).clip(RoundedCornerShape(12.dp))
                    .background(Color(0xFFECFDF5)),
                contentAlignment = Alignment.Center
            ) {
                Text(if (meal.aiDetected) "🤖" else "🍽️", fontSize = 20.sp)
            }
            Column(modifier = Modifier.weight(1f)) {
                Text(meal.title, style = MaterialTheme.typography.bodyLarge, fontWeight = FontWeight.Medium)
                val sdf = SimpleDateFormat("HH:mm", Locale.getDefault())
                val time = try {
                    val parsed = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US).also { it.timeZone = TimeZone.getTimeZone("UTC") }.parse(meal.date)
                    sdf.format(parsed!!)
                } catch (e: Exception) { "" }
                Text(time, style = MaterialTheme.typography.labelSmall, color = Color.Gray)
            }
            Column(horizontalAlignment = Alignment.End) {
                Text("${meal.calories}", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                Text("kcal", style = MaterialTheme.typography.labelSmall, color = Color.Gray)
            }
            IconButton(onClick = onDelete, modifier = Modifier.size(32.dp)) {
                Icon(Icons.Default.Delete, contentDescription = "Delete", tint = Red400, modifier = Modifier.size(18.dp))
            }
        }
    }
}
