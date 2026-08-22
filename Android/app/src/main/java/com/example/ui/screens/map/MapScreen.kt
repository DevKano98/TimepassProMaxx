package com.example.ui.screens.map

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.slideInVertically
import androidx.compose.animation.slideOutVertically
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
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
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.CameraAlt
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.ThumbUp
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.example.data.model.HazardCategories
import com.example.data.model.IncidentReportItem
import com.example.ui.components.CategoryChip
import com.example.ui.components.CivicBottomNavigation
import com.example.ui.components.CivicPillButton
import com.example.ui.components.OsmMapView
import com.example.ui.components.SeverityBadge
import com.example.ui.theme.CivicBlue

@Composable
fun MapScreen(
    viewModel: MapViewModel,
    onNavigateBack: () -> Unit,
    onNavigateToHome: () -> Unit = onNavigateBack,
    onNavigateToMyReports: () -> Unit = {},
    onNavigateToAlerts: () -> Unit = {},
    onNavigateToReport: () -> Unit,
    onNavigateToIncidentDetail: (String) -> Unit
) {
    val uiState by viewModel.uiState.collectAsState()

    Scaffold(
        bottomBar = {
            CivicBottomNavigation(
                currentRoute = "map",
                onNavigateToHome = onNavigateToHome,
                onNavigateToMap = { /* Already here */ },
                onNavigateToMyReports = onNavigateToMyReports,
                onNavigateToAlerts = onNavigateToAlerts
            )
        },
        floatingActionButton = {
            FloatingActionButton(
                onClick = onNavigateToReport,
                shape = CircleShape,
                containerColor = CivicBlue,
                contentColor = Color.White,
                modifier = Modifier.testTag("map_fab_report")
            ) {
                Icon(Icons.Default.CameraAlt, contentDescription = "Report Hazard")
            }
        }
    ) { innerPadding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
        ) {
            // OSM Map Canvas
            OsmMapView(
                centerLat = uiState.centerLat,
                centerLng = uiState.centerLng,
                zoomLevel = 14.5,
                incidents = uiState.filteredIncidents,
                selectedIncidentId = uiState.selectedIncident?.id ?: uiState.selectedIncident?.incidentId,
                onIncidentClick = { incident ->
                    viewModel.onIncidentSelected(incident)
                }
            )

            // Top Control Overlay: Header & Filter Chips
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .align(Alignment.TopCenter)
                    .background(
                        brush = androidx.compose.ui.graphics.Brush.verticalGradient(
                            colors = listOf(
                                MaterialTheme.colorScheme.background.copy(alpha = 0.96f),
                                MaterialTheme.colorScheme.background.copy(alpha = 0.85f),
                                Color.Transparent
                            )
                        )
                    )
                    .padding(bottom = 12.dp)
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp, vertical = 8.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    IconButton(
                        onClick = onNavigateBack,
                        modifier = Modifier
                            .background(MaterialTheme.colorScheme.surface, CircleShape)
                    ) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                    }

                    Text(
                        text = "Live Hazard Map",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold
                    )

                    IconButton(
                        onClick = { viewModel.loadNearbyIncidents(uiState.centerLat, uiState.centerLng) },
                        modifier = Modifier
                            .background(MaterialTheme.colorScheme.surface, CircleShape)
                    ) {
                        if (uiState.isLoading) {
                            CircularProgressIndicator(
                                strokeWidth = 2.dp,
                                modifier = Modifier.size(18.dp),
                                color = CivicBlue
                            )
                        } else {
                            Icon(Icons.Default.Refresh, contentDescription = "Refresh")
                        }
                    }
                }

                // Filter Chips (§3 AI categories + All)
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .horizontalScroll(rememberScrollState())
                        .padding(horizontal = 16.dp),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    // "All" Chip
                    val isAll = uiState.selectedCategoryFilter == null
                    Surface(
                        color = if (isAll) CivicBlue else MaterialTheme.colorScheme.surface,
                        shape = RoundedCornerShape(percent = 50),
                        shadowElevation = 2.dp,
                        modifier = Modifier
                            .clip(RoundedCornerShape(percent = 50))
                            .clickable { viewModel.onCategoryFilterSelected(null) }
                    ) {
                        Text(
                            text = "All Hazards (${uiState.incidents.size})",
                            color = if (isAll) Color.White else MaterialTheme.colorScheme.onSurface,
                            style = MaterialTheme.typography.labelMedium,
                            fontWeight = if (isAll) FontWeight.Bold else FontWeight.Medium,
                            modifier = Modifier.padding(horizontal = 14.dp, vertical = 8.dp)
                        )
                    }

                    HazardCategories.ALL_AI_CATEGORIES.forEach { categoryKey ->
                        val isSelected = uiState.selectedCategoryFilter == categoryKey
                        val count = uiState.incidents.count { it.category.equals(categoryKey, ignoreCase = true) }
                        Surface(
                            color = if (isSelected) CivicBlue else MaterialTheme.colorScheme.surface,
                            shape = RoundedCornerShape(percent = 50),
                            shadowElevation = 2.dp,
                            modifier = Modifier
                                .clip(RoundedCornerShape(percent = 50))
                                .clickable { viewModel.onCategoryFilterSelected(categoryKey) }
                        ) {
                            Text(
                                text = "${HazardCategories.getDisplayName(categoryKey)} ($count)",
                                color = if (isSelected) Color.White else MaterialTheme.colorScheme.onSurface,
                                style = MaterialTheme.typography.labelMedium,
                                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                                modifier = Modifier.padding(horizontal = 14.dp, vertical = 8.dp)
                            )
                        }
                    }
                }
            }

            // Bottom Selected Incident Card
            AnimatedVisibility(
                visible = uiState.selectedIncident != null,
                enter = slideInVertically(initialOffsetY = { it }),
                exit = slideOutVertically(targetOffsetY = { it }),
                modifier = Modifier
                    .fillMaxWidth()
                    .align(Alignment.BottomCenter)
                    .padding(16.dp)
            ) {
                uiState.selectedIncident?.let { incident ->
                    Card(
                        shape = RoundedCornerShape(24.dp),
                        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                        elevation = CardDefaults.cardElevation(defaultElevation = 6.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Column(
                            modifier = Modifier.padding(16.dp)
                        ) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    SeverityBadge(severity = incident.severity)
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Surface(
                                        color = CivicBlue.copy(alpha = 0.12f),
                                        shape = RoundedCornerShape(8.dp)
                                    ) {
                                        Text(
                                            text = HazardCategories.getDisplayName(incident.category),
                                            color = CivicBlue,
                                            style = MaterialTheme.typography.labelSmall,
                                            fontWeight = FontWeight.Bold,
                                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                                        )
                                    }
                                }

                                IconButton(
                                    onClick = { viewModel.onIncidentSelected(null) },
                                    modifier = Modifier.size(28.dp)
                                ) {
                                    Icon(Icons.Default.Close, contentDescription = "Close card")
                                }
                            }

                            Spacer(modifier = Modifier.height(10.dp))

                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.spacedBy(12.dp)
                            ) {
                                if (!incident.imageUrl.isNullOrBlank()) {
                                    AsyncImage(
                                        model = incident.imageUrl,
                                        contentDescription = null,
                                        contentScale = ContentScale.Crop,
                                        modifier = Modifier
                                            .size(72.dp)
                                            .clip(RoundedCornerShape(12.dp))
                                    )
                                }

                                Column(modifier = Modifier.weight(1f)) {
                                    Text(
                                        text = incident.description ?: "Civic hazard reported in area.",
                                        style = MaterialTheme.typography.bodyMedium,
                                        fontWeight = FontWeight.Medium,
                                        maxLines = 2
                                    )
                                    Spacer(modifier = Modifier.height(4.dp))
                                    Row(verticalAlignment = Alignment.CenterVertically) {
                                        Icon(
                                            imageVector = Icons.Default.ThumbUp,
                                            contentDescription = null,
                                            tint = MaterialTheme.colorScheme.onSurfaceVariant,
                                            modifier = Modifier.size(14.dp)
                                        )
                                        Spacer(modifier = Modifier.width(4.dp))
                                        Text(
                                            text = "${incident.confirmationsCount} citizen confirmations",
                                            style = MaterialTheme.typography.labelSmall,
                                            color = MaterialTheme.colorScheme.onSurfaceVariant
                                        )
                                    }
                                }
                            }

                            Spacer(modifier = Modifier.height(14.dp))

                            CivicPillButton(
                                text = "View Incident Details",
                                onClick = {
                                    val incId = incident.incidentId ?: incident.id
                                    onNavigateToIncidentDetail(incId)
                                },
                                testTag = "map_view_details_button",
                                modifier = Modifier.fillMaxWidth()
                            )
                        }
                    }
                }
            }
        }
    }
}

