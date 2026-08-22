package com.example.ui.screens.auth

import android.content.Context
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.data.model.ReportResponse
import com.example.data.repository.CivicGuardRepository
import com.example.data.repository.ReportSubmissionResult
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

sealed class AuthNavEvent {
    data class AuthSuccess(val returnDestination: String) : AuthNavEvent()
    data class ReportRetrySuccess(val report: ReportResponse, val imageUrl: String) : AuthNavEvent()
}

data class AuthUiState(
    val email: String = "",
    val otp: String = "",
    val isOtpSent: Boolean = false,
    val isLoading: Boolean = false,
    val isRetryingReport: Boolean = false,
    val statusMessage: String? = null,
    val errorMessage: String? = null
)

class AuthViewModel(
    private val repository: CivicGuardRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(AuthUiState())
    val uiState: StateFlow<AuthUiState> = _uiState.asStateFlow()

    private val _navEvents = MutableSharedFlow<AuthNavEvent>()
    val navEvents: SharedFlow<AuthNavEvent> = _navEvents.asSharedFlow()

    fun onEmailChanged(email: String) {
        _uiState.value = _uiState.value.copy(email = email, errorMessage = null)
    }

    fun onOtpChanged(otp: String) {
        if (otp.length <= 6) {
            _uiState.value = _uiState.value.copy(otp = otp, errorMessage = null)
        }
    }

    fun requestOtp() {
        val email = _uiState.value.email.trim()
        if (email.isBlank() || !email.contains("@")) {
            _uiState.value = _uiState.value.copy(errorMessage = "Please enter a valid email address")
            return
        }

        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, errorMessage = null)
            val result = repository.requestOtp(email)
            result.onSuccess { msg ->
                _uiState.value = _uiState.value.copy(
                    isOtpSent = true,
                    isLoading = false,
                    statusMessage = msg
                )
            }.onFailure { err ->
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    errorMessage = err.message ?: "Failed to send OTP"
                )
            }
        }
    }

    /**
     * Verifies OTP and if retryReport is true, automatically retries the preserved report submission! (§2)
     */
    fun verifyOtp(context: Context, returnDest: String, shouldRetryReport: Boolean) {
        val email = _uiState.value.email.trim()
        val otp = _uiState.value.otp.trim()

        if (otp.length < 4) {
            _uiState.value = _uiState.value.copy(errorMessage = "Please enter the verification code")
            return
        }

        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, errorMessage = null)
            val result = repository.verifyOtp(email, otp)

            result.onSuccess { token ->
                if (shouldRetryReport) {
                    _uiState.value = _uiState.value.copy(
                        isLoading = true,
                        isRetryingReport = true,
                        statusMessage = "Authenticated! Submitting your preserved hazard report..."
                    )

                    val retryResult = repository.retryPendingDraft(context)
                    when (retryResult) {
                        is ReportSubmissionResult.Success -> {
                            _uiState.value = _uiState.value.copy(isLoading = false, isRetryingReport = false)
                            _navEvents.emit(AuthNavEvent.ReportRetrySuccess(retryResult.report, retryResult.imageUrl))
                        }
                        is ReportSubmissionResult.Error -> {
                            _uiState.value = _uiState.value.copy(
                                isLoading = false,
                                isRetryingReport = false,
                                errorMessage = "Report retry failed: ${retryResult.message}. You can retry from Report screen."
                            )
                            _navEvents.emit(AuthNavEvent.AuthSuccess("report"))
                        }
                        else -> {
                            _uiState.value = _uiState.value.copy(isLoading = false, isRetryingReport = false)
                            _navEvents.emit(AuthNavEvent.AuthSuccess(returnDest))
                        }
                    }
                } else {
                    _uiState.value = _uiState.value.copy(isLoading = false)
                    _navEvents.emit(AuthNavEvent.AuthSuccess(returnDest))
                }
            }.onFailure { err ->
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    errorMessage = err.message ?: "Invalid OTP verification code"
                )
            }
        }
    }
}
