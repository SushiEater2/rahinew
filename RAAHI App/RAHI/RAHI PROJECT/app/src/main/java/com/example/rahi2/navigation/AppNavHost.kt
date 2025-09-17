package com.example.rahi2.navigation

import androidx.compose.runtime.Composable
// import androidx.compose.runtime.LaunchedEffect // Not used in the provided snippet
import androidx.compose.ui.Modifier
// import androidx.navigation.NavGraphBuilder // Not directly used in the signature
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.navigation
import com.example.rahi2.ui.screens.AuthScreen
import com.example.rahi2.ui.screens.IncidentReportScreen
import com.example.rahi2.ui.screens.MainShellScreen
import com.example.rahi2.ui.screens.SettingsScreen
import com.example.rahi2.ui.screens.SplashScreen
import com.example.rahi2.ui.screens.tabs.HomeTab
import com.example.rahi2.ui.screens.tabs.MapTab
import com.example.rahi2.ui.screens.tabs.ProfileTab
import com.example.rahi2.ui.strings.Language
// import com.example.rahi2.ui.strings.EnglishStrings // No longer needed here
// import com.example.rahi2.ui.strings.HindiStrings // No longer needed here
// import com.example.rahi2.ui.strings.LocalStrings // No longer needed here
// import androidx.compose.runtime.CompositionLocalProvider // No longer needed here
// import androidx.compose.runtime.getValue // No longer needed for internal state
// import androidx.compose.runtime.mutableStateOf // No longer needed for internal state
// import androidx.compose.runtime.remember // No longer needed for internal state
// import androidx.compose.runtime.setValue // No longer needed for internal state

@Composable
fun AppNavHost(
    navController: NavHostController,
    modifier: Modifier = Modifier,
    currentLanguage: Language, // Added parameter
    onChangeLanguage: (Language) -> Unit // Added parameter
) {
    // var isDark by remember { mutableStateOf(false) } // Removed
    // var language by remember { mutableStateOf(Language.EN) } // Removed
    // CompositionLocalProvider(LocalStrings provides if (language == Language.EN) EnglishStrings else HindiStrings) { // Removed
    NavHost(
        navController = navController,
        startDestination = NavRoute.Splash.route,
        modifier = modifier
    ) {
        // Splash
        composable(NavRoute.Splash.route) {
            SplashScreen(onFinished = {
                navController.navigate(NavRoute.Auth.route) {
                    popUpTo(NavRoute.Splash.route) { inclusive = true }
                }
            })
        }

        // Auth
        composable(NavRoute.Auth.route) {
            AuthScreen(
                onLogin = {
                    navController.navigate(NavRoute.Main.route) {
                        popUpTo(NavRoute.Auth.route) { inclusive = true }
                    }
                },
                onSignUp = {
                    navController.navigate(NavRoute.Main.route) {
                        popUpTo(NavRoute.Auth.route) { inclusive = true }
                    }
                }
            )
        }

        // Main shell with bottom tabs (Home, Profile, Settings)
        navigation(startDestination = NavRoute.Home.route, route = NavRoute.Main.route) {
            composable(NavRoute.Home.route) {
                MainShellScreen(selectedRoute = NavRoute.Home.route, onNavigate = { route ->
                    navController.navigate(route) {
                        launchSingleTop = true
                        restoreState = true
                        popUpTo(NavRoute.Home.route) { saveState = true }
                    }
                },
                    content = { HomeTab(
                        onReportIncident = { navController.navigate(NavRoute.IncidentReport.route) },
                        onOpenMap = { navController.navigate(NavRoute.Map.route) }
                    ) }
                )
            }
            composable(NavRoute.Profile.route) {
                MainShellScreen(selectedRoute = NavRoute.Profile.route, onNavigate = { route ->
                    navController.navigate(route) {
                        launchSingleTop = true
                        restoreState = true
                        popUpTo(NavRoute.Home.route) { saveState = true }
                    }
                }, content = { ProfileTab(onLogout = {
                    navController.navigate(NavRoute.Auth.route) {
                        popUpTo(0) { inclusive = true }
                    }
                }) })
            }
            composable(NavRoute.Settings.route) {
                MainShellScreen(selectedRoute = NavRoute.Settings.route, onNavigate = { route ->
                    navController.navigate(route) {
                        launchSingleTop = true
                        restoreState = true
                        popUpTo(NavRoute.Home.route) { saveState = true }
                    }
                }, content = { SettingsScreen(
                    selectedLanguage = currentLanguage, // Updated
                    onChangeLanguage = onChangeLanguage // Updated
                    // darkMode = isDark, // Removed
                    // onToggleDarkMode = { isDark = it } // Removed
                ) })
            }
        }

        // Incident report
        composable(NavRoute.IncidentReport.route) {
            IncidentReportScreen(onBack = { navController.popBackStack() })
        }

        // Map as a standalone screen (from Home)
        composable(NavRoute.Map.route) {
            MapTab()
        }
    }
    // } // Removed closing brace for CompositionLocalProvider
}
