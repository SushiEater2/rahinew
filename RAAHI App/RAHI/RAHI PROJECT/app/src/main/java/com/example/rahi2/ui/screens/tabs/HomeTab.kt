package com.example.rahi2.ui.screens.tabs

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
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
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Map
import androidx.compose.material.icons.filled.Report
import androidx.compose.material.icons.filled.VerifiedUser
import androidx.compose.material.icons.filled.Sos
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.example.rahi2.ui.strings.LocalStrings // Added import

@Composable
fun HomeTab(onReportIncident: () -> Unit, onOpenMap: () -> Unit) {
	val context = LocalContext.current
	Column(
		modifier = Modifier
			.fillMaxSize()
			.background(
				Brush.verticalGradient(
					listOf(
						Color(0xFF101828),
						Color(0xFF1D3557)
					)
				)
			)
			.padding(16.dp),
		horizontalAlignment = Alignment.CenterHorizontally,
		verticalArrangement = Arrangement.Top
	) {
		Row(
			modifier = Modifier.fillMaxWidth(),
			horizontalArrangement = Arrangement.Start,
			verticalAlignment = Alignment.CenterVertically
		) {
			Icon(Icons.Default.VerifiedUser, contentDescription = null, tint = MaterialTheme.colorScheme.primary)
			Text(
				text = LocalStrings.current.appTitle, // Updated
				style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold),
				modifier = Modifier.padding(start = 8.dp)
			)
		}
		Spacer(modifier = Modifier.height(16.dp))

		FeatureCard(
			title = LocalStrings.current.homeSOS, // Updated
			color = Color(0xFFFF3D00),
			icon = { Icon(Icons.Default.Sos, contentDescription = null, tint = Color.White, modifier = Modifier.size(36.dp)) },
			onClick = {
				val intent = android.content.Intent(android.content.Intent.ACTION_DIAL, android.net.Uri.parse("tel:112"))
				context.startActivity(intent)
			}
		)
		Spacer(modifier = Modifier.height(12.dp))
		FeatureCard(
			title = LocalStrings.current.homeMap, // Updated
			color = Color(0xFF42A5F5),
			icon = { Icon(Icons.Default.Map, contentDescription = null, tint = Color.White, modifier = Modifier.size(36.dp)) },
			onClick = onOpenMap
		)
		Spacer(modifier = Modifier.height(12.dp))
		FeatureCard(
			title = LocalStrings.current.homeReportIncident, // Updated
			color = Color(0xFF66BB6A),
			icon = { Icon(Icons.Default.Report, contentDescription = null, tint = Color.White, modifier = Modifier.size(36.dp)) },
			onClick = onReportIncident
		)
	}
}

@Composable
private fun FeatureCard(
	title: String,
	color: Color,
	icon: @Composable () -> Unit,
	onClick: () -> Unit
) {
	Card(
		colors = CardDefaults.cardColors(containerColor = color),
		shape = RoundedCornerShape(18.dp),
		modifier = Modifier
			.fillMaxWidth()
			.height(100.dp)
			.clickable { onClick() }
	) {
		Row(
			modifier = Modifier
				.fillMaxSize()
				.background(color.copy(alpha = 0.08f))
				.padding(16.dp),
			verticalAlignment = Alignment.CenterVertically,
			horizontalArrangement = Arrangement.spacedBy(16.dp)
		) {
			Box(
				modifier = Modifier
					.size(56.dp)
					.background(color.copy(alpha = 0.25f), shape = RoundedCornerShape(12.dp)),
				contentAlignment = Alignment.Center
			) { icon() }
			Text(title, style = MaterialTheme.typography.titleLarge, color = Color.White)
		}
	}
}


