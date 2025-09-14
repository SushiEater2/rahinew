package com.example.rahi2.ui.screens.tabs

import android.Manifest
import android.content.pm.PackageManager
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
// import androidx.compose.foundation.layout.Row // Will be removed
// import androidx.compose.foundation.layout.Spacer // Will be removed if not used elsewhere
import androidx.compose.foundation.layout.fillMaxSize
// import androidx.compose.foundation.layout.fillMaxWidth // Will be removed if not used by dropdown
import androidx.compose.foundation.layout.padding
// import androidx.compose.foundation.layout.width // Will be removed
import androidx.compose.foundation.layout.wrapContentSize
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
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
import com.google.android.gms.location.LocationServices
import com.google.android.gms.location.Priority
import com.google.android.gms.maps.model.CameraPosition
import com.google.android.gms.maps.model.LatLng
import com.google.maps.android.compose.GoogleMap
import com.google.maps.android.compose.MapProperties
import com.google.maps.android.compose.MapType
import com.google.maps.android.compose.Marker
import com.google.maps.android.compose.MarkerState
import com.google.maps.android.compose.rememberCameraPositionState
import com.google.android.gms.tasks.CancellationTokenSource
import java.util.Locale

@Composable
fun MapTab() {
    val context = LocalContext.current
    var hasLocationPermission by remember { mutableStateOf(false) }
    var currentLocation by remember { mutableStateOf<LatLng?>(null) }
    var currentMapType by remember { mutableStateOf(MapType.NORMAL) }
    var showMapTypeSelector by remember { mutableStateOf(false) }

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
                .addOnFailureListener { exception ->
                    // Optionally log this exception or inform the user
                }
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

    val mapTypes = listOf(
        MapType.NORMAL,
        MapType.SATELLITE,
        MapType.TERRAIN,
        MapType.HYBRID
    )

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

        // Dropdown Map Type Selector
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
                    fontSize = 14.sp // Slightly larger font for the button text
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
                                fontSize = 16.sp // Increased font size for dropdown items
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
    }
}
