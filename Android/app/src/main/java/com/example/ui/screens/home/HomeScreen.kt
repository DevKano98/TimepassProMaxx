package com.example.ui.screens.home

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.background
import androidx.compose.foundation.border
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
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.filled.Assignment
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.Build
import androidx.compose.material.icons.filled.CameraAlt
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Engineering
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.Map
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material.icons.filled.Security
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material.icons.filled.WaterDrop
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
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
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.model.AlertItem
import com.example.ui.components.CivicBottomNavigation
import com.example.ui.components.CivicFriendlyCard
import com.example.ui.components.CivicPillButton
import com.example.ui.components.SeverityBadge
import com.example.ui.theme.CategoryDamageBg
import com.example.ui.theme.CategoryDamageTint
import com.example.ui.theme.CategoryFloodingBg
import com.example.ui.theme.CategoryFloodingTint
import com.example.ui.theme.CategoryPotholeBg
import com.example.ui.theme.CategoryPotholeTint
import com.example.ui.theme.CategoryTrashBg
import com.example.ui.theme.CategoryTrashTint
import com.example.ui.theme.CivicBlue
import com.example.ui.theme.CivicBlueContainer
import com.example.ui.theme.CivicBlueDark
import com.example.ui.theme.SeverityHigh
import com.example.ui.theme.SeverityResolved
import com.example.ui.theme.SeverityResolvedContainer

@Composable
fun HomeScreen(
    viewModel: HomeViewModel,
    onNavigateToReport: () -> Unit,
    onNavigateToMap: () -> Unit,
    onNavigateToMyReports: () -> Unit,
    onNavigateToAlerts: () -> Unit,
    onNavigateToLogin: () -> Unit
) {
    val uiState by viewModel.uiState.collectAsState()
    val isLoggedIn by viewModel.isLoggedIn.collectAsState()

    Scaffold(
        bottomBar = {
            CivicBottomNavigation(
                currentRoute = "home",
                onNavigateToHome = { /* Already here */ },
                onNavigateToMap = onNavigateToMap,
                onNavigateToMyReports = {
                    if (isLoggedIn) onNavigateToMyReports() else onNavigateToLogin()
                },
                onNavigateToAlerts = onNavigateToAlerts
            )
        },
        containerColor = MaterialTheme.colorScheme.background
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .verticalScroll(rememberScrollState())
        ) {
            // Header / App Bar with Friendly Citizen Greeting
            HomeTopBar(
                isLoggedIn = isLoggedIn,
                userEmail = uiState.userEmail,
                onAlertsClick = onNavigateToAlerts,
                onLoginClick = onNavigateToLogin,
                onLogoutClick = { viewModel.logout() }
            )

            // Welcoming Hero Section
            HeroCard(
                onReportClick = onNavigateToReport
            )

            Spacer(modifier = Modifier.height(24.dp))

            // Quick Category Shortcuts Section
            QuickReportCategoriesSection(
                onReportCategory = { onNavigateToReport() }
            )

            Spacer(modifier = Modifier.height(24.dp))

            // How It Works in 3 Easy Steps
            HowItWorksSection()

            Spacer(modifier = Modifier.height(24.dp))

            // Active Hazard Alerts Board
            ActiveAlertsStrip(
                alerts = uiState.alerts,
                isLoading = uiState.isLoadingAlerts,
                onViewAllAlerts = onNavigateToAlerts
            )

            Spacer(modifier = Modifier.height(24.dp))

            // Community Transparency Badge
            CommunityTransparencyCard()

            Spacer(modifier = Modifier.height(32.dp))
        }
    }
}

