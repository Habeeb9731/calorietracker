package com.calorietracker.app.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.CameraAlt
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import com.calorietracker.app.ui.theme.Green500
import com.calorietracker.app.viewmodel.MealViewModel
import com.calorietracker.app.viewmodel.UiState
import java.text.SimpleDateFormat
import java.util.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AddMealScreen(
    mealViewModel: MealViewModel,
    onNavigateToCamera: () -> Unit,
    onSaved: () -> Unit,
    onBack: () -> Unit
) {
    val aiResult by mealViewModel.aiResult.collectAsState()
    val saveMealState by mealViewModel.saveMeal.collectAsState()

    var title by remember { mutableStateOf("") }
    var calories by remember { mutableStateOf("") }
    var notes by remember { mutableStateOf("") }
    var aiMeta by remember { mutableStateOf<com.calorietracker.app.data.models.AiFoodResponse?>(null) }

    // Auto-fill form when AI result arrives
    LaunchedEffect(aiResult) {
        if (aiResult is UiState.Success) {
            val result = (aiResult as UiState.Success).data
            title = result.foodName
            calories = result.calories.toString()
            aiMeta = result
        }
    }

    // Navigate back after successful save
    LaunchedEffect(saveMealState) {
        if (saveMealState is UiState.Success) {
            mealViewModel.resetSaveMeal()
            onSaved()
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Log Meal") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                }
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .padding(padding)
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            // AI Scan button
            OutlinedButton(
                onClick = onNavigateToCamera,
                modifier = Modifier.fillMaxWidth().height(52.dp)
            ) {
                Icon(Icons.Default.CameraAlt, contentDescription = null)
                Spacer(Modifier.width(8.dp))
                Text("Scan Food with AI Camera")
            }

            // AI Result Banner
            if (aiResult is UiState.Loading) {
                LinearProgressIndicator(modifier = Modifier.fillMaxWidth(), color = Green500)
                Text("Analyzing food...", style = MaterialTheme.typography.bodySmall, color = Green500)
            }

            if (aiMeta != null) {
                Surface(color = MaterialTheme.colorScheme.primaryContainer, shape = MaterialTheme.shapes.medium) {
                    Column(modifier = Modifier.padding(12.dp)) {
                        Text("🤖 AI detected: ${aiMeta!!.foodName}", style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onPrimaryContainer)
                        if (aiMeta!!.description.isNotEmpty()) {
                            Text(aiMeta!!.description, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onPrimaryContainer.copy(alpha = 0.8f))
                        }
                        Text("Confidence: ${(aiMeta!!.confidence * 100).toInt()}% — edit below if needed", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onPrimaryContainer.copy(alpha = 0.7f))
                    }
                }
            }

            if (aiResult is UiState.Error) {
                Surface(color = MaterialTheme.colorScheme.errorContainer, shape = MaterialTheme.shapes.medium) {
                    Text((aiResult as UiState.Error).message, modifier = Modifier.padding(12.dp), color = MaterialTheme.colorScheme.error, style = MaterialTheme.typography.bodySmall)
                }
            }

            Divider()

            Text("Meal Details", style = MaterialTheme.typography.titleMedium)

            OutlinedTextField(
                value = title,
                onValueChange = { title = it },
                label = { Text("Meal Name") },
                placeholder = { Text("e.g., Chicken Biryani") },
                singleLine = true,
                modifier = Modifier.fillMaxWidth()
            )

            OutlinedTextField(
                value = calories,
                onValueChange = { calories = it },
                label = { Text("Calories (kcal)") },
                placeholder = { Text("350") },
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                singleLine = true,
                modifier = Modifier.fillMaxWidth()
            )

            OutlinedTextField(
                value = notes,
                onValueChange = { notes = it },
                label = { Text("Notes (optional)") },
                placeholder = { Text("Any additional notes...") },
                minLines = 2,
                maxLines = 4,
                modifier = Modifier.fillMaxWidth()
            )

            if (saveMealState is UiState.Error) {
                Surface(color = MaterialTheme.colorScheme.errorContainer, shape = MaterialTheme.shapes.medium) {
                    Text((saveMealState as UiState.Error).message, modifier = Modifier.padding(12.dp), color = MaterialTheme.colorScheme.error, style = MaterialTheme.typography.bodySmall)
                }
            }

            Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                OutlinedButton(onClick = onBack, modifier = Modifier.weight(1f).height(50.dp)) {
                    Text("Cancel")
                }
                Button(
                    onClick = {
                        val isoDate = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US)
                            .also { it.timeZone = TimeZone.getTimeZone("UTC") }
                            .format(Date())
                        mealViewModel.saveMeal(
                            title = title.trim(),
                            calories = calories.toIntOrNull() ?: 0,
                            date = isoDate,
                            notes = notes.trim().ifBlank { null },
                            aiDetected = aiMeta != null,
                            aiConfidence = aiMeta?.confidence
                        )
                    },
                    enabled = title.isNotBlank() && (calories.toIntOrNull() ?: -1) >= 0 && saveMealState !is UiState.Loading,
                    modifier = Modifier.weight(1f).height(50.dp)
                ) {
                    if (saveMealState is UiState.Loading) {
                        CircularProgressIndicator(modifier = Modifier.size(20.dp), color = MaterialTheme.colorScheme.onPrimary, strokeWidth = 2.dp)
                    } else {
                        Text("Save Meal")
                    }
                }
            }
        }
    }
}
