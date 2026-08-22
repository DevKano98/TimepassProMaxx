package com.example.ui.screens.report

import android.content.Context
import android.net.Uri
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.data.model.DraftReport
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

sealed class ReportNavEvent {
    data class NavigateToAiConfirmation(
        val report: ReportResponse,
        val imageUrl: String
    ) : ReportNavEvent()

    data class TriggerOtpAuthRequired(
        val message: String
    ) : ReportNavEvent()
}

data class ReportUiState(
    val imageUri: Uri? = null,
    val description: String = "",
    val latitude: Double = 37.7749,
    val longitude: Double = -122.4194,
    val citizenCategoryHint: String? = null,
    val isSubmitting: Boolean = false,
    val uploadProgressStep: String = "", // "Uploading photo..." -> "AI Analysis..."
    val errorMessage: String? = null,
    val isLocationAdjusting: Boolean = false
)

class ReportViewModel(
    private val repository: CivicGuardRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(ReportUiState())
    val uiState: StateFlow<ReportUiState> = _uiState.asStateFlow()

    private val _navEvents = MutableSharedFlow<ReportNavEvent>()
    val navEvents: SharedFlow<ReportNavEvent> = _navEvents.asSharedFlow()

    init {
        checkSavedDraft()
    }

    private fun checkSavedDraft() {
        viewModelScope.launch {
            val draft = repository.userPreferencesManager.getSavedDraftReport()
            if (draft != null) {
                _uiState.value = _uiState.value.copy(
                    imageUri = Uri.parse(draft.imageUriString),
                    description = draft.description ?: "",
                    latitude = draft.latitude,
                    longitude = draft.longitude,
                    citizenCategoryHint = draft.citizenCategoryHint
                )
            }
        }
    }

    fun onImageSelected(uri: Uri?) {
        _uiState.value = _uiState.value.copy(
            imageUri = uri,
            errorMessage = null
        )
    }

    fun onDescriptionChanged(text: String) {
        _uiState.value = _uiState.value.copy(description = text)
    }

    fun onCategoryHintSelected(category: String) {
        val current = _uiState.value.citizenCategoryHint
        _uiState.value = _uiState.value.copy(
            citizenCategoryHint = if (current == category) null else category
        )
    }

    fun onLocationUpdated(lat: Double, lng: Double) {
        _uiState.value = _uiState.value.copy(
            latitude = lat,
            longitude = lng
        )
    }

    fun setLocationAdjusting(adjusting: Boolean) {
        _uiState.value = _uiState.value.copy(isLocationAdjusting = adjusting)
    }

    fun submitReport(context: Context) {
        val currentState = _uiState.value
        val uri = currentState.imageUri
        if (uri == null) {
            _uiState.value = _uiState.value.copy(errorMessage = "Please capture or select a photo first")
            return
        }

        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(
                isSubmitting = true,
                uploadProgressStep = "Uploading photo directly to Cloudinary...",
                errorMessage = null
            )

            val result = repository.submitReport(
                context = context,
                imageUri = uri,
                description = currentState.description,
                latitude = currentState.latitude,
                longitude = currentState.longitude,
                categoryHint = currentState.citizenCategoryHint
            )

            when (result) {
                is ReportSubmissionResult.Success -> {
                    _uiState.value = _uiState.value.copy(
                        isSubmitting = false,
                        uploadProgressStep = "Done!"
                    )
                    _navEvents.emit(ReportNavEvent.NavigateToAiConfirmation(result.report, result.imageUrl))
                }
                is ReportSubmissionResult.AnonymousLimitExceeded -> {
                    _uiState.value = _uiState.value.copy(
                        isSubmitting = false,
                        errorMessage = result.message
                    )
                    _navEvents.emit(ReportNavEvent.TriggerOtpAuthRequired(result.message))
                }
                is ReportSubmissionResult.Error -> {
                    _uiState.value = _uiState.value.copy(
                        isSubmitting = false,
                        errorMessage = result.message
                    )
                }
            }
        }
    }

    fun clearError() {
        _uiState.value = _uiState.value.copy(errorMessage = null)
    }
}
