package com.example

import android.content.Intent
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.navigation.compose.rememberNavController
import com.example.data.api.CloudinaryUploader
import com.example.data.api.NetworkClient
import com.example.data.local.UserPreferencesManager
import com.example.data.repository.CivicGuardRepository
import com.example.ui.navigation.AppNavigation
import com.example.ui.navigation.Screen
import com.example.ui.theme.CivicGuardTheme

class MainActivity : ComponentActivity() {

    private lateinit var repository: CivicGuardRepository

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        val userPreferencesManager = UserPreferencesManager(applicationContext)
        val networkClient = NetworkClient(applicationContext, userPreferencesManager)
        val apiService = networkClient.apiService
        val cloudinaryUploader = networkClient.cloudinaryUploader
        repository = CivicGuardRepository(apiService, cloudinaryUploader, userPreferencesManager)

        setContent {
            CivicGuardTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    val navController = rememberNavController()

                    // Handle deep links from notifications if intent contains navigation action
                    LaunchedEffect(intent) {
                        handleIncomingIntent(intent, navController)
                    }

                    AppNavigation(
                        navController = navController,
                        repository = repository
                    )
                }
            }
        }
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        setIntent(intent)
    }

    private fun handleIncomingIntent(intent: Intent?, navController: androidx.navigation.NavController) {
        intent?.data?.let { uri ->
            if (uri.scheme == "civicguard" && uri.host == "navigate") {
                val destination = uri.getQueryParameter("destination")
                when (destination) {
                    "alerts" -> navController.navigate(Screen.Alerts.route)
                    "my_reports" -> navController.navigate(Screen.MyReports.route)
                }
            }
        }
    }
}
