package com.example.ui.screens.map

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.data.model.HazardCategories
import com.example.data.model.IncidentReportItem
import com.example.data.repository.CivicGuardRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class MapUiState(
    val incidents: List<IncidentReportItem> = emptyList(),
    val filteredIncidents: List<IncidentReportItem> = emptyList(),
    val selectedCategoryFilter: String? = null, // null means "All"
    val selectedIncident: IncidentReportItem? = null,
    val isLoading: Boolean = false,
    val centerLat: Double = 37.7749,
    val centerLng: Double = -122.4194
)

class MapViewModel(
    private val repository: CivicGuardRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(MapUiState())
    val uiState: StateFlow<MapUiState> = _uiState.asStateFlow()

    init {
        loadNearbyIncidents(37.7749, -122.4194)
    }

    fun loadNearbyIncidents(lat: Double, lng: Double, radiusMeters: Double = 50000.0) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(
                isLoading = true,
                centerLat = lat,
                centerLng = lng
            )
            val result = repository.getNearbyReports(lat, lng, radiusMeters)
            result.onSuccess { list ->
                _uiState.value = _uiState.value.copy(
                    incidents = list,
                    filteredIncidents = applyFilter(list, _uiState.value.selectedCategoryFilter),
                    isLoading = false
                )
            }.onFailure {
                _uiState.value = _uiState.value.copy(isLoading = false)
            }
        }
    }


    fun onCategoryFilterSelected(category: String?) {
        _uiState.value = _uiState.value.copy(
            selectedCategoryFilter = category,
            filteredIncidents = applyFilter(_uiState.value.incidents, category)
        )
    }

    fun onIncidentSelected(incident: IncidentReportItem?) {
        _uiState.value = _uiState.value.copy(selectedIncident = incident)
    }

    private fun applyFilter(list: List<IncidentReportItem>, category: String?): List<IncidentReportItem> {
        return if (category.isNullOrBlank()) {
            list
        } else {
            list.filter { it.category.equals(category, ignoreCase = true) }
        }
    }
}
