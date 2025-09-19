package com.example.rahi2.ui.screens

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.unit.dp

@Composable
fun AuthScreen(onLogin: () -> Unit, onSignUp: () -> Unit) {
	var email by remember { mutableStateOf("") }
	var password by remember { mutableStateOf("") }

	Column(
		modifier = Modifier
			.fillMaxSize()
			.padding(24.dp),
		horizontalAlignment = Alignment.CenterHorizontally,
		verticalArrangement = Arrangement.Center
	) {
		Text(
			text = "Welcome",
			style = MaterialTheme.typography.headlineMedium
		)
		Spacer(modifier = Modifier.height(24.dp))
		OutlinedTextField(
			value = email,
			onValueChange = { email = it },
			label = { Text("Email") },
			modifier = Modifier.fillMaxWidth()
		)
		Spacer(modifier = Modifier.height(12.dp))
		OutlinedTextField(
			value = password,
			onValueChange = { password = it },
			label = { Text("Password") },
			visualTransformation = PasswordVisualTransformation(),
			modifier = Modifier.fillMaxWidth()
		)
		Spacer(modifier = Modifier.height(20.dp))
		Button(
			onClick = onLogin,
			modifier = Modifier.fillMaxWidth(),
			contentPadding = PaddingValues(vertical = 12.dp)
		) { Text("Login") }
		Spacer(modifier = Modifier.height(12.dp))
		Button(
			onClick = onSignUp,
			modifier = Modifier.fillMaxWidth(),
			contentPadding = PaddingValues(vertical = 12.dp)
		) { Text("Sign Up") }
	}
}


