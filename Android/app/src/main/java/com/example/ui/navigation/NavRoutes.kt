package com.example.ui.navigation

import java.net.URLDecoder
import java.net.URLEncoder
import java.nio.charset.StandardCharsets

sealed class Screen(val route: String) {
    object Home : Screen("home")
    object Report : Screen("report")
    object Map : Screen("map")
    object MyReports : Screen("my_reports")
    object Alerts : Screen("alerts")
    
    object AiConfirmation : Screen("ai_confirmation/{reportId}/{incidentId}/{aiCategory}/{aiConfidence}/{status}/{imageUrl}") {
        fun createRoute(
            reportId: String,
            incidentId: String = "none",
            aiCategory: String = "none",
            aiConfidence: Double = -1.0,
            status: String = "submitted",
            imageUrl: String
        ): String {
            val encImg = URLEncoder.encode(imageUrl, StandardCharsets.UTF_8.toString())
            val encCat = URLEncoder.encode(aiCategory, StandardCharsets.UTF_8.toString())
            val encStat = URLEncoder.encode(status, StandardCharsets.UTF_8.toString())
            return "ai_confirmation/$reportId/$incidentId/$encCat/$aiConfidence/$encStat/$encImg"
        }
    }

    object IncidentDetail : Screen("incident_detail/{incidentId}") {
        fun createRoute(incidentId: String): String = "incident_detail/$incidentId"
    }

    object LoginOtp : Screen("login_otp?returnDest={returnDest}&retryReport={retryReport}") {
        fun createRoute(returnDest: String = "home", retryReport: Boolean = false): String {
            val enc = URLEncoder.encode(returnDest, StandardCharsets.UTF_8.toString())
            return "login_otp?returnDest=$enc&retryReport=$retryReport"
        }
    }
}
