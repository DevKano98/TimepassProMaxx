package com.example.data.api

import com.example.data.model.AlertItem
import com.example.data.model.AuthResponse
import com.example.data.model.ConfirmIncidentResponse
import com.example.data.model.CreateReportRequest
import com.example.data.model.DeviceRegisterRequest
import com.example.data.model.IncidentReportItem
import com.example.data.model.OtpRequest
import com.example.data.model.OtpVerifyRequest
import com.example.data.model.ReportResponse
import okhttp3.ResponseBody
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.DELETE
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Path
import retrofit2.http.Query

interface ApiService {

    // Auth endpoints (§2)
    @POST("api/auth/otp/request")
    suspend fun requestOtp(@Body request: OtpRequest): Response<ResponseBody>

    @POST("api/auth/otp/verify")
    suspend fun verifyOtp(@Body request: OtpVerifyRequest): Response<AuthResponse>

    // Report endpoints (§2)
    @POST("api/reports")
    suspend fun createReport(@Body request: CreateReportRequest): Response<ReportResponse>

    @GET("api/reports/nearby")
    suspend fun getNearbyReports(
        @Query("latitude") latitude: Double,
        @Query("longitude") longitude: Double,
        @Query("radius") radiusMeters: Double = 5000.0
    ): Response<List<IncidentReportItem>>

    @GET("api/reports/{report_id}")
    suspend fun getReportById(@Path("report_id") reportId: String): Response<IncidentReportItem>

    @GET("api/my-reports")
    suspend fun getMyReports(): Response<List<IncidentReportItem>>

    @POST("api/incidents/{incident_id}/confirm")
    suspend fun confirmIncident(@Path("incident_id") incidentId: String): Response<ConfirmIncidentResponse>

    // Alerts endpoint (§2)
    @GET("api/alerts")
    suspend fun getAlerts(): Response<List<AlertItem>>

    // Device registration (§2 & §5)
    @POST("api/devices/register")
    suspend fun registerDevice(@Body request: DeviceRegisterRequest): Response<ResponseBody>

    @DELETE("api/devices/{device_id}")
    suspend fun unregisterDevice(@Path("device_id") deviceId: String): Response<ResponseBody>
}