@Composable
private fun HomeTopBar(
    isLoggedIn: Boolean,
    userEmail: String?,
    onAlertsClick: () -> Unit,
    onLoginClick: () -> Unit,
    onLogoutClick: () -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 20.dp, vertical = 14.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Box(
                modifier = Modifier
                    .size(42.dp)
                    .background(CivicBlueContainer, CircleShape)
                    .border(1.5.dp, CivicBlue.copy(alpha = 0.3f), CircleShape),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = Icons.Default.Security,
                    contentDescription = null,
                    tint = CivicBlue,
                    modifier = Modifier.size(24.dp)
                )
            }
            Spacer(modifier = Modifier.width(12.dp))
            Column {
                Text(
                    text = "CivicGuard",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.ExtraBold,
                    color = MaterialTheme.colorScheme.onBackground
                )
                Text(
                    text = if (isLoggedIn) (userEmail?.substringBefore("@")?.let { "Welcome, $it" } ?: "Verified Citizen") else "Making streets safer together",
                    style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }

        Row(verticalAlignment = Alignment.CenterVertically) {
            IconButton(
                onClick = onAlertsClick,
                modifier = Modifier.testTag("top_bar_alerts_button")
            ) {
                Box {
                    Icon(
                        imageVector = Icons.Default.Notifications,
                        contentDescription = "Alerts",
                        tint = MaterialTheme.colorScheme.onSurface
                    )
                    Box(
                        modifier = Modifier
                            .size(8.dp)
                            .background(SeverityHigh, CircleShape)
                            .align(Alignment.TopEnd)
                    )
                }
            }

            Spacer(modifier = Modifier.width(4.dp))

            if (!isLoggedIn) {
                Surface(
                    color = CivicBlueContainer,
                    shape = RoundedCornerShape(percent = 50),
                    border = androidx.compose.foundation.BorderStroke(1.dp, CivicBlue.copy(alpha = 0.3f)),
                    modifier = Modifier
                        .clip(RoundedCornerShape(percent = 50))
                        .clickable { onLoginClick() }
                ) {
                    Text(
                        text = "Sign In",
                        color = CivicBlue,
                        style = MaterialTheme.typography.labelMedium,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.padding(horizontal = 14.dp, vertical = 8.dp)
                    )
                }
            } else {
                Surface(
                    color = MaterialTheme.colorScheme.surfaceVariant,
                    shape = RoundedCornerShape(percent = 50),
                    modifier = Modifier
                        .clip(RoundedCornerShape(percent = 50))
                        .clickable { onLogoutClick() }
                ) {
                    Text(
                        text = "Sign Out",
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        style = MaterialTheme.typography.labelSmall,
                        fontWeight = FontWeight.Medium,
                        modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp)
                    )
                }
            }
        }
    }
}

@Composable
private fun HeroCard(
    onReportClick: () -> Unit
) {
    Card(
        shape = RoundedCornerShape(28.dp),
        colors = CardDefaults.cardColors(containerColor = Color.Transparent),
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp),
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 20.dp)
    ) {
        Box(
            modifier = Modifier
                .background(
                    Brush.linearGradient(
                        colors = listOf(CivicBlue, CivicBlueDark)
                    )
                )
                .padding(24.dp)
        ) {
            Column {
                Surface(
                    color = Color.White.copy(alpha = 0.2f),
                    shape = RoundedCornerShape(percent = 50)
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Security,
                            contentDescription = null,
                            tint = Color.White,
                            modifier = Modifier.size(14.dp)
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = "Citizen Direct Dispatch",
                            color = Color.White,
                            style = MaterialTheme.typography.labelSmall,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                Text(
                    text = "See a hazard?\nLet's get it fixed.",
                    style = MaterialTheme.typography.headlineMedium,
                    fontWeight = FontWeight.ExtraBold,
                    color = Color.White,
                    lineHeight = 32.sp
                )

                Spacer(modifier = Modifier.height(8.dp))

                Text(
                    text = "Snap a photo of potholes, floods, or debris. AI classifies urgency and alerts municipal crews instantly.",
                    style = MaterialTheme.typography.bodyMedium,
                    color = Color.White.copy(alpha = 0.92f)
                )

                Spacer(modifier = Modifier.height(20.dp))

                CivicPillButton(
                    text = "Report a Hazard Now",
                    icon = Icons.Default.CameraAlt,
                    onClick = onReportClick,
                    containerColor = Color.White,
                    contentColor = CivicBlue,
                    testTag = "report_issue_hero_button",
                    modifier = Modifier.fillMaxWidth()
                )
            }
        }
    }
}

