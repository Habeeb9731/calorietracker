package com.calorietracker.app.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import com.calorietracker.app.viewmodel.AuthState
import com.calorietracker.app.viewmodel.AuthViewModel

@Composable
fun RegisterScreen(
    authViewModel: AuthViewModel,
    onNavigateToLogin: () -> Unit,
    onRegisterSuccess: () -> Unit
) {
    val authState by authViewModel.authState.collectAsState()

    var name by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var calorieGoal by remember { mutableStateOf("2000") }

    LaunchedEffect(authState) {
        if (authState is AuthState.Success) {
            authViewModel.resetState()
            onRegisterSuccess()
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text("Get Started", style = MaterialTheme.typography.headlineMedium)
        Text("Create your free account", style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f))

        Spacer(Modifier.height(32.dp))

        Card(
            modifier = Modifier.fillMaxWidth(),
            elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)
        ) {
            Column(modifier = Modifier.padding(20.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {

                if (authState is AuthState.Error) {
                    Surface(color = MaterialTheme.colorScheme.errorContainer, shape = MaterialTheme.shapes.medium) {
                        Text(
                            (authState as AuthState.Error).message,
                            modifier = Modifier.padding(12.dp),
                            color = MaterialTheme.colorScheme.error,
                            style = MaterialTheme.typography.bodySmall
                        )
                    }
                }

                OutlinedTextField(
                    value = name, onValueChange = { name = it },
                    label = { Text("Full Name") }, placeholder = { Text("John Doe") },
                    singleLine = true, modifier = Modifier.fillMaxWidth()
                )

                OutlinedTextField(
                    value = email, onValueChange = { email = it },
                    label = { Text("Email") }, placeholder = { Text("you@example.com") },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
                    singleLine = true, modifier = Modifier.fillMaxWidth()
                )

                OutlinedTextField(
                    value = password, onValueChange = { password = it },
                    label = { Text("Password") }, placeholder = { Text("At least 6 characters") },
                    visualTransformation = PasswordVisualTransformation(),
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password),
                    singleLine = true, modifier = Modifier.fillMaxWidth()
                )

                OutlinedTextField(
                    value = calorieGoal, onValueChange = { calorieGoal = it },
                    label = { Text("Daily Calorie Goal") }, placeholder = { Text("2000") },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                    singleLine = true, modifier = Modifier.fillMaxWidth(),
                    supportingText = { Text("Recommended: 2000 kcal/day") }
                )

                Button(
                    onClick = {
                        authViewModel.register(
                            name.trim(), email.trim(), password,
                            calorieGoal.toIntOrNull() ?: 2000
                        )
                    },
                    enabled = authState !is AuthState.Loading &&
                            name.isNotBlank() && email.isNotBlank() && password.length >= 6,
                    modifier = Modifier.fillMaxWidth().height(50.dp)
                ) {
                    if (authState is AuthState.Loading) {
                        CircularProgressIndicator(modifier = Modifier.size(20.dp), color = MaterialTheme.colorScheme.onPrimary, strokeWidth = 2.dp)
                    } else {
                        Text("Create Account")
                    }
                }

                TextButton(onClick = { authViewModel.resetState(); onNavigateToLogin() }, modifier = Modifier.fillMaxWidth()) {
                    Text("Already have an account? Sign in")
                }
            }
        }
    }
}
