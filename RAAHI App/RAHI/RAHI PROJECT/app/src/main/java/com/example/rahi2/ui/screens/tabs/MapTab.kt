package com.example.rahi2.ui.screens.tabs

import android.Manifest
import android.app.PendingIntent
import android.content.Intent
import android.content.pm.PackageManager
import android.widget.Toast
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.wrapContentSize
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AddLocationAlt
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.content.ContextCompat
import com.google.android.gms.location.Geofence
import com.google.android.gms.location.GeofencingRequest
import com.google.android.gms.location.LocationServices
import com.google.android.gms.location.Priority
import com.google.android.gms.maps.model.CameraPosition
import com.google.android.gms.maps.model.LatLng
import com.google.maps.android.compose.Circle
import com.google.maps.android.compose.GoogleMap
import com.google.maps.android.compose.MapProperties
import com.google.maps.android.compose.MapType
import com.google.maps.android.compose.Marker
import com.google.maps.android.compose.MarkerState
import com.google.maps.android.compose.rememberCameraPositionState
import com.google.android.gms.tasks.CancellationTokenSource
import java.util.Locale
import java.util.UUID

@Composable
fun MapTab() {
    val context = LocalContext.current
    var hasLocationPermission by remember { mutableStateOf(false) }
    var currentLocation by remember { mutableStateOf<LatLng?>(null) }
    var currentMapType by remember { mutableStateOf(MapType.NORMAL) }
    var showMapTypeSelector by remember { mutableStateOf(false) }

    val geofencesList = remember { mutableStateListOf<Pair<LatLng, Float>>() } // To store center and radius for drawing
    val geofencingClient = remember { LocationServices.getGeofencingClient(context) }

    val defaultIndiaLatLng = LatLng(20.5937, 78.9629)
    val cameraPositionState = rememberCameraPositionState {
        position = CameraPosition.fromLatLngZoom(defaultIndiaLatLng, 5f)
    }

    val fusedLocationClient = remember { LocationServices.getFusedLocationProviderClient(context) }

    val mapProperties by remember(currentMapType) {
        mutableStateOf(MapProperties(mapType = currentMapType))
    }

    val locationPermissionLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestPermission(),
        onResult = { isGranted ->
            if (isGranted) {
                hasLocationPermission = true
            } else {
                hasLocationPermission = false
            }
        }
    )

    fun fetchCurrentLocation() {
        if (ContextCompat.checkSelfPermission(context, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED) {
            hasLocationPermission = true
            fusedLocationClient.getCurrentLocation(Priority.PRIORITY_HIGH_ACCURACY, CancellationTokenSource().token)
                .addOnSuccessListener { location ->
                    if (location != null) {
                        currentLocation = LatLng(location.latitude, location.longitude)
                        cameraPositionState.position = CameraPosition.fromLatLngZoom(currentLocation!!, 15f)
                    }
                }
                .addOnFailureListener { /* Optionally log or inform user */ }
        } else {
            locationPermissionLauncher.launch(Manifest.permission.ACCESS_FINE_LOCATION)
        }
    }

    LaunchedEffect(Unit) {
        when (ContextCompat.checkSelfPermission(context, Manifest.permission.ACCESS_FINE_LOCATION)) {
            PackageManager.PERMISSION_GRANTED -> {
                hasLocationPermission = true
                fetchCurrentLocation()
            }
            else -> {
                locationPermissionLauncher.launch(Manifest.permission.ACCESS_FINE_LOCATION)
            }
        }
    }

    LaunchedEffect(hasLocationPermission) {
        if (hasLocationPermission && currentLocation == null) {
            fetchCurrentLocation()
        }
    }

    val mapTypes = listOf(MapType.NORMAL, MapType.SATELLITE, MapType.TERRAIN, MapType.HYBRID)

    fun addGeofenceAtCurrentLocation() {
        if (ContextCompat.checkSelfPermission(context, Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            Toast.makeText(context, "Location permission needed to add geofence.", Toast.LENGTH_SHORT).show()
            return
        }
        currentLocation?.let { loc ->
            val geofenceId = UUID.randomUUID().toString()
            val geofenceRadius = 100f // 100 meters

            val geofence = Geofence.Builder()
                .setRequestId(geofenceId)
                .setCircularRegion(loc.latitude, loc.longitude, geofenceRadius)
                .setExpirationDuration(Geofence.NEVER_EXPIRE)
                .setTransitionTypes(Geofence.GEOFENCE_TRANSITION_ENTER or Geofence.GEOFENCE_TRANSITION_EXIT)
                .build()

            val geofencingRequest = GeofencingRequest.Builder()
                .setInitialTrigger(GeofencingRequest.INITIAL_TRIGGER_ENTER)
                .addGeofence(geofence)
                .build()

            // --- Placeholder for PendingIntent ---
            // To make this work, you need to create a BroadcastReceiver (e.g., GeofenceBroadcastReceiver.kt)
            // and register it in your AndroidManifest.xml.
            // You would also need to request ACCESS_BACKGROUND_LOCATION for geofences to trigger when the app is in the background.
            /*
            val intent = Intent(context, GeofenceBroadcastReceiver::class.java) // Replace GeofenceBroadcastReceiver with your actual receiver
            val geofencePendingIntent = PendingIntent.getBroadcast(
                context, 
                0, 
                intent, 
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_MUTABLE
            )

            geofencingClient.addGeofences(geofencingRequest, geofencePendingIntent)?.run {
                addOnSuccessListener {
                    Toast.makeText(context, "Geofence added at current location!", Toast.LENGTH_SHORT).show()
                    geofencesList.add(Pair(loc, geofenceRadius))
                }
                addOnFailureListener {
                    Toast.makeText(context, "Failed to add geofence.", Toast.LENGTH_SHORT).show()
                }
            }
            */
            // For now, let's simulate success and add to list for visualization
            Toast.makeText(context, "Geofence added (simulated) at current location!", Toast.LENGTH_SHORT).show()
            geofencesList.add(Pair(loc, geofenceRadius))

        } ?: run {
            Toast.makeText(context, "Current location not available.", Toast.LENGTH_SHORT).show()
        }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Brush.verticalGradient(listOf(Color(0xFF0F2027), Color(0xFF203A43), Color(0xFF2C5364))))
    ) {
        if (hasLocationPermission) {
            GoogleMap(
                modifier = Modifier.matchParentSize(),
                cameraPositionState = cameraPositionState,
                properties = mapProperties
            ) {
                currentLocation?.let {
                    Marker(
                        state = MarkerState(position = it),
                        title = "Current Location"
                    )
                }
                geofencesList.forEach { (center, radius) ->
                    Circle(
                        center = center,
                        radius = radius.toDouble(),
                        strokeColor = Color.Blue.copy(alpha = 0.7f),
                        fillColor = Color.Blue.copy(alpha = 0.2f),
                        strokeWidth = 5f
                    )
                }
            }
        } else {
            Column(
                modifier = Modifier.fillMaxSize().padding(16.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Center
            ) {
                Text(
                    "Location permission is required to display the map and your current location.",
                    color = Color.White,
                    textAlign = TextAlign.Center,
                    style = MaterialTheme.typography.bodyLarge
                )
                Button(onClick = { locationPermissionLauncher.launch(Manifest.permission.ACCESS_FINE_LOCATION) }) {
                    Text("Grant Permission")
                }
            }
        }

        // Dropdown Map Type Selector (Top Right)
        Box(
            modifier = Modifier
                .align(Alignment.TopEnd)
                .padding(top = 16.dp, end = 16.dp)
                .wrapContentSize(Alignment.TopEnd)
        ) {
            Button(
                onClick = { showMapTypeSelector = !showMapTypeSelector },
                shape = RoundedCornerShape(8.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = Color.Black.copy(alpha = 0.5f),
                    contentColor = Color.White
                ),
                elevation = ButtonDefaults.buttonElevation(0.dp, 0.dp)
            ) {
                Text(
                    currentMapType.name.lowercase(Locale.getDefault()).replaceFirstChar { it.titlecase(Locale.getDefault()) },
                    fontSize = 14.sp
                )
            }
            DropdownMenu(
                expanded = showMapTypeSelector,
                onDismissRequest = { showMapTypeSelector = false },
                modifier = Modifier.background(MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.9f))
            ) {
                mapTypes.forEach { mapType ->
                    DropdownMenuItem(
                        text = { 
                            Text(
                                mapType.name.lowercase(Locale.getDefault()).replaceFirstChar { it.titlecase(Locale.getDefault()) },
                                fontSize = 16.sp
                            )
                        },
                        onClick = {
                            currentMapType = mapType
                            showMapTypeSelector = false
                        }
                    )
                }
            }
        }

        // FAB to Add Geofence (Bottom Right)
        FloatingActionButton(
            onClick = { addGeofenceAtCurrentLocation() },
            modifier = Modifier
                .align(Alignment.BottomEnd)
                .padding(16.dp),
            containerColor = MaterialTheme.colorScheme.primaryContainer
        ) {
            Icon(Icons.Filled.AddLocationAlt, "Add Geofence")
        }
    }
}
