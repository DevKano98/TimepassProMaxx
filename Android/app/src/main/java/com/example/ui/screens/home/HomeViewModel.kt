package com.example.ui.screens.home

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.data.model.AlertItem
import com.example.data.repository.CivicGuardRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

data class HomeUiState(
    val alerts: List<AlertItem> = emptyList(),
    val isLoadingAlerts: Boolean = false,
    val userEmail: String? = null
)

class HomeViewModel(
    private val repository: CivicGuardRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(HomeUiState())
    val uiState: StateFlow<HomeUiState> = _uiState.asStateFlow()

    val isLoggedIn: StateFlow<Boolean> = repository.isLoggedInFlow
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), false)

    init {
        loadAlerts()
        observeUser()
    }

    fun loadAlerts() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoadingAlerts = true)
            val result = repository.getAlerts()
            result.onSuccess { alertList ->
                _uiState.value = _uiState.value.copy(
                    alerts = alertList,
                    isLoadingAlerts = false
                )
            }.onFailure {
                _uiState.value = _uiState.value.copy(isLoadingAlerts = false)
            }
        }
    }

    private fun observeUser() {
        viewModelScope.launch {
            repository.userEmailFlow.collect { email ->
                _uiState.value = _uiState.value.copy(userEmail = email)
            }
        }
    }

    fun logout() {
        viewModelScope.launch {
            repository.logout()
        }
    }
}
