package com.example.ui.screens.myreports

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.data.model.IncidentReportItem
import com.example.data.repository.CivicGuardRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

data class MyReportsUiState(
    val reports: List<IncidentReportItem> = emptyList(),
    val isLoading: Boolean = false,
    val errorMessage: String? = null
)

class MyReportsViewModel(
    private val repository: CivicGuardRepository
) : ViewModel() {

    val isLoggedIn: StateFlow<Boolean> = repository.isLoggedInFlow
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), false)

    private val _uiState = MutableStateFlow(MyReportsUiState())
    val uiState: StateFlow<MyReportsUiState> = _uiState.asStateFlow()

    init {
        loadMyReports()
    }

    fun loadMyReports() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, errorMessage = null)
            val result = repository.getMyReports()
            result.onSuccess { list ->
                _uiState.value = _uiState.value.copy(
                    reports = list,
                    isLoading = false
                )
            }.onFailure { err ->
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    errorMessage = err.message
                )
            }
        }
    }
}
