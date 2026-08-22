package com.example.ui.components

import androidx.compose.animation.animateColorAsState
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Assignment
import androidx.compose.material.icons.filled.CameraAlt
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Engineering
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.Map
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material.icons.filled.WaterDamage
import androidx.compose.material.icons.outlined.Assignment
import androidx.compose.material.icons.outlined.Home
import androidx.compose.material.icons.outlined.Map
import androidx.compose.material.icons.outlined.Notifications
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.model.HazardCategories
import com.example.data.model.ReportStatus
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
import com.example.ui.theme.SeverityCritical
import com.example.ui.theme.SeverityCriticalContainer
import com.example.ui.theme.SeverityHigh
import com.example.ui.theme.SeverityHighContainer
import com.example.ui.theme.SeverityMedium
import com.example.ui.theme.SeverityMediumContainer
import com.example.ui.theme.SeverityResolved
import com.example.ui.theme.SeverityResolvedContainer

/**
 * Pill-shaped primary button with smooth ripple, friendly typography and elevated style
 */
@Composable
fun CivicPillButton(
    text: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    enabled: Boolean = true,
    isLoading: Boolean = false,
    icon: ImageVector? = null,
    testTag: String = "civic_pill_button",
    containerColor: Color = CivicBlue,
    contentColor: Color = Color.White
) {
    Button(
        onClick = onClick,
        enabled = enabled && !isLoading,
        shape = RoundedCornerShape(percent = 50),
        colors = ButtonDefaults.buttonColors(
            containerColor = containerColor,
            contentColor = contentColor,
            disabledContainerColor = containerColor.copy(alpha = 0.4f),
            disabledContentColor = contentColor.copy(alpha = 0.7f)
        ),
        elevation = ButtonDefaults.buttonElevation(defaultElevation = 2.dp, pressedElevation = 0.dp),
        contentPadding = PaddingValues(horizontal = 24.dp, vertical = 14.dp),
        modifier = modifier
            .testTag(testTag)
            .height(52.dp)
    ) {
        if (isLoading) {
            CircularProgressIndicator(
                color = contentColor,
                strokeWidth = 2.5.dp,
                modifier = Modifier.size(20.dp)
            )
            Spacer(modifier = Modifier.width(10.dp))
        } else if (icon != null) {
            Icon(
                imageVector = icon,
                contentDescription = null,
                modifier = Modifier.size(20.dp)
            )
            Spacer(modifier = Modifier.width(8.dp))
        }
        Text(
            text = text,
            style = MaterialTheme.typography.labelLarge,
            fontWeight = FontWeight.Bold,
            fontSize = 15.sp
        )
    }
}

@Composable
fun CivicOutlinedPillButton(
    text: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    enabled: Boolean = true,
    icon: ImageVector? = null,
    testTag: String = "civic_outlined_button"
) {
    OutlinedButton(
        onClick = onClick,
        enabled = enabled,
        shape = RoundedCornerShape(percent = 50),
        border = androidx.compose.foundation.BorderStroke(1.5.dp, CivicBlue),
        contentPadding = PaddingValues(horizontal = 22.dp, vertical = 12.dp),
        modifier = modifier
            .testTag(testTag)
            .height(48.dp)
    ) {
        if (icon != null) {
            Icon(
                imageVector = icon,
                contentDescription = null,
                tint = CivicBlue,
                modifier = Modifier.size(18.dp)
            )
            Spacer(modifier = Modifier.width(8.dp))
        }
        Text(
            text = text,
            style = MaterialTheme.typography.labelLarge,
            fontWeight = FontWeight.Bold,
            color = CivicBlue
        )
    }
}

/**
 * Clean friendly card with white surface, soft border and subtle shadow
 */
@Composable
fun CivicFriendlyCard(
    modifier: Modifier = Modifier,
    onClick: (() -> Unit)? = null,
    content: @Composable () -> Unit
) {
    Card(
        shape = RoundedCornerShape(24.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        border = androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp),
        modifier = modifier.then(
            if (onClick != null) Modifier.clickable { onClick() } else Modifier
        )
    ) {
        content()
    }
}