@Composable
private fun QuickReportCategoriesSection(
    onReportCategory: (String) -> Unit
) {
    Column(modifier = Modifier.fillMaxWidth().padding(horizontal = 20.dp)) {
        Text(
            text = "Common Hazards to Report",
            style = MaterialTheme.typography.titleMedium,
            fontWeight = FontWeight.Bold,
            color = MaterialTheme.colorScheme.onBackground
        )

        Spacer(modifier = Modifier.height(12.dp))

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            QuickCategoryCard(
                icon = Icons.Default.Warning,
                title = "Potholes",
                bgColor = CategoryPotholeBg,
                tint = CategoryPotholeTint,
                modifier = Modifier.weight(1f),
                onClick = { onReportCategory("pothole") }
            )
            QuickCategoryCard(
                icon = Icons.Default.WaterDrop,
                title = "Flooding",
                bgColor = CategoryFloodingBg,
                tint = CategoryFloodingTint,
                modifier = Modifier.weight(1f),
                onClick = { onReportCategory("flooded_road") }
            )
            QuickCategoryCard(
                icon = Icons.Default.Delete,
                title = "Trash Pile",
                bgColor = CategoryTrashBg,
                tint = CategoryTrashTint,
                modifier = Modifier.weight(1f),
                onClick = { onReportCategory("garbage_pile") }
            )
            QuickCategoryCard(
                icon = Icons.Default.Build,
                title = "Damage",
                bgColor = CategoryDamageBg,
                tint = CategoryDamageTint,
                modifier = Modifier.weight(1f),
                onClick = { onReportCategory("damaged_road") }
            )
        }
    }
}

@Composable
private fun QuickCategoryCard(
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    title: String,
    bgColor: Color,
    tint: Color,
    modifier: Modifier = Modifier,
    onClick: () -> Unit
) {
    Card(
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(containerColor = bgColor),
        border = androidx.compose.foundation.BorderStroke(1.dp, tint.copy(alpha = 0.2f)),
        modifier = modifier
            .clickable { onClick() }
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 14.dp, horizontal = 6.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Icon(
                imageVector = icon,
                contentDescription = null,
                tint = tint,
                modifier = Modifier.size(24.dp)
            )
            Spacer(modifier = Modifier.height(6.dp))
            Text(
                text = title,
                style = MaterialTheme.typography.labelSmall,
                fontWeight = FontWeight.Bold,
                color = tint
            )
        }
    }
}

@Composable
private fun HowItWorksSection() {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 20.dp)
    ) {
        Text(
            text = "How CivicGuard Works",
            style = MaterialTheme.typography.titleMedium,
            fontWeight = FontWeight.Bold,
            color = MaterialTheme.colorScheme.onBackground
        )

        Spacer(modifier = Modifier.height(12.dp))

        CivicFriendlyCard(
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(18.dp)) {
                HowItWorksRow(
                    stepNumber = "1",
                    icon = Icons.Default.CameraAlt,
                    iconBg = CivicBlueContainer,
                    iconTint = CivicBlue,
                    title = "Snap a photo of the issue",
                    description = "Capture the hazard and let GPS pinpoint the exact coordinates."
                )

                Spacer(modifier = Modifier.height(14.dp))

                HowItWorksRow(
                    stepNumber = "2",
                    icon = Icons.Default.AutoAwesome,
                    iconBg = CategoryFloodingBg,
                    iconTint = CategoryFloodingTint,
                    title = "AI classifies & prioritizes",
                    description = "Computer vision models analyze the severity and route to the correct team."
                )

                Spacer(modifier = Modifier.height(14.dp))

                HowItWorksRow(
                    stepNumber = "3",
                    icon = Icons.Default.Engineering,
                    iconBg = SeverityResolvedContainer,
                    iconTint = SeverityResolved,
                    title = "City crew dispatches & fixes",
                    description = "Watch the 7-stage live status tracker as repairs get completed."
                )
            }
        }
    }
}

