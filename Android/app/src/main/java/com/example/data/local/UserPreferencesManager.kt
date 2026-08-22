package com.example.data.local

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.intPreferencesKey
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import com.example.data.model.DraftReport
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map
import java.util.UUID

private val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "civicguard_prefs")

class UserPreferencesManager(private val context: Context) {

    companion object {
        private val KEY_DEVICE_ID = stringPreferencesKey("device_uuid")
        private val KEY_AUTH_TOKEN = stringPreferencesKey("auth_token")
        private val KEY_USER_EMAIL = stringPreferencesKey("user_email")
        private val KEY_FCM_TOKEN = stringPreferencesKey("fcm_token")
        private val KEY_REPORT_COUNT = intPreferencesKey("report_count_today")
        private val KEY_LAST_REPORT_DATE = stringPreferencesKey("last_report_date")
        
        // Saved draft for anonymous limit retry (§2)
        private val KEY_DRAFT_IMAGE_URI = stringPreferencesKey("draft_image_uri")
        private val KEY_DRAFT_DESC = stringPreferencesKey("draft_description")
        private val KEY_DRAFT_LAT = stringPreferencesKey("draft_lat")
        private val KEY_DRAFT_LNG = stringPreferencesKey("draft_lng")
        private val KEY_DRAFT_CATEGORY_HINT = stringPreferencesKey("draft_category_hint")
    }

    /**
     * Get or create the unique Device UUID.
     * Persisted in DataStore, reused for app lifetime on device (§2).
     */
    suspend fun getOrCreateDeviceId(): String {
        val prefs = context.dataStore.data.first()
        val existing = prefs[KEY_DEVICE_ID]
        if (!existing.isNullOrBlank()) {
            return existing
        }
        val newId = UUID.randomUUID().toString()
        context.dataStore.edit { preferences ->
            preferences[KEY_DEVICE_ID] = newId
        }
        return newId
    }

    val deviceIdFlow: Flow<String?> = context.dataStore.data.map { prefs ->
        prefs[KEY_DEVICE_ID]
    }

    val authTokenFlow: Flow<String?> = context.dataStore.data.map { prefs ->
        prefs[KEY_AUTH_TOKEN]
    }

    val userEmailFlow: Flow<String?> = context.dataStore.data.map { prefs ->
        prefs[KEY_USER_EMAIL]
    }

    val isLoggedInFlow: Flow<Boolean> = context.dataStore.data.map { prefs ->
        !prefs[KEY_AUTH_TOKEN].isNullOrBlank()
    }

    val fcmTokenFlow: Flow<String?> = context.dataStore.data.map { prefs ->
        prefs[KEY_FCM_TOKEN]
    }

    suspend fun getAuthToken(): String? {
        return context.dataStore.data.first()[KEY_AUTH_TOKEN]
    }

    suspend fun saveAuthToken(token: String, email: String) {
        context.dataStore.edit { prefs ->
            prefs[KEY_AUTH_TOKEN] = token
            prefs[KEY_USER_EMAIL] = email
        }
    }

    suspend fun clearAuth() {
        context.dataStore.edit { prefs ->
            prefs.remove(KEY_AUTH_TOKEN)
            prefs.remove(KEY_USER_EMAIL)
        }
    }

    suspend fun saveFcmToken(token: String) {
        context.dataStore.edit { prefs ->
            prefs[KEY_FCM_TOKEN] = token
        }
    }

    suspend fun saveDraftReport(draft: DraftReport) {
        context.dataStore.edit { prefs ->
            prefs[KEY_DRAFT_IMAGE_URI] = draft.imageUriString
            prefs[KEY_DRAFT_DESC] = draft.description ?: ""
            prefs[KEY_DRAFT_LAT] = draft.latitude.toString()
            prefs[KEY_DRAFT_LNG] = draft.longitude.toString()
            prefs[KEY_DRAFT_CATEGORY_HINT] = draft.citizenCategoryHint ?: ""
        }
    }

    suspend fun getSavedDraftReport(): DraftReport? {
        val prefs = context.dataStore.data.first()
        val uri = prefs[KEY_DRAFT_IMAGE_URI] ?: return null
        if (uri.isBlank()) return null
        val desc = prefs[KEY_DRAFT_DESC]
        val lat = prefs[KEY_DRAFT_LAT]?.toDoubleOrNull() ?: 0.0
        val lng = prefs[KEY_DRAFT_LNG]?.toDoubleOrNull() ?: 0.0
        val cat = prefs[KEY_DRAFT_CATEGORY_HINT]
        return DraftReport(
            imageUriString = uri,
            description = desc.takeIf { !it.isNullOrBlank() },
            latitude = lat,
            longitude = lng,
            citizenCategoryHint = cat.takeIf { !it.isNullOrBlank() }
        )
    }

    suspend fun clearSavedDraftReport() {
        context.dataStore.edit { prefs ->
            prefs.remove(KEY_DRAFT_IMAGE_URI)
            prefs.remove(KEY_DRAFT_DESC)
            prefs.remove(KEY_DRAFT_LAT)
            prefs.remove(KEY_DRAFT_LNG)
            prefs.remove(KEY_DRAFT_CATEGORY_HINT)
        }
    }
}
