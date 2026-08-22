package com.example.ui.navigation

import android.net.Uri
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.platform.LocalContext
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavHostController
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.navArgument
import androidx.navigation.navDeepLink
import com.example.data.repository.CivicGuardRepository
import com.example.ui.screens.alerts.AlertsScreen
import com.example.ui.screens.alerts.AlertsViewModel
import com.example.ui.screens.auth.AuthViewModel
import com.example.ui.screens.auth.LoginOtpScreen
import com.example.ui.screens.confirmation.AiConfirmationScreen
import com.example.ui.screens.home.HomeScreen
import com.example.ui.screens.home.HomeViewModel
import com.example.ui.screens.incident.IncidentDetailScreen
import com.example.ui.screens.incident.IncidentDetailViewModel
import com.example.ui.screens.map.MapScreen
import com.example.ui.screens.map.MapViewModel
import com.example.ui.screens.myreports.MyReportsScreen
import com.example.ui.screens.myreports.MyReportsViewModel
import com.example.ui.screens.report.ReportScreen
import com.example.ui.screens.report.ReportViewModel
import java.net.URLDecoder
import java.nio.charset.StandardCharsets

@Composable
fun AppNavigation(
    navController: NavHostController,
    repository: CivicGuardRepository,
    startDestination: String = Screen.Home.route
) {
    NavHost(
        navController = navController,
        startDestination = startDestination
    ) {
        // 1. Home Screen
        composable(Screen.Home.route) {
            val homeViewModel = remember { HomeViewModel(repository) }
            HomeScreen(
                viewModel = homeViewModel,
                onNavigateToReport = { navController.navigate(Screen.Report.route) },
                onNavigateToMap = { navController.navigate(Screen.Map.route) },
                onNavigateToMyReports = { navController.navigate(Screen.MyReports.route) },
                onNavigateToAlerts = { navController.navigate(Screen.Alerts.route) },
                onNavigateToLogin = { navController.navigate(Screen.LoginOtp.createRoute("home", false)) }
            )
        }

        // 2. Report Issue Screen
        composable(Screen.Report.route) {
            val reportViewModel = remember { ReportViewModel(repository) }
            ReportScreen(
                viewModel = reportViewModel,
                onNavigateBack = { navController.popBackStack() },
                onNavigateToAiConfirmation = { report, imageUrl ->
                    val route = Screen.AiConfirmation.createRoute(
                        reportId = report.reportId,
                        incidentId = report.incidentId ?: "none",
                        aiCategory = report.aiCategory ?: "none",
                        aiConfidence = report.aiConfidence ?: -1.0,
                        status = report.status,
                        imageUrl = imageUrl
                    )
                    navController.navigate(route) {
                        popUpTo(Screen.Home.route)
                    }
                },
                onTriggerOtpLogin = { _ ->
                    // 403 anonymous_limit_exceeded flow (§2) -> goes to OTP screen with retryReport = true
                    navController.navigate(Screen.LoginOtp.createRoute(returnDest = "report", retryReport = true))
                }
            )
        }

        // 3. AI Confirmation Screen
        composable(
            route = Screen.AiConfirmation.route,
            arguments = listOf(
                navArgument("reportId") { type = NavType.StringType },
                navArgument("incidentId") { type = NavType.StringType },
                navArgument("aiCategory") { type = NavType.StringType },
                navArgument("aiConfidence") { type = NavType.FloatType },
                navArgument("status") { type = NavType.StringType },
                navArgument("imageUrl") { type = NavType.StringType }
            )
        ) { backStackEntry ->
            val reportId = backStackEntry.arguments?.getString("reportId") ?: ""
            val incidentId = backStackEntry.arguments?.getString("incidentId") ?: ""
            val rawCategory = backStackEntry.arguments?.getString("aiCategory") ?: ""
            val aiCategory = URLDecoder.decode(rawCategory, StandardCharsets.UTF_8.toString())
            val aiConfidence = backStackEntry.arguments?.getFloat("aiConfidence")?.toDouble()
            val rawStatus = backStackEntry.arguments?.getString("status") ?: "submitted"
            val status = URLDecoder.decode(rawStatus, StandardCharsets.UTF_8.toString())
            val rawImg = backStackEntry.arguments?.getString("imageUrl") ?: ""
            val imageUrl = URLDecoder.decode(rawImg, StandardCharsets.UTF_8.toString())

            AiConfirmationScreen(
                reportId = reportId,
                incidentId = incidentId,
                aiCategory = aiCategory,
                aiConfidence = aiConfidence,
                status = status,
                imageUrl = imageUrl,
                onNavigateHome = {
                    navController.navigate(Screen.Home.route) {
                        popUpTo(Screen.Home.route) { inclusive = true }
                    }
                },
                onNavigateToMap = {
                    navController.navigate(Screen.Map.route) {
                        popUpTo(Screen.Home.route)
                    }
                }
            )
        }

        // 4. Map Screen
        composable(Screen.Map.route) {
            val mapViewModel = remember { MapViewModel(repository) }
            MapScreen(
                viewModel = mapViewModel,
                onNavigateBack = { navController.popBackStack() },
                onNavigateToHome = {
                    navController.navigate(Screen.Home.route) {
                        popUpTo(Screen.Home.route) { inclusive = false }
                        launchSingleTop = true
                    }
                },
                onNavigateToMyReports = {
                    navController.navigate(Screen.MyReports.route) {
                        popUpTo(Screen.Home.route) { inclusive = false }
                        launchSingleTop = true
                    }
                },
                onNavigateToAlerts = {
                    navController.navigate(Screen.Alerts.route) {
                        popUpTo(Screen.Home.route) { inclusive = false }
                        launchSingleTop = true
                    }
                },
                onNavigateToReport = { navController.navigate(Screen.Report.route) },
                onNavigateToIncidentDetail = { incId ->
                    navController.navigate(Screen.IncidentDetail.createRoute(incId))
                }
            )
        }

        // 5. Incident Detail Screen
        composable(
            route = Screen.IncidentDetail.route,
            arguments = listOf(navArgument("incidentId") { type = NavType.StringType })
        ) { backStackEntry ->
            val incId = backStackEntry.arguments?.getString("incidentId") ?: ""
            val incidentViewModel = remember(incId) { IncidentDetailViewModel(incId, repository) }
            IncidentDetailScreen(
                viewModel = incidentViewModel,
                onNavigateBack = { navController.popBackStack() }
            )
        }

        // 6. My Reports Screen
        composable(
            route = Screen.MyReports.route,
            deepLinks = listOf(navDeepLink { uriPattern = "civicguard://navigate?destination=my_reports" })
        ) {
            val myReportsViewModel = remember { MyReportsViewModel(repository) }
            MyReportsScreen(
                viewModel = myReportsViewModel,
                onNavigateBack = { navController.popBackStack() },
                onNavigateToHome = {
                    navController.navigate(Screen.Home.route) {
                        popUpTo(Screen.Home.route) { inclusive = false }
                        launchSingleTop = true
                    }
                },
                onNavigateToMap = {
                    navController.navigate(Screen.Map.route) {
                        popUpTo(Screen.Home.route) { inclusive = false }
                        launchSingleTop = true
                    }
                },
                onNavigateToAlerts = {
                    navController.navigate(Screen.Alerts.route) {
                        popUpTo(Screen.Home.route) { inclusive = false }
                        launchSingleTop = true
                    }
                },
                onNavigateToLogin = {
                    navController.navigate(Screen.LoginOtp.createRoute(returnDest = "my_reports", retryReport = false))
                },
                onNavigateToReportDetail = { incId ->
                    navController.navigate(Screen.IncidentDetail.createRoute(incId))
                }
            )
        }

        // 7. Alerts Screen
        composable(
            route = Screen.Alerts.route,
            deepLinks = listOf(navDeepLink { uriPattern = "civicguard://navigate?destination=alerts" })
        ) {
            val alertsViewModel = remember { AlertsViewModel(repository) }
            AlertsScreen(
                viewModel = alertsViewModel,
                onNavigateBack = { navController.popBackStack() },
                onNavigateToHome = {
                    navController.navigate(Screen.Home.route) {
                        popUpTo(Screen.Home.route) { inclusive = false }
                        launchSingleTop = true
                    }
                },
                onNavigateToMap = {
                    navController.navigate(Screen.Map.route) {
                        popUpTo(Screen.Home.route) { inclusive = false }
                        launchSingleTop = true
                    }
                },
                onNavigateToMyReports = {
                    navController.navigate(Screen.MyReports.route) {
                        popUpTo(Screen.Home.route) { inclusive = false }
                        launchSingleTop = true
                    }
                }
            )
        }

        // 8. Login / OTP Screen
        composable(
            route = Screen.LoginOtp.route,
            arguments = listOf(
                navArgument("returnDest") { type = NavType.StringType; defaultValue = "home" },
                navArgument("retryReport") { type = NavType.BoolType; defaultValue = false }
            )
        ) { backStackEntry ->
            val rawReturn = backStackEntry.arguments?.getString("returnDest") ?: "home"
            val returnDest = URLDecoder.decode(rawReturn, StandardCharsets.UTF_8.toString())
            val retryReport = backStackEntry.arguments?.getBoolean("retryReport") ?: false

            val authViewModel = remember { AuthViewModel(repository) }
            LoginOtpScreen(
                viewModel = authViewModel,
                returnDestination = returnDest,
                retryReport = retryReport,
                onNavigateBack = { navController.popBackStack() },
                onAuthSuccess = { destination ->
                    when (destination) {
                        "my_reports" -> navController.navigate(Screen.MyReports.route) {
                            popUpTo(Screen.Home.route)
                        }
                        "report" -> navController.navigate(Screen.Report.route) {
                            popUpTo(Screen.Home.route)
                        }
                        else -> navController.navigate(Screen.Home.route) {
                            popUpTo(Screen.Home.route) { inclusive = true }
                        }
                    }
                },
                onReportRetrySuccess = { report, imageUrl ->
                    val route = Screen.AiConfirmation.createRoute(
                        reportId = report.reportId,
                        incidentId = report.incidentId ?: "none",
                        aiCategory = report.aiCategory ?: "none",
                        aiConfidence = report.aiConfidence ?: -1.0,
                        status = report.status,
                        imageUrl = imageUrl
                    )
                    navController.navigate(route) {
                        popUpTo(Screen.Home.route)
                    }
                }
            )
        }
    }
}
