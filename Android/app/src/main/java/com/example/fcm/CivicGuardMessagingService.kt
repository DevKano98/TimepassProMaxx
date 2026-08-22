package com.example.fcm

import android.util.Log
import com.example.data.api.NetworkClient
import com.example.data.local.UserPreferencesManager
import com.example.data.repository.CivicGuardRepository
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

class CivicGuardMessagingService : FirebaseMessagingService() {

    companion object {
        private const val TAG = "CivicGuardFCM"
    }

    private val serviceScope = CoroutineScope(Dispatchers.IO)

    override fun onNewToken(token: String) {
        super.onNewToken(token)
        Log.d(TAG, "Refreshed FCM Token: $token")
        val userPrefs = UserPreferencesManager(applicationContext)
        val networkClient = NetworkClient(applicationContext, userPrefs)
        val repo = CivicGuardRepository(networkClient.apiService, networkClient.cloudinaryUploader, userPrefs)

        serviceScope.launch {
            userPrefs.saveFcmToken(token)
            repo.registerFcmTokenIfAvailable()
        }
    }

    override fun onMessageReceived(remoteMessage: RemoteMessage) {
        super.onMessageReceived(remoteMessage)
        Log.d(TAG, "From: ${remoteMessage.from}")

        val title = remoteMessage.notification?.title 
            ?: remoteMessage.data["title"] 
            ?: "Civic Hazard Alert"
        val body = remoteMessage.notification?.body 
            ?: remoteMessage.data["message"] 
            ?: "New civic hazard update in your area."

        val type = remoteMessage.data["type"] ?: "alert"
        val destination = if (type == "report_status" || remoteMessage.data.containsKey("report_id")) {
            "my_reports"
        } else {
            "alerts"
        }

        NotificationHelper.showHazardNotification(
            context = applicationContext,
            title = title,
            body = body,
            destination = destination
        )
    }
}
