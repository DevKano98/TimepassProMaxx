package com.example.data.model

import com.squareup.moshi.Json
import com.squareup.moshi.JsonClass

/**
 * §3 The 4 hazard categories detected by AI
 * Must match backend strings verbatim.
 */
object HazardCategories {
    const val POTHOLE = "pothole"
    const val FLOODED_ROAD = "flooded_road"
    const val GARBAGE_PILE = "garbage_pile"
    const val DAMAGED_ROAD = "damaged_road"

    val ALL_AI_CATEGORIES = listOf(POTHOLE, FLOODED_ROAD, GARBAGE_PILE, DAMAGED_ROAD)

    // Broader selection for citizen UI reporting convenience (§4)
    val CITIZEN_HELPER_OPTIONS = listOf(
        "pothole" to "Pothole",
        "flooded_road" to "Flooded Road",
        "garbage_pile" to "Garbage Pile",
        "damaged_road" to "Damaged Road",
        "fallen_tree" to "Fallen Tree",
        "broken_streetlight" to "Broken Streetlight",
        "overflowing_drain" to "Overflowing Drain",
        "open_manhole" to "Open Manhole"
    )

    fun getDisplayName(category: String?): String {
        return when (category?.lowercase()) {
            POTHOLE -> "Pothole"
            FLOODED_ROAD -> "Flooded Road"
            GARBAGE_PILE -> "Garbage Pile"
            DAMAGED_ROAD -> "Damaged Road"
            "fallen_tree" -> "Fallen Tree"
            "broken_streetlight" -> "Broken Streetlight"
            "overflowing_drain" -> "Overflowing Drain"
            "open_manhole" -> "Open Manhole"
            else -> category?.replace('_', ' ')?.replaceFirstChar { it.uppercase() } ?: "Hazard Incident"
        }
    }
}

/**
 * Status sequence matching backend (§4):
 * Submitted → Under review → Confirmed → Assigned → Team dispatched → In progress → Resolved
 */
enum class ReportStatus(val rawValue: String, val displayName: String, val stepIndex: Int) {
    SUBMITTED("submitted", "Submitted", 0),
    PENDING_AI_REVIEW("pending_ai_review", "Pending AI Review", 0),
    UNDER_REVIEW("under_review", "Under Review", 1),
    CONFIRMED("confirmed", "Confirmed", 2),
    ASSIGNED("assigned", "Assigned", 3),
    TEAM_DISPATCHED("team_dispatched", "Team Dispatched", 4),
    IN_PROGRESS("in_progress", "In Progress", 5),
    RESOLVED("resolved", "Resolved", 6);

    companion object {
        fun fromRaw(raw: String?): ReportStatus {
            return entries.find { it.rawValue.equals(raw, ignoreCase = true) } ?: SUBMITTED
        }
    }
}

@JsonClass(generateAdapter = true)
data class OtpRequest(
    @Json(name = "email") val email: String
)

@JsonClass(generateAdapter = true)
data class OtpVerifyRequest(
    @Json(name = "email") val email: String,
    @Json(name = "otp") val otp: String
)

@JsonClass(generateAdapter = true)
data class AuthResponse(
    @Json(name = "access_token") val accessToken: String,
    @Json(name = "token_type") val tokenType: String = "bearer"
)

@JsonClass(generateAdapter = true)
data class CreateReportRequest(
    @Json(name = "image_url") val imageUrl: String,
    @Json(name = "description") val description: String?,
    @Json(name = "latitude") val latitude: Double,
    @Json(name = "longitude") val longitude: Double
)

@JsonClass(generateAdapter = true)
data class ReportResponse(
    @Json(name = "report_id") val reportId: String,
    @Json(name = "incident_id") val incidentId: String? = null,
    @Json(name = "ai_category") val aiCategory: String? = null,
    @Json(name = "ai_confidence") val aiConfidence: Double? = null,
    @Json(name = "status") val status: String
)

@JsonClass(generateAdapter = true)
data class IncidentReportItem(
    @Json(name = "id") val id: String,
    @Json(name = "report_id") val reportId: String? = null,
    @Json(name = "incident_id") val incidentId: String? = null,
    @Json(name = "category") val category: String? = null,
    @Json(name = "ai_category") val aiCategory: String? = null,
    @Json(name = "ai_confidence") val aiConfidence: Double? = null,
    @Json(name = "severity") val severity: String? = "medium",
    @Json(name = "status") val status: String = "submitted",
    @Json(name = "latitude") val latitude: Double = 0.0,
    @Json(name = "longitude") val longitude: Double = 0.0,
    @Json(name = "image_url") val imageUrl: String? = null,
    @Json(name = "description") val description: String? = null,
    @Json(name = "created_at") val createdAt: String? = null,
    @Json(name = "confirmations_count") val confirmationsCount: Int = 0
) {
    val displayCategory: String
        get() = category ?: aiCategory ?: "pothole"
}


@JsonClass(generateAdapter = true)
data class ConfirmIncidentResponse(
    @Json(name = "status") val status: String = "success",
    @Json(name = "confirmations_count") val confirmationsCount: Int = 1
)

@JsonClass(generateAdapter = true)
data class AlertItem(
    @Json(name = "id") val id: String,
    @Json(name = "title") val title: String,
    @Json(name = "message") val message: String,
    @Json(name = "severity") val severity: String = "medium", // critical, high, medium, resolved
    @Json(name = "category") val category: String? = null,
    @Json(name = "created_at") val createdAt: String? = null,
    @Json(name = "affected_area") val affectedArea: String? = null
)

@JsonClass(generateAdapter = true)
data class DeviceRegisterRequest(
    @Json(name = "fcm_token") val fcmToken: String
)

@JsonClass(generateAdapter = true)
data class ErrorResponse(
    @Json(name = "error") val error: String? = null,
    @Json(name = "message") val message: String? = null
)

data class DraftReport(
    val imageUriString: String,
    val description: String?,
    val latitude: Double,
    val longitude: Double,
    val citizenCategoryHint: String? = null
)
