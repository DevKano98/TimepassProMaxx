package com.example.ui.screens.auth

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.background
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
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Email
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.Security
import androidx.compose.material.icons.filled.Verified
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
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.model.ReportResponse
import com.example.ui.components.CivicPillButton
import com.example.ui.theme.CivicBlue
import com.example.ui.theme.SeverityCriticalContainer
import com.example.ui.theme.SeverityResolved
import com.example.ui.theme.SeverityResolvedContainer

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LoginOtpScreen(
    viewModel: AuthViewModel,
    returnDestination: String,
    retryReport: Boolean,
    onNavigateBack: () -> Unit,
    onAuthSuccess: (String) -> Unit,
    onReportRetrySuccess: (ReportResponse, String) -> Unit
) {
    val context = LocalContext.current
    val uiState by viewModel.uiState.collectAsState()

    LaunchedEffect(Unit) {
        viewModel.navEvents.collect { event ->
            when (event) {
                is AuthNavEvent.AuthSuccess -> {
                    onAuthSuccess(event.returnDestination)
                }
                is AuthNavEvent.ReportRetrySuccess -> {
                    onReportRetrySuccess(event.report, event.imageUrl)
                }
            }
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = if (retryReport) "Verify to Complete Report" else "Citizen Verification",
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
        containerColor = MaterialTheme.colorScheme.background
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 24.dp, vertical = 16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // Icon
            Box(
                modifier = Modifier
                    .size(60.dp)
                    .background(CivicBlue.copy(alpha = 0.12f), CircleShape),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = Icons.Default.Security,
                    contentDescription = null,
                    tint = CivicBlue,
                    modifier = Modifier.size(32.dp)
                )
            }

            Spacer(modifier = Modifier.height(16.dp))

            Text(
                text = if (retryReport) "Anonymous Limit Reached" else "Passwordless OTP Sign-In",
                style = MaterialTheme.typography.headlineSmall,
                fontWeight = FontWeight.Bold,
                textAlign = TextAlign.Center
            )

            Spacer(modifier = Modifier.height(6.dp))

            Text(
                text = if (retryReport)
                    "You've reached the 3 daily anonymous report limit. Verify with a quick email code to submit your report instantly without re-uploading."
                else
                    "Enter your email to receive a secure one-time verification code. No password required.",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                textAlign = TextAlign.Center
            )

            Spacer(modifier = Modifier.height(24.dp))

            // Email Input
            OutlinedTextField(
                value = uiState.email,
                onValueChange = { viewModel.onEmailChanged(it) },
                label = { Text("Email Address") },
                placeholder = { Text("citizen@example.com") },
                leadingIcon = { Icon(Icons.Default.Email, contentDescription = null, tint = CivicBlue) },
                enabled = !uiState.isOtpSent && !uiState.isLoading,
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
                singleLine = true,
                shape = RoundedCornerShape(16.dp),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = CivicBlue,
                    focusedContainerColor = MaterialTheme.colorScheme.surface,
                    unfocusedContainerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.4f)
                ),
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("auth_email_input")
            )

            Spacer(modifier = Modifier.height(16.dp))

            if (!uiState.isOtpSent) {
                CivicPillButton(
                    text = if (uiState.isLoading) "Sending OTP..." else "Send One-Time Code",
                    onClick = { viewModel.requestOtp() },
                    isLoading = uiState.isLoading,
                    testTag = "auth_send_otp_button",
                    modifier = Modifier.fillMaxWidth()
                )
            } else {
                // OTP input section
                AnimatedVisibility(visible = uiState.isOtpSent) {
                    Column(modifier = Modifier.fillMaxWidth()) {
                        OutlinedTextField(
                            value = uiState.otp,
                            onValueChange = { viewModel.onOtpChanged(it) },
                            label = { Text("Enter 6-Digit Code") },
                            placeholder = { Text("123456") },
                            leadingIcon = { Icon(Icons.Default.Lock, contentDescription = null, tint = CivicBlue) },
                            enabled = !uiState.isLoading,
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                            singleLine = true,
                            shape = RoundedCornerShape(16.dp),
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = CivicBlue,
                                focusedContainerColor = MaterialTheme.colorScheme.surface,
                                unfocusedContainerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.4f)
                            ),
                            modifier = Modifier
                                .fillMaxWidth()
                                .testTag("auth_otp_input")
                        )

                        Spacer(modifier = Modifier.height(16.dp))

                        CivicPillButton(
                            text = if (uiState.isRetryingReport) "Submitting Report..." else if (uiState.isLoading) "Verifying..." else "Verify & Continue",
                            onClick = {
                                viewModel.verifyOtp(context, returnDestination, retryReport)
                            },
                            isLoading = uiState.isLoading,
                            icon = Icons.Default.Verified,
                            testTag = "auth_verify_button",
                            modifier = Modifier.fillMaxWidth()
                        )

                        Spacer(modifier = Modifier.height(8.dp))

                        TextButton(
                            onClick = { viewModel.requestOtp() },
                            enabled = !uiState.isLoading,
                            modifier = Modifier.align(Alignment.CenterHorizontally)
                        ) {
                            Text("Resend Code", color = CivicBlue, fontWeight = FontWeight.SemiBold)
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Status feedback message
            if (uiState.statusMessage != null) {
                Surface(
                    color = SeverityResolvedContainer,
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier.padding(12.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = Icons.Default.Verified,
                            contentDescription = null,
                            tint = SeverityResolved
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = uiState.statusMessage ?: "",
                            color = SeverityResolved,
                            style = MaterialTheme.typography.bodySmall,
                            fontWeight = FontWeight.Medium
                        )
                    }
                }
                Spacer(modifier = Modifier.height(12.dp))
            }

            // Error feedback message
            if (uiState.errorMessage != null) {
                Surface(
                    color = SeverityCriticalContainer,
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
            }
        }
    }
}
