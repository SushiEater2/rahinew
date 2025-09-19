package com.example.rahi2.ui.screens.sos

import android.Manifest
import android.content.Intent as AndroidIntent
import android.content.pm.PackageManager
import android.location.Location
import android.net.Uri
import android.telephony.SmsManager
import android.widget.Toast
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.core.content.ContextCompat
import androidx.navigation.NavController
import com.example.rahi2.ui.strings.LocalStrings // Assuming you'll add new strings here later
import com.google.android.gms.location.LocationServices
import com.google.android.gms.location.Priority
import com.google.android.gms.tasks.CancellationTokenSource

// IMPORTANT: REPLACE WITH A REAL NUMBER. This should ideally be configurable by the user.
const val EMERGENCY_CONTACT_NUMBER_SOS_DETAILS = "0000000000"

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SosDetailsScreen(navController: NavController) {
    val context = LocalContext.current
    val currentStrings = LocalStrings.current // For existing strings, new ones are hardcoded for now

    var name by remember { mutableStateOf("") }
    var phoneNumber by remember { mutableStateOf("") }
    var currentLocation by remember { mutableStateOf<Location?>(null) }
    var isFetchingLocation by remember { mutableStateOf(false) }

    val fusedLocationClient = remember { LocationServices.getFusedLocationProviderClient(context) }

    fun fetchDeviceLocation() {
        if (ContextCompat.checkSelfPermission(context, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED) {
            isFetchingLocation = true
            fusedLocationClient.getCurrentLocation(Priority.PRIORITY_HIGH_ACCURACY, CancellationTokenSource().token)
                .addOnSuccessListener { location: Location? ->
                    currentLocation = location
                    isFetchingLocation = false
                    if (location == null) {
                        Toast.makeText(context, "Failed to get location. Ensure GPS is on.", Toast.LENGTH_LONG).show()
                    }
                }
                .addOnFailureListener {
                    isFetchingLocation = false
                    Toast.makeText(context, "Error getting location: ${it.message}", Toast.LENGTH_LONG).show()
                }
        } else {
            // This case should ideally be handled by requesting permission first
            Toast.makeText(context, "Location permission not granted.", Toast.LENGTH_SHORT).show()
        }
    }

    val locationPermissionLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestPermission(),
        onResult = { isGranted ->
            if (isGranted) {
                fetchDeviceLocation()
            } else {
                Toast.makeText(context, "Location permission denied.", Toast.LENGTH_SHORT).show()
            }
        }
    )

    val smsPermissionLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestPermission(),
        onResult = { isGranted ->
            if (isGranted) {
                // SMS will be sent by the calling function if permission is granted
                Toast.makeText(context, "SMS Permission Granted. Try sending again.", Toast.LENGTH_SHORT).show()
            } else {
                Toast.makeText(context, currentStrings.sosSmsPermissionDenied, Toast.LENGTH_SHORT).show()
            }
        }
    )

    LaunchedEffect(Unit) {
        if (ContextCompat.checkSelfPermission(context, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED) {
            fetchDeviceLocation()
        } else {
            locationPermissionLauncher.launch(Manifest.permission.ACCESS_FINE_LOCATION)
        }
    }

    fun sendSosSms() {
        if (ContextCompat.checkSelfPermission(context, Manifest.permission.SEND_SMS) != PackageManager.PERMISSION_GRANTED) {
            smsPermissionLauncher.launch(Manifest.permission.SEND_SMS)
            return
        }

        val locationText = currentLocation?.let {
            "My location: https://maps.google.com/?q=${it.latitude},${it.longitude}"
        } ?: "Location not available."

        val smsMessage = "SOS! Name: $name, Phone: $phoneNumber. $locationText"

        try {
            val smsManager = SmsManager.getDefault()
            smsManager.sendTextMessage(EMERGENCY_CONTACT_NUMBER_SOS_DETAILS, null, smsMessage, null, null)
            Toast.makeText(context, currentStrings.sosSmsSent, Toast.LENGTH_LONG).show()
        } catch (e: Exception) {
            val failMsg = currentStrings.sosSmsFailed
            Toast.makeText(context, "$failMsg: ${e.message}", Toast.LENGTH_LONG).show()
        }
    }

    fun initiateEmergencyCall() {
        val callMsg = currentStrings.sosCallingEmergencyServices
        Toast.makeText(context, callMsg, Toast.LENGTH_LONG).show()
        val intent = AndroidIntent(AndroidIntent.ACTION_DIAL, Uri.parse("tel:112"))
        try {
            context.startActivity(intent)
        } catch (e: Exception) {
            Toast.makeText(context, "Could not open dialer: ${e.message}", Toast.LENGTH_LONG).show()
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("SOS Emergency Details") }, // Hardcoded: TODO Move to Strings.kt
                navigationIcon = {
                    IconButton(onClick = { navController.popBackStack() }) {
                        Icon(Icons.Filled.ArrowBack, contentDescription = "Back")
                    }
                }
            )
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(16.dp)
                .verticalScroll(rememberScrollState()),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Text("Current Location:", style = MaterialTheme.typography.titleMedium) // Hardcoded
            if (isFetchingLocation) {
                CircularProgressIndicator(modifier = Modifier.padding(vertical = 8.dp))
            } else {
                Text(
                    text = currentLocation?.let { "Lat: ${it.latitude}, Lng: ${it.longitude}" } ?: "Location not available. Grant permission or try refresh.", // Hardcoded
                    style = MaterialTheme.typography.bodyLarge,
                    modifier = Modifier.padding(vertical = 8.dp)
                )
            }
            Button(onClick = { locationPermissionLauncher.launch(Manifest.permission.ACCESS_FINE_LOCATION) }) {
                Text("Refresh Location") // Hardcoded
            }

            Spacer(modifier = Modifier.height(16.dp))

            OutlinedTextField(
                value = name,
                onValueChange = { name = it },
                label = { Text("Your Name") }, // Hardcoded
                modifier = Modifier.fillMaxWidth(),
                singleLine = true
            )

            OutlinedTextField(
                value = phoneNumber,
                onValueChange = { phoneNumber = it },
                label = { Text("Your Phone Number (current device if possible)") }, // Hardcoded
                modifier = Modifier.fillMaxWidth(),
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone),
                singleLine = true
            )

            Spacer(modifier = Modifier.height(24.dp))

            Button(
                onClick = { sendSosSms() },
                modifier = Modifier.fillMaxWidth().height(48.dp),
                enabled = name.isNotBlank() && phoneNumber.isNotBlank() // Basic validation
            ) {
                Text("Send SMS Alert to Emergency Contact") // Hardcoded
            }

            Button(
                onClick = { initiateEmergencyCall() },
                modifier = Modifier.fillMaxWidth().height(48.dp),
                colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.error)
            ) {
                Text("Call Emergency Services (112)") // Hardcoded
            }
        }
    }
}
