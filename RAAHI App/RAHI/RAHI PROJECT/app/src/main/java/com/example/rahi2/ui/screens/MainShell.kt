package com.example.rahi2.ui.screens

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Person
// import androidx.compose.material.icons.filled.Settings // No longer needed
import androidx.compose.material3.Icon
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import com.example.rahi2.navigation.NavRoute
import com.example.rahi2.ui.strings.LocalStrings // Added import

data class BottomTab(val route: String, val label: String, val icon: @Composable () -> Unit)

private val bottomTabs = listOf(
	BottomTab(NavRoute.Home.route, "Home", { Icon(Icons.Default.Home, contentDescription = "Home") }),
	BottomTab(NavRoute.Profile.route, "Profile", { Icon(Icons.Default.Person, contentDescription = "Profile") })
	// BottomTab(NavRoute.Settings.route, "Settings", { Icon(Icons.Default.Settings, contentDescription = "Settings") }) // Removed
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MainShellScreen(
	selectedRoute: String,
	onNavigate: (String) -> Unit,
	content: @Composable (PaddingValues) -> Unit
) {
	Scaffold(
		topBar = {
			TopAppBar(
				title = { Text(LocalStrings.current.appTitle, color = MaterialTheme.colorScheme.onPrimary) }, // Updated
				colors = TopAppBarDefaults.topAppBarColors(
					containerColor = MaterialTheme.colorScheme.primary
				)
			)
		},
		bottomBar = {
			NavigationBar {
				bottomTabs.forEach { tab ->
					NavigationBarItem(
						selected = selectedRoute == tab.route,
						onClick = { onNavigate(tab.route) },
						icon = { tab.icon() },
						label = { Text(tab.label) } // Note: Tab labels also need localization if they aren't already covered by NavRoute properties
					)
				}
			}
		}
	) { inner ->
		Box(modifier = Modifier.fillMaxSize().padding(inner)) {
			content(inner)
		}
	}
}


