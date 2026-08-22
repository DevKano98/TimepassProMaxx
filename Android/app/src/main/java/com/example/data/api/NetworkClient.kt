package com.example.data.api

import android.content.Context
import com.example.BuildConfig
import com.example.data.local.UserPreferencesManager
import com.squareup.moshi.Moshi
import com.squareup.moshi.kotlin.reflect.KotlinJsonAdapterFactory
import kotlinx.coroutines.runBlocking
import okhttp3.Interceptor
import okhttp3.OkHttpClient
import okhttp3.Response
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.moshi.MoshiConverterFactory
import java.util.concurrent.TimeUnit

class NetworkClient(
    private val context: Context,
    private val userPreferencesManager: UserPreferencesManager
) {

    private val moshi: Moshi = Moshi.Builder()
        .addLast(KotlinJsonAdapterFactory())
        .build()

    // Interceptor to attach Authorization and X-Device-Id headers
    private val authAndDeviceInterceptor = Interceptor { chain ->
        val originalRequest = chain.request()
        val builder = originalRequest.newBuilder()

        // Read token and deviceId synchronously within interceptor
        val token = runBlocking { userPreferencesManager.getAuthToken() }
        val deviceId = runBlocking { userPreferencesManager.getOrCreateDeviceId() }

        // Always attach X-Device-Id (§2)
        builder.header("X-Device-Id", deviceId)

        // Attach Authorization header if authenticated
        if (!token.isNullOrBlank()) {
            builder.header("Authorization", "Bearer $token")
        }

        builder.header("Accept", "application/json")
        builder.header("Content-Type", "application/json")

        val request = builder.build()
        chain.proceed(request)
    }

    val okHttpClient: OkHttpClient by lazy {
        val logging = HttpLoggingInterceptor().apply {
            level = HttpLoggingInterceptor.Level.BODY
        }

        OkHttpClient.Builder()
            .addInterceptor(authAndDeviceInterceptor)
            .addInterceptor(logging)
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .writeTimeout(30, TimeUnit.SECONDS)
            .build()
    }

    // Separate OkHttpClient for raw Cloudinary multipart uploads
    val cloudinaryClient: OkHttpClient by lazy {
        val logging = HttpLoggingInterceptor().apply {
            level = HttpLoggingInterceptor.Level.BASIC
        }

        OkHttpClient.Builder()
            .addInterceptor(logging)
            .connectTimeout(45, TimeUnit.SECONDS)
            .readTimeout(45, TimeUnit.SECONDS)
            .writeTimeout(45, TimeUnit.SECONDS)
            .build()
    }

    val apiService: ApiService by lazy {
        Retrofit.Builder()
            .baseUrl(ensureTrailingSlash(BuildConfig.API_BASE_URL))
            .client(okHttpClient)
            .addConverterFactory(MoshiConverterFactory.create(moshi))
            .build()
            .create(ApiService::class.java)
    }

    val cloudinaryUploader: CloudinaryUploader by lazy {
        CloudinaryUploader(cloudinaryClient)
    }

    private fun ensureTrailingSlash(url: String): String {
        return if (url.endsWith("/")) url else "$url/"
    }
}
