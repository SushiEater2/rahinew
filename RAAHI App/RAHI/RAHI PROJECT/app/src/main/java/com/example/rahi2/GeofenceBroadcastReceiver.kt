package com.example.rahi2

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.widget.Toast
import com.google.android.gms.location.Geofence
import com.google.android.gms.location.GeofencingEvent

class GeofenceBroadcastReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent) {
        val geofencingEvent = GeofencingEvent.fromIntent(intent)
        if (geofencingEvent == null) {
            Toast.makeText(context, "Geofence event is null", Toast.LENGTH_SHORT).show()
            return
        }

        if (geofencingEvent.hasError()) {
            val errorMessage = "Geofence Error: ${geofencingEvent.errorCode}"
            Toast.makeText(context, errorMessage, Toast.LENGTH_SHORT).show()
            return
        }

        // Get the transition type.
        val geofenceTransition = geofencingEvent.geofenceTransition

        // Test that the reported transition was of interest.
        if (geofenceTransition == Geofence.GEOFENCE_TRANSITION_ENTER ||
            geofenceTransition == Geofence.GEOFENCE_TRANSITION_EXIT) {

            // Get the geofences that were triggered. A single event can trigger multiple geofences.
            val triggeringGeofences = geofencingEvent.triggeringGeofences

            val transitionDetails = if (geofenceTransition == Geofence.GEOFENCE_TRANSITION_ENTER) {
                "Entered: ${triggeringGeofences?.joinToString { it.requestId }}"
            } else {
                "Exited: ${triggeringGeofences?.joinToString { it.requestId }}"
            }

            Toast.makeText(context, transitionDetails, Toast.LENGTH_LONG).show()
            // Here you would typically send a notification or perform other actions.
        } else {
            // Log the error.
            Toast.makeText(context, "Geofence transition error: Invalid type $geofenceTransition", Toast.LENGTH_SHORT).show()
        }
    }
}
