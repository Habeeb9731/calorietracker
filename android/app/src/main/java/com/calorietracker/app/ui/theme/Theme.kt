package com.calorietracker.app.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable

private val LightColors = lightColorScheme(
    primary = Green500,
    onPrimary = androidx.compose.ui.graphics.Color.White,
    primaryContainer = Green50,
    onPrimaryContainer = Green700,
    secondary = Green400,
    background = Gray50,
    surface = androidx.compose.ui.graphics.Color.White,
    onBackground = Gray900,
    onSurface = Gray900,
    error = Red500,
)

@Composable
fun CalorieTrackerTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = LightColors,
        typography = Typography,
        content = content
    )
}
