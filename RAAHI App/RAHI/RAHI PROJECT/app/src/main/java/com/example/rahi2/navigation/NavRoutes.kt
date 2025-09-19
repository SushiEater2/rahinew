package com.example.rahi2.navigation

sealed class NavRoute(val route: String) {
	data object Splash : NavRoute("splash")
	data object Auth : NavRoute("auth")
	data object Main : NavRoute("main")

	// Bottom tabs
	data object Home : NavRoute("home")
	data object Map : NavRoute("map")
	data object Profile : NavRoute("profile")
	data object Settings : NavRoute("settings")

	// Other screens
	data object IncidentReport : NavRoute("incident_report")
}


