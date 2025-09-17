package com.example.rahi2.ui.screens.tabs

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.material3.Button
import androidx.compose.material3.ElevatedButton
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Divider
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Person
import androidx.compose.foundation.shape.CircleShape

@Composable
fun ProfileTab(onLogout: () -> Unit) {
	var name by remember { mutableStateOf("Jane Doe") }
	var email by remember { mutableStateOf("jane.doe@example.com") }
	var address by remember { mutableStateOf("221B Baker Street, London") }
	var phone by remember { mutableStateOf("+1 555 0100") }
    var isEditing by remember { mutableStateOf(false) }

	Column(
		modifier = Modifier
			.fillMaxSize()
			.padding(24.dp),
		horizontalAlignment = Alignment.Start,
		verticalArrangement = Arrangement.Top
	) {
		Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
			Surface(shape = CircleShape, color = MaterialTheme.colorScheme.primaryContainer) {
				Box(modifier = Modifier.size(72.dp), contentAlignment = Alignment.Center) {
					Icon(Icons.Default.Person, contentDescription = null, tint = MaterialTheme.colorScheme.onPrimaryContainer)
				}
			}
			Text(name, style = MaterialTheme.typography.titleLarge)
		}
		Spacer(modifier = Modifier.height(12.dp))
		Divider()
		Spacer(modifier = Modifier.height(12.dp))
		Text("Edit", style = MaterialTheme.typography.titleMedium)
		Spacer(modifier = Modifier.height(8.dp))
		if (!isEditing) {
			Text("Tap Edit to manage your profile details.", style = MaterialTheme.typography.bodyMedium)
			Spacer(modifier = Modifier.height(16.dp))
			ElevatedButton(onClick = { isEditing = true }, modifier = Modifier.fillMaxWidth()) {
				Text("Edit Profile")
			}
		} else {
			Spacer(modifier = Modifier.height(8.dp))
			OutlinedTextField(
				value = name,
				onValueChange = { name = it },
				label = { Text("Name") },
				modifier = Modifier.fillMaxWidth(),
				singleLine = true
			)
			Spacer(modifier = Modifier.height(12.dp))
			OutlinedTextField(
				value = email,
				onValueChange = { email = it },
				label = { Text("Email") },
				modifier = Modifier.fillMaxWidth(),
				singleLine = true,
				keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email)
			)
			Spacer(modifier = Modifier.height(12.dp))
			OutlinedTextField(
				value = address,
				onValueChange = { address = it },
				label = { Text("Address") },
				modifier = Modifier.fillMaxWidth()
			)
			Spacer(modifier = Modifier.height(12.dp))
			OutlinedTextField(
				value = phone,
				onValueChange = { phone = it },
				label = { Text("Phone Number") },
				modifier = Modifier.fillMaxWidth(),
				singleLine = true,
				keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone)
			)
			Spacer(modifier = Modifier.height(16.dp))
			Button(onClick = { isEditing = false }, modifier = Modifier.fillMaxWidth()) {
				Text("Save")
			}
			Spacer(modifier = Modifier.height(8.dp))
			ElevatedButton(onClick = { isEditing = false }, modifier = Modifier.fillMaxWidth()) {
				Text("Cancel")
			}
		}

		Spacer(modifier = Modifier.weight(1f))
		Button(onClick = onLogout, modifier = Modifier.fillMaxWidth()) {
			Text("Logout")
		}
	}
}


