package com.example.ui.screens.alerts

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.data.model.AlertItem
import com.example.data.repository.CivicGuardRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class AlertsUiState(
    val alerts: List<AlertItem> = emptyList(),
    val isLoading: Boolean = false,
    val selectedSeverityFilter: String? = null // null means All
)

class AlertsViewModel(
    private val repository: CivicGuardRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(AlertsUiState())
    val uiState: StateFlow<AlertsUiState> = _uiState.asStateFlow()

    init {
        loadAlerts()
    }

    fun loadAlerts() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true)
            val result = repository.getAlerts()
            result.onSuccess { list ->
                _uiState.value = _uiState.value.copy(
                    alerts = list,
                    isLoading = false
                )
            }.onFailure {
                _uiState.value = _uiState.value.copy(isLoading = false)
            }
        }
    }

    fun setFilter(severity: String?) {
        _uiState.value = _uiState.value.copy(selectedSeverityFilter = severity)
    }
}