@Composable
private fun HowItWorksRow(
    stepNumber: String,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    iconBg: Color,
    iconTint: Color,
    title: String,
    description: String
) {
    Row(verticalAlignment = Alignment.Top) {
        Box(
            modifier = Modifier
                .size(38.dp)
                .background(iconBg, CircleShape)
                .border(1.dp, iconTint.copy(alpha = 0.2f), CircleShape),
            contentAlignment = Alignment.Center
        ) {
            Icon(
                imageVector = icon,
                contentDescription = null,
                tint = iconTint,
                modifier = Modifier.size(20.dp)
            )
        }
        Spacer(modifier = Modifier.width(12.dp))
        Column {
            Text(
                text = title,
                style = MaterialTheme.typography.titleSmall,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onSurface
            )
            Spacer(modifier = Modifier.height(2.dp))
            Text(
                text = description,
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                lineHeight = 16.sp
            )
        }
    }
}

@Composable
private fun ActiveAlertsStrip(
    alerts: List<AlertItem>,
    isLoading: Boolean,
    onViewAllAlerts: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 20.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(
                    imageVector = Icons.Default.Notifications,
                    contentDescription = null,
                    tint = SeverityHigh,
                    modifier = Modifier.size(20.dp)
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = "Active Hazard Bulletins",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onBackground
                )
            }

            Text(
                text = "View All",
                style = MaterialTheme.typography.labelMedium,
                fontWeight = FontWeight.Bold,
                color = CivicBlue,
                modifier = Modifier
                    .clickable { onViewAllAlerts() }
                    .padding(4.dp)
            )
        }

        Spacer(modifier = Modifier.height(10.dp))

        if (isLoading) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(90.dp),
                contentAlignment = Alignment.Center
            ) {
                CircularProgressIndicator(modifier = Modifier.size(24.dp), color = CivicBlue)
            }
        } else if (alerts.isEmpty()) {
            CivicFriendlyCard(
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier.padding(16.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        imageVector = Icons.Default.CheckCircle,
                        contentDescription = null,
                        tint = SeverityResolved,
                        modifier = Modifier.size(24.dp)
                    )
                    Spacer(modifier = Modifier.width(12.dp))
                    Text(
                        text = "All clear! No severe road or utility advisories active right now.",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
        } else {
            val firstAlert = alerts.first()
            CivicFriendlyCard(
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable { onViewAllAlerts() }
            ) {
                Column(
                    modifier = Modifier.padding(16.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        SeverityBadge(severity = firstAlert.severity)
                        firstAlert.affectedArea?.let {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(
                                    imageVector = Icons.Default.LocationOn,
                                    contentDescription = null,
                                    tint = MaterialTheme.colorScheme.onSurfaceVariant,
                                    modifier = Modifier.size(14.dp)
                                )
                                Spacer(modifier = Modifier.width(2.dp))
                                Text(
                                    text = it,
                                    style = MaterialTheme.typography.labelSmall,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            }
                        }
                    }
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = firstAlert.title,
                        style = MaterialTheme.typography.titleSmall,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = firstAlert.message,
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        maxLines = 2
                    )
                }
            }
        }
    }
}

@Composable
private fun CommunityTransparencyCard() {
    CivicFriendlyCard(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 20.dp)
    ) {
        Row(
            modifier = Modifier.padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .size(40.dp)
                    .background(CivicBlueContainer, CircleShape),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = Icons.Default.Security,
                    contentDescription = null,
                    tint = CivicBlue,
                    modifier = Modifier.size(22.dp)
                )
            }
            Spacer(modifier = Modifier.width(14.dp))
            Column {
                Text(
                    text = "Transparent City Governance",
                    style = MaterialTheme.typography.titleSmall,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = "All submitted data syncs directly to the municipal team for verification and rapid resolution.",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }
    }
}

