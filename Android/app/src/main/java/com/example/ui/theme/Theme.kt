package com.example.ui.theme

import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Shapes
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp

val CivicShapes = Shapes(
    small = RoundedCornerShape(12.dp),
    medium = RoundedCornerShape(18.dp),
    large = RoundedCornerShape(24.dp), // 24px-radius cards
    extraLarge = RoundedCornerShape(32.dp)
)

// Clean, bright, and friendly Light Color Scheme
private val LightColorScheme = lightColorScheme(
    primary = CivicBlue,
    onPrimary = Color.White,
    primaryContainer = CivicBlueContainer,
    onPrimaryContainer = CivicBlueDark,
    secondary = Color(0xFF3B82F6),
    onSecondary = Color.White,
    secondaryContainer = Color(0xFFEFF6FF),
    onSecondaryContainer = Color(0xFF1D4ED8),
    tertiary = SeverityHigh,
    onTertiary = Color.White,
    tertiaryContainer = SeverityHighContainer,
    onTertiaryContainer = SeverityHigh,
    background = BackgroundLight,
    onBackground = OnSurfaceLight,
    surface = SurfaceLight,
    onSurface = OnSurfaceLight,
    surfaceVariant = SurfaceVariantLight,
    onSurfaceVariant = OnSurfaceVariantLight,
    outline = OutlineLight,
    outlineVariant = Color(0xFFE2E8F0),
    error = SeverityCritical,
    onError = Color.White,
    errorContainer = SeverityCriticalContainer,
    onErrorContainer = SeverityCritical
)

@Composable
fun CivicGuardTheme(
    darkTheme: Boolean = false, // Enforce clean light mode for easy and friendly experience
    content: @Composable () -> Unit
) {
    // Pure Light Mode for ultra-friendly, high-contrast, clean citizen UI
    MaterialTheme(
        colorScheme = LightColorScheme,
        typography = Typography,
        shapes = CivicShapes,
        content = content
    )
}