/**
 * 4-color severity scheme
 */
fun getSeverityColors(severity: String?): Pair<Color, Color> {
    return when (severity?.lowercase()) {
        "critical" -> SeverityCritical to SeverityCriticalContainer
        "high" -> SeverityHigh to SeverityHighContainer
        "medium" -> SeverityMedium to SeverityMediumContainer
        "resolved" -> SeverityResolved to SeverityResolvedContainer
        else -> SeverityMedium to SeverityMediumContainer
    }
}

@Composable
fun SeverityBadge(
    severity: String?,
    modifier: Modifier = Modifier
) {
    val (textColor, bgColor) = getSeverityColors(severity)
    val label = severity?.replaceFirstChar { it.uppercase() } ?: "Medium"

    Surface(
        color = bgColor,
        shape = RoundedCornerShape(percent = 50),
        border = androidx.compose.foundation.BorderStroke(1.dp, textColor.copy(alpha = 0.3f)),
        modifier = modifier
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp)
        ) {
            Box(
                modifier = Modifier
                    .size(8.dp)
                    .background(textColor, CircleShape)
            )
            Spacer(modifier = Modifier.width(6.dp))
            Text(
                text = label,
                color = textColor,
                style = MaterialTheme.typography.labelSmall,
                fontWeight = FontWeight.Bold
            )
        }
    }
}

fun getHazardCategoryIcon(category: String?): ImageVector {
    return when (category?.lowercase()) {
        HazardCategories.POTHOLE -> Icons.Default.Warning
        HazardCategories.FLOODED_ROAD -> Icons.Default.WaterDamage
        HazardCategories.GARBAGE_PILE -> Icons.Default.Delete
        HazardCategories.DAMAGED_ROAD -> Icons.Default.Engineering
        else -> Icons.Default.LocationOn
    }
}

fun getHazardCategoryColors(category: String?): Pair<Color, Color> {
    return when (category?.lowercase()) {
        HazardCategories.POTHOLE -> CategoryPotholeBg to CategoryPotholeTint
        HazardCategories.FLOODED_ROAD -> CategoryFloodingBg to CategoryFloodingTint
        HazardCategories.GARBAGE_PILE -> CategoryTrashBg to CategoryTrashTint
        HazardCategories.DAMAGED_ROAD -> CategoryDamageBg to CategoryDamageTint
        else -> CivicBlueContainer to CivicBlue
    }
}

@Composable
fun CategoryChip(
    category: String,
    isSelected: Boolean,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    val displayName = HazardCategories.getDisplayName(category)
    val icon = getHazardCategoryIcon(category)
    val (_, categoryTint) = getHazardCategoryColors(category)

    val bgColor by animateColorAsState(
        if (isSelected) CivicBlue else MaterialTheme.colorScheme.surface,
        label = "chip_bg"
    )
    val contentColor by animateColorAsState(
        if (isSelected) Color.White else MaterialTheme.colorScheme.onSurface,
        label = "chip_content"
    )

    Surface(
        color = bgColor,
        shape = RoundedCornerShape(percent = 50),
        border = androidx.compose.foundation.BorderStroke(
            1.dp,
            if (isSelected) CivicBlue else MaterialTheme.colorScheme.outlineVariant
        ),
        shadowElevation = if (isSelected) 2.dp else 0.dp,
        modifier = modifier
            .clip(RoundedCornerShape(percent = 50))
            .clickable { onClick() }
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier.padding(horizontal = 14.dp, vertical = 8.dp)
        ) {
            Icon(
                imageVector = icon,
                contentDescription = null,
                tint = if (isSelected) Color.White else categoryTint,
                modifier = Modifier.size(16.dp)
            )
            Spacer(modifier = Modifier.width(6.dp))
            Text(
                text = displayName,
                color = contentColor,
                style = MaterialTheme.typography.labelMedium,
                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium
            )
        }
    }
}

