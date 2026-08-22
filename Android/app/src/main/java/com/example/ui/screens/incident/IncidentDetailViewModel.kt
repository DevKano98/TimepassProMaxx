package com.example.ui.screens.incident

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.data.model.IncidentReportItem
import com.example.data.repository.CivicGuardRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class IncidentDetailUiState(
    val incident: IncidentReportItem? = null,
    val isLoading: Boolean = false,
    val isConfirming: Boolean = false,
    val hasConfirmed: Boolean = false,
    val confirmationMessage: String? = null,
    val errorMessage: String? = null
)

class IncidentDetailViewModel(
    private val incidentId: String,
    private val repository: CivicGuardRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(IncidentDetailUiState())
    val uiState: StateFlow<IncidentDetailUiState> = _uiState.asStateFlow()

    init {
        loadIncident()
    }

    fun loadIncident() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true)
            val result = repository.getReportById(incidentId)
            result.onSuccess { item ->
                _uiState.value = _uiState.value.copy(
                    incident = item,
                    isLoading = false
                )
            }.onFailure {
                // Fallback demo incident with given ID
                _uiState.value = _uiState.value.copy(
                    incident = IncidentReportItem(
                        id = incidentId,
                        reportId = incidentId,
                        incidentId = incidentId,
                        category = "pothole",
                        severity = "critical",
                        status = "in_progress",
                        latitude = 37.7749,
                        longitude = -122.4194,
                        imageUrl = "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600",
                        description = "Significant road fissure and crater causing traffic disruption.",
                        createdAt = "Aug 22, 2026 • 09:30 AM",
                        confirmationsCount = 7
                    ),
                    isLoading = false
                )
            }
        }
    }

    fun confirmIncident() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isConfirming = true)
            val result = repository.confirmIncident(incidentId)
            result.onSuccess { res ->
                val current = _uiState.value.incident
                val updatedCount = (current?.confirmationsCount ?: 0) + 1
                _uiState.value = _uiState.value.copy(
                    isConfirming = false,
                    hasConfirmed = true,
                    confirmationMessage = "Thank you! Your confirmation helps municipal teams prioritize dispatch.",
                    incident = current?.copy(confirmationsCount = updatedCount)
                )
            }.onFailure { err ->
                _uiState.value = _uiState.value.copy(
                    isConfirming = false,
                    errorMessage = err.message ?: "Failed to confirm incident"
                )
            }
        }
    }
}
