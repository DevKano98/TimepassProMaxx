package com.example.ui.screens.report

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.widget.Toast
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.AddPhotoAlternate
import androidx.compose.material.icons.filled.CameraAlt
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.EditLocation
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.MyLocation
import androidx.compose.material.icons.filled.Send
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.content.ContextCompat
import androidx.core.content.FileProvider
import coil.compose.AsyncImage
import com.example.data.model.HazardCategories
import com.example.data.model.ReportResponse
import com.example.ui.components.CivicPillButton
import com.example.ui.components.OsmMapView
import com.example.ui.theme.CivicBlue
import com.google.android.gms.location.LocationServices
import java.io.File

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ReportScreen(
    viewModel: ReportViewModel,
    onNavigateBack: () -> Unit,
    onNavigateToAiConfirmation: (ReportResponse, String) -> Unit,
    onTriggerOtpLogin: (String) -> Unit
) {
    val context = LocalContext.current
    val uiState by viewModel.uiState.collectAsState()
    val snackbarHostState = remember { SnackbarHostState() }

    // File URI for Camera capture
    var tempCameraUri by remember { mutableStateOf<Uri?>(null) }

    // Camera Launcher
    val cameraLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.TakePicture()
    ) { success ->
        if (success && tempCameraUri != null) {
            viewModel.onImageSelected(tempCameraUri)
        }
    }

    // Gallery Picker Launcher
    val galleryLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.GetContent()
    ) { uri ->
        if (uri != null) {
            viewModel.onImageSelected(uri)
        }
    }

    // Permission Launcher for Camera
    val cameraPermissionLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestPermission()
    ) { isGranted ->
        if (isGranted) {
            val photoFile = File.createTempFile("hazard_${System.currentTimeMillis()}", ".jpg", context.cacheDir)
            val uri = FileProvider.getUriForFile(context, "${context.packageName}.fileprovider", photoFile)
            tempCameraUri = uri
            cameraLauncher.launch(uri)
        } else {
            Toast.makeText(context, "Camera permission is needed to take a photo", Toast.LENGTH_SHORT).show()
        }
    }

    // Permission Launcher for Location
    val locationPermissionLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestMultiplePermissions()
    ) { permissions ->
        val fineGranted = permissions[Manifest.permission.ACCESS_FINE_LOCATION] ?: false
        val coarseGranted = permissions[Manifest.permission.ACCESS_COARSE_LOCATION] ?: false
        if (fineGranted || coarseGranted) {
            try {
                val fusedLocationClient = LocationServices.getFusedLocationProviderClient(context)
                fusedLocationClient.lastLocation.addOnSuccessListener { loc ->
                    if (loc != null) {
                        viewModel.onLocationUpdated(loc.latitude, loc.longitude)
                    }
                }
            } catch (e: SecurityException) {
                // Ignore
            }
        }
    }

    // Auto-fetch location on mount
    LaunchedEffect(Unit) {
        if (ContextCompat.checkSelfPermission(context, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED) {
            try {
                val fusedClient = LocationServices.getFusedLocationProviderClient(context)
                fusedClient.lastLocation.addOnSuccessListener { loc ->
                    if (loc != null) {
                        viewModel.onLocationUpdated(loc.latitude, loc.longitude)
                    }
                }
            } catch (e: Exception) {
                // Ignore
            }
        } else {
            locationPermissionLauncher.launch(
                arrayOf(Manifest.permission.ACCESS_FINE_LOCATION, Manifest.permission.ACCESS_COARSE_LOCATION)
            )
        }
    }

    // Handle navigation events
    LaunchedEffect(Unit) {
        viewModel.navEvents.collect { event ->
            when (event) {
                is ReportNavEvent.NavigateToAiConfirmation -> {
                    onNavigateToAiConfirmation(event.report, event.imageUrl)
                }
                is ReportNavEvent.TriggerOtpAuthRequired -> {
                    onTriggerOtpLogin(event.message)
                }
            }
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = "Report Civic Hazard",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold
                    )
                },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.background
                )
            )
        },
        snackbarHost = { SnackbarHost(snackbarHostState) },
        containerColor = MaterialTheme.colorScheme.background
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 20.dp, vertical = 8.dp)
        ) {
            // 1. Photo Capture Section (MANDATORY)
            Text(
                text = "1. Evidence Photo (Required)",
                style = MaterialTheme.typography.titleSmall,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onBackground
            )

            Spacer(modifier = Modifier.height(8.dp))

            if (uiState.imageUri == null) {
                Card(
                    shape = RoundedCornerShape(20.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f)),
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(180.dp)
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(16.dp),
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.CameraAlt,
                            contentDescription = null,
                            tint = CivicBlue,
                            modifier = Modifier.size(36.dp)
                        )
                        Spacer(modifier = Modifier.height(10.dp))
                        Text(
                            text = "Take a photo or upload from gallery",
                            style = MaterialTheme.typography.bodyMedium,
                            fontWeight = FontWeight.Medium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                        Spacer(modifier = Modifier.height(14.dp))
                        Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                            CivicPillButton(
                                text = "Camera",
                                icon = Icons.Default.CameraAlt,
                                onClick = {
                                    if (ContextCompat.checkSelfPermission(context, Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED) {
                                        val photoFile = File.createTempFile("hazard_${System.currentTimeMillis()}", ".jpg", context.cacheDir)
                                        val uri = FileProvider.getUriForFile(context, "${context.packageName}.fileprovider", photoFile)
                                        tempCameraUri = uri
                                        cameraLauncher.launch(uri)
                                    } else {
                                        cameraPermissionLauncher.launch(Manifest.permission.CAMERA)
                                    }
                                },
                                testTag = "report_camera_button",
                                modifier = Modifier.height(44.dp)
                            )
                            CivicPillButton(
                                text = "Gallery",
                                icon = Icons.Default.AddPhotoAlternate,
                                onClick = { galleryLauncher.launch("image/*") },
                                containerColor = MaterialTheme.colorScheme.surface,
                                contentColor = CivicBlue,
                                testTag = "report_gallery_button",
                                modifier = Modifier
                                    .height(44.dp)
                                    .border(1.dp, CivicBlue, RoundedCornerShape(percent = 50))
                            )
                        }
                    }
                }
            } else {
                // Photo Preview with Retake / Remove action
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(200.dp)
                        .clip(RoundedCornerShape(20.dp))
                        .background(Color.Black)
                ) {
                    AsyncImage(
                        model = uiState.imageUri,
                        contentDescription = "Selected hazard photo",
                        contentScale = ContentScale.Crop,
                        modifier = Modifier.fillMaxSize()
                    )

                    Surface(
                        color = Color.Black.copy(alpha = 0.6f),
                        shape = CircleShape,
                        modifier = Modifier
                            .align(Alignment.TopEnd)
                            .padding(10.dp)
                            .clip(CircleShape)
                            .clickable { viewModel.onImageSelected(null) }
                    ) {
                        Icon(
                            imageVector = Icons.Default.Close,
                            contentDescription = "Remove photo",
                            tint = Color.White,
                            modifier = Modifier
                                .padding(8.dp)
                                .size(18.dp)
                        )
                    }

                    Surface(
                        color = Color.Black.copy(alpha = 0.6f),
                        shape = RoundedCornerShape(percent = 50),
                        modifier = Modifier
                            .align(Alignment.BottomStart)
                            .padding(10.dp)
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.Check,
                                contentDescription = null,
                                tint = Color.Green,
                                modifier = Modifier.size(14.dp)
                            )
                            Spacer(modifier = Modifier.width(4.dp))
                            Text(
                                text = "Photo Attached",
                                color = Color.White,
                                style = MaterialTheme.typography.labelSmall
                            )
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(20.dp))

            // 2. Optional Category Picker (§4 - citizen convenience only, NOT sent to AI endpoint)
            Column {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "2. Hazard Type (Optional)",
                        style = MaterialTheme.typography.titleSmall,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = "AI will verify",
                        style = MaterialTheme.typography.labelSmall,
                        color = CivicBlue,
                        fontWeight = FontWeight.SemiBold
                    )
                }
                Spacer(modifier = Modifier.height(8.dp))

                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .horizontalScroll(rememberScrollState()),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    HazardCategories.CITIZEN_HELPER_OPTIONS.forEach { (catKey, catLabel) ->
                        val isSelected = uiState.citizenCategoryHint == catKey
                        Surface(
                            color = if (isSelected) CivicBlue else MaterialTheme.colorScheme.surfaceVariant,
                            shape = RoundedCornerShape(percent = 50),
                            modifier = Modifier
                                .clip(RoundedCornerShape(percent = 50))
                                .clickable { viewModel.onCategoryHintSelected(catKey) }
                        ) {
                            Text(
                                text = catLabel,
                                color = if (isSelected) Color.White else MaterialTheme.colorScheme.onSurfaceVariant,
                                style = MaterialTheme.typography.labelMedium,
                                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
                                modifier = Modifier.padding(horizontal = 14.dp, vertical = 8.dp)
                            )
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(20.dp))

            // 3. Location Section
            Column {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "3. Location Pin (Auto-GPS)",
                        style = MaterialTheme.typography.titleSmall,
                        fontWeight = FontWeight.Bold
                    )
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier
                            .clip(RoundedCornerShape(8.dp))
                            .clickable { viewModel.setLocationAdjusting(!uiState.isLocationAdjusting) }
                            .padding(4.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.EditLocation,
                            contentDescription = null,
                            tint = CivicBlue,
                            modifier = Modifier.size(16.dp)
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            text = if (uiState.isLocationAdjusting) "Done Adjusting" else "Adjust Pin",
                            style = MaterialTheme.typography.labelSmall,
                            color = CivicBlue,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }

                Spacer(modifier = Modifier.height(6.dp))

                Text(
                    text = "Lat: ${"%.5f".format(uiState.latitude)}, Lng: ${"%.5f".format(uiState.longitude)}",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )

                Spacer(modifier = Modifier.height(10.dp))

                // Small Embedded Map
                Card(
                    shape = RoundedCornerShape(20.dp),
                    elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(160.dp)
                ) {
                    OsmMapView(
                        centerLat = uiState.latitude,
                        centerLng = uiState.longitude,
                        zoomLevel = 15.5,
                        isLocationPicker = true,
                        pickedLat = uiState.latitude,
                        pickedLng = uiState.longitude,
                        onLocationPicked = { lat, lng ->
                            viewModel.onLocationUpdated(lat, lng)
                        }
                    )
                }
            }

            Spacer(modifier = Modifier.height(20.dp))

            // 4. Optional Description
            Text(
                text = "4. Description (Optional)",
                style = MaterialTheme.typography.titleSmall,
                fontWeight = FontWeight.Bold
            )

            Spacer(modifier = Modifier.height(8.dp))

            OutlinedTextField(
                value = uiState.description,
                onValueChange = { viewModel.onDescriptionChanged(it) },
                placeholder = { Text("Add any specifics (e.g. near fire hydrant, obstructing school bus route)...") },
                shape = RoundedCornerShape(16.dp),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = CivicBlue,
                    unfocusedContainerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.4f),
                    focusedContainerColor = MaterialTheme.colorScheme.surface
                ),
                maxLines = 4,
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("report_description_input")
            )

            Spacer(modifier = Modifier.height(16.dp))

            // Error display if any
            if (uiState.errorMessage != null) {
                Surface(
                    color = MaterialTheme.colorScheme.errorContainer,
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier.padding(12.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = Icons.Default.Info,
                            contentDescription = null,
                            tint = MaterialTheme.colorScheme.error
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = uiState.errorMessage ?: "",
                            color = MaterialTheme.colorScheme.onErrorContainer,
                            style = MaterialTheme.typography.bodySmall
                        )
                    }
                }
                Spacer(modifier = Modifier.height(16.dp))
            }

            // Progress status if submitting
            if (uiState.isSubmitting) {
                Surface(
                    color = CivicBlue.copy(alpha = 0.1f),
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier.padding(12.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        CircularProgressIndicator(
                            color = CivicBlue,
                            strokeWidth = 2.dp,
                            modifier = Modifier.size(18.dp)
                        )
                        Spacer(modifier = Modifier.width(10.dp))
                        Text(
                            text = uiState.uploadProgressStep,
                            style = MaterialTheme.typography.bodySmall,
                            fontWeight = FontWeight.Medium,
                            color = CivicBlue
                        )
                    }
                }
                Spacer(modifier = Modifier.height(16.dp))
            }

            // Submit Button (§1 & §2 full upload sequence)
            CivicPillButton(
                text = if (uiState.isSubmitting) "Submitting Report..." else "Submit Report",
                onClick = { viewModel.submitReport(context) },
                enabled = uiState.imageUri != null,
                isLoading = uiState.isSubmitting,
                icon = Icons.Default.Send,
                testTag = "submit_report_button",
                modifier = Modifier.fillMaxWidth()
            )

            Spacer(modifier = Modifier.height(30.dp))
        }
    }
}