/**
 * 7-stage Status progression display:
 * Submitted → Under review → Confirmed → Assigned → Team dispatched → In progress → Resolved
 */
@Composable
fun StatusProgressionTimeline(
    currentStatus: String,
    modifier: Modifier = Modifier
) {
    val steps = listOf(
        "Submitted",
        "Under review",
        "Confirmed",
        "Assigned",
        "Dispatched",
        "In progress",
        "Resolved"
    )

    val currentEnum = ReportStatus.fromRaw(currentStatus)
    val activeIndex = currentEnum.stepIndex

    Column(
        modifier = modifier
            .fillMaxWidth()
            .background(MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f), RoundedCornerShape(20.dp))
            .border(1.dp, MaterialTheme.colorScheme.outlineVariant, RoundedCornerShape(20.dp))
            .padding(16.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "Resolution Status",
                style = MaterialTheme.typography.titleSmall,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onSurface
            )
            Surface(
                color = if (currentEnum == ReportStatus.RESOLVED) SeverityResolvedContainer else CivicBlueContainer,
                shape = RoundedCornerShape(percent = 50),
                border = androidx.compose.foundation.BorderStroke(
                    1.dp,
                    if (currentEnum == ReportStatus.RESOLVED) SeverityResolved.copy(alpha = 0.3f) else CivicBlue.copy(alpha = 0.3f)
                )
            ) {
                Text(
                    text = currentEnum.displayName,
                    color = if (currentEnum == ReportStatus.RESOLVED) SeverityResolved else CivicBlue,
                    style = MaterialTheme.typography.labelSmall,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp)
                )
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Visual step indicators
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            steps.forEachIndexed { index, title ->
                val isCompleted = index <= activeIndex
                val isCurrent = index == activeIndex

                Box(
                    contentAlignment = Alignment.Center,
                    modifier = Modifier
                        .size(24.dp)
                        .background(
                            color = when {
                                isCurrent -> CivicBlue
                                isCompleted -> SeverityResolved
                                else -> MaterialTheme.colorScheme.outlineVariant
                            },
                            shape = CircleShape
                        )
                ) {
                    if (isCompleted && !isCurrent) {
                        Icon(
                            imageVector = Icons.Default.Check,
                            contentDescription = null,
                            tint = Color.White,
                            modifier = Modifier.size(13.dp)
                        )
                    } else {
                        Text(
                            text = "${index + 1}",
                            color = if (isCurrent || isCompleted) Color.White else MaterialTheme.colorScheme.onSurfaceVariant,
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }

                // Connecting line between steps
                if (index < steps.size - 1) {
                    Box(
                        modifier = Modifier
                            .weight(1f)
                            .height(3.dp)
                            .background(
                                color = if (index < activeIndex) SeverityResolved else MaterialTheme.colorScheme.outlineVariant,
                                shape = RoundedCornerShape(percent = 50)
                            )
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(10.dp))

        // Labels underneath for key checkpoints
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Text(
                text = "1. Submitted",
                style = MaterialTheme.typography.labelSmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                fontSize = 11.sp
            )
            Text(
                text = "4. Dispatched",
                style = MaterialTheme.typography.labelSmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                fontSize = 11.sp
            )
            Text(
                text = "7. Resolved",
                style = MaterialTheme.typography.labelSmall,
                color = if (currentEnum == ReportStatus.RESOLVED) SeverityResolved else MaterialTheme.colorScheme.onSurfaceVariant,
                fontWeight = if (currentEnum == ReportStatus.RESOLVED) FontWeight.Bold else FontWeight.Normal,
                fontSize = 11.sp
            )
        }
    }
}

/**
 * Modern, clean Bottom Navigation Bar for easy citizen exploration
 */
@Composable
fun CivicBottomNavigation(
    currentRoute: String,
    onNavigateToHome: () -> Unit,
    onNavigateToMap: () -> Unit,
    onNavigateToMyReports: () -> Unit,
    onNavigateToAlerts: () -> Unit,
    modifier: Modifier = Modifier
) {
    NavigationBar(
        containerColor = MaterialTheme.colorScheme.surface,
        tonalElevation = 8.dp,
        modifier = modifier
            .border(
                width = 1.dp,
                color = MaterialTheme.colorScheme.outlineVariant,
                shape = RoundedCornerShape(topStart = 20.dp, topEnd = 20.dp)
            )
            .clip(RoundedCornerShape(topStart = 20.dp, topEnd = 20.dp))
            .navigationBarsPadding()
    ) {
        NavigationBarItem(
            selected = currentRoute == "home",
            onClick = onNavigateToHome,
            icon = {
                Icon(
                    imageVector = if (currentRoute == "home") Icons.Filled.Home else Icons.Outlined.Home,
                    contentDescription = "Home"
                )
            },
            label = {
                Text(
                    text = "Home",
                    style = MaterialTheme.typography.labelSmall,
                    fontWeight = if (currentRoute == "home") FontWeight.Bold else FontWeight.Medium
                )
            },
            colors = NavigationBarItemDefaults.colors(
                selectedIconColor = CivicBlue,
                selectedTextColor = CivicBlue,
                indicatorColor = CivicBlueContainer,
                unselectedIconColor = MaterialTheme.colorScheme.onSurfaceVariant,
                unselectedTextColor = MaterialTheme.colorScheme.onSurfaceVariant
            )
        )

        NavigationBarItem(
            selected = currentRoute == "map",
            onClick = onNavigateToMap,
            icon = {
                Icon(
                    imageVector = if (currentRoute == "map") Icons.Filled.Map else Icons.Outlined.Map,
                    contentDescription = "Map"
                )
            },
            label = {
                Text(
                    text = "Map",
                    style = MaterialTheme.typography.labelSmall,
                    fontWeight = if (currentRoute == "map") FontWeight.Bold else FontWeight.Medium
                )
            },
            colors = NavigationBarItemDefaults.colors(
                selectedIconColor = CivicBlue,
                selectedTextColor = CivicBlue,
                indicatorColor = CivicBlueContainer,
                unselectedIconColor = MaterialTheme.colorScheme.onSurfaceVariant,
                unselectedTextColor = MaterialTheme.colorScheme.onSurfaceVariant
            )
        )

        NavigationBarItem(
            selected = currentRoute == "my_reports",
            onClick = onNavigateToMyReports,
            icon = {
                Icon(
                    imageVector = if (currentRoute == "my_reports") Icons.Filled.Assignment else Icons.Outlined.Assignment,
                    contentDescription = "My Reports"
                )
            },
            label = {
                Text(
                    text = "My Reports",
                    style = MaterialTheme.typography.labelSmall,
                    fontWeight = if (currentRoute == "my_reports") FontWeight.Bold else FontWeight.Medium
                )
            },
            colors = NavigationBarItemDefaults.colors(
                selectedIconColor = CivicBlue,
                selectedTextColor = CivicBlue,
                indicatorColor = CivicBlueContainer,
                unselectedIconColor = MaterialTheme.colorScheme.onSurfaceVariant,
                unselectedTextColor = MaterialTheme.colorScheme.onSurfaceVariant
            )
        )

        NavigationBarItem(
            selected = currentRoute == "alerts",
            onClick = onNavigateToAlerts,
            icon = {
                Icon(
                    imageVector = if (currentRoute == "alerts") Icons.Filled.Notifications else Icons.Outlined.Notifications,
                    contentDescription = "Alerts"
                )
            },
            label = {
                Text(
                    text = "Alerts",
                    style = MaterialTheme.typography.labelSmall,
                    fontWeight = if (currentRoute == "alerts") FontWeight.Bold else FontWeight.Medium
                )
            },
            colors = NavigationBarItemDefaults.colors(
                selectedIconColor = CivicBlue,
                selectedTextColor = CivicBlue,
                indicatorColor = CivicBlueContainer,
                unselectedIconColor = MaterialTheme.colorScheme.onSurfaceVariant,
                unselectedTextColor = MaterialTheme.colorScheme.onSurfaceVariant
            )
        )
    }
}

