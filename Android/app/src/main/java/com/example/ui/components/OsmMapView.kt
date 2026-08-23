package com.example.ui.components

import android.content.Context
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Paint
import android.graphics.drawable.BitmapDrawable
import android.graphics.drawable.Drawable
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.viewinterop.AndroidView
import androidx.core.content.ContextCompat
import com.example.data.model.IncidentReportItem
import org.osmdroid.config.Configuration
import org.osmdroid.tileprovider.tilesource.TileSourceFactory
import org.osmdroid.util.GeoPoint
import org.osmdroid.views.CustomZoomButtonsController
import org.osmdroid.views.MapView
import org.osmdroid.views.overlay.Marker
import org.osmdroid.views.overlay.MapEventsOverlay
import org.osmdroid.events.MapEventsReceiver

@Composable
fun OsmMapView(
    modifier: Modifier = Modifier,
    centerLat: Double = 19.21258,
    centerLng: Double = 73.08346,
    zoomLevel: Double = 14.5,
    incidents: List<IncidentReportItem> = emptyList(),
    selectedIncidentId: String? = null,
    isLocationPicker: Boolean = false,
    pickedLat: Double? = null,
    pickedLng: Double? = null,
    onLocationPicked: ((Double, Double) -> Unit)? = null,
    onIncidentClick: ((IncidentReportItem) -> Unit)? = null
) {
    val context = LocalContext.current

    // Initialize osmdroid configuration
    remember {
        Configuration.getInstance().load(context, context.getSharedPreferences("osmdroid", Context.MODE_PRIVATE))
        Configuration.getInstance().userAgentValue = "CivicGuard-Android/1.0"
    }

    val mapView = remember {
        MapView(context).apply {
            setTileSource(TileSourceFactory.MAPNIK)
            zoomController.setVisibility(CustomZoomButtonsController.Visibility.NEVER)
            setMultiTouchControls(true)
            controller.setZoom(zoomLevel)
            controller.setCenter(GeoPoint(centerLat, centerLng))
        }
    }

    DisposableEffect(Unit) {
        onDispose {
            mapView.onDetach()
        }
    }

    AndroidView(
        factory = { mapView },
        modifier = modifier.fillMaxSize(),
        update = { map ->
            map.overlays.clear()

            // If in location picker mode, add touch listener and draggable/single pin
            if (isLocationPicker) {
                val receiver = object : MapEventsReceiver {
                    override fun singleTapConfirmedHelper(p: GeoPoint?): Boolean {
                        p?.let {
                            onLocationPicked?.invoke(it.latitude, it.longitude)
                        }
                        return true
                    }

                    override fun longPressHelper(p: GeoPoint?): Boolean {
                        return false
                    }
                }
                map.overlays.add(MapEventsOverlay(receiver))

                val pinLat = pickedLat ?: centerLat
                val pinLng = pickedLng ?: centerLng
                val pinMarker = Marker(map).apply {
                    position = GeoPoint(pinLat, pinLng)
                    title = "Selected Location"
                    setAnchor(Marker.ANCHOR_CENTER, Marker.ANCHOR_BOTTOM)
                    icon = createMarkerDrawable(context, 0xFF0052FF.toInt(), "•")
                }
                map.overlays.add(pinMarker)
                map.controller.animateTo(GeoPoint(pinLat, pinLng))
            } else {
                // Add hazard incident markers
                incidents.forEach { incident ->
                    val isSelected = incident.id == selectedIncidentId || incident.incidentId == selectedIncidentId
                    val colorInt = when (incident.severity?.lowercase()) {
                        "critical" -> 0xFFCF202F.toInt()
                        "high" -> 0xFFF4780A.toInt()
                        "medium" -> 0xFFF4B000.toInt()
                        "resolved" -> 0xFF05B169.toInt()
                        else -> 0xFF0052FF.toInt()
                    }

                    val marker = Marker(map).apply {
                        position = GeoPoint(incident.latitude, incident.longitude)
                        title = incident.category ?: "Hazard"
                        snippet = incident.description ?: "Incident reported"
                        setAnchor(Marker.ANCHOR_CENTER, Marker.ANCHOR_BOTTOM)
                        icon = createMarkerDrawable(context, colorInt, if (isSelected) "!" else "•", isSelected)
                        setOnMarkerClickListener { _, _ ->
                            onIncidentClick?.invoke(incident)
                            true
                        }
                    }
                    map.overlays.add(marker)
                }

                // Add current user location marker
                val userMarker = Marker(map).apply {
                    position = GeoPoint(centerLat, centerLng)
                    title = "Your Location"
                    setAnchor(Marker.ANCHOR_CENTER, Marker.ANCHOR_CENTER)
                    icon = createUserLocationDrawable(context)
                }
                map.overlays.add(userMarker)

                // Animate and center map to live GPS coordinates
                if (centerLat != 0.0 && centerLng != 0.0) {
                    map.controller.animateTo(GeoPoint(centerLat, centerLng))
                }
            }

            map.invalidate()
        }
    )
}


private fun createMarkerDrawable(context: Context, color: Int, symbol: String, isSelected: Boolean = false): Drawable {
    val sizePx = if (isSelected) 84 else 68
    val bitmap = Bitmap.createBitmap(sizePx, sizePx, Bitmap.Config.ARGB_8888)
    val canvas = Canvas(bitmap)

    val paint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        this.color = color
        style = Paint.Style.FILL
    }

    val shadowPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        this.color = 0x44000000
        style = Paint.Style.FILL
    }

    // Shadow
    canvas.drawCircle(sizePx / 2f, sizePx * 0.42f + 4, sizePx * 0.36f, shadowPaint)

    // Outer circle / pin head
    canvas.drawCircle(sizePx / 2f, sizePx * 0.42f, sizePx * 0.36f, paint)

    // White inner border
    val borderPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        this.color = android.graphics.Color.WHITE
        style = Paint.Style.STROKE
        strokeWidth = 4f
    }
    canvas.drawCircle(sizePx / 2f, sizePx * 0.42f, sizePx * 0.36f - 2f, borderPaint)

    // Pin bottom tip
    val path = android.graphics.Path().apply {
        moveTo(sizePx * 0.32f, sizePx * 0.55f)
        lineTo(sizePx / 2f, sizePx * 0.95f)
        lineTo(sizePx * 0.68f, sizePx * 0.55f)
        close()
    }
    canvas.drawPath(path, paint)

    // Inner symbol
    val textPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        this.color = android.graphics.Color.WHITE
        textSize = if (isSelected) 30f else 24f
        textAlign = Paint.Align.CENTER
    }
    val yPos = (sizePx * 0.42f) - ((textPaint.descent() + textPaint.ascent()) / 2)
    canvas.drawText(symbol, sizePx / 2f, yPos, textPaint)

    return BitmapDrawable(context.resources, bitmap)
}

private fun createUserLocationDrawable(context: Context): Drawable {
    val sizePx = 48
    val bitmap = Bitmap.createBitmap(sizePx, sizePx, Bitmap.Config.ARGB_8888)
    val canvas = Canvas(bitmap)

    // Outer halo
    val haloPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        color = 0x330052FF
        style = Paint.Style.FILL
    }
    canvas.drawCircle(sizePx / 2f, sizePx / 2f, sizePx / 2f, haloPaint)

    // Blue circle
    val dotPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        color = 0xFF0052FF.toInt()
        style = Paint.Style.FILL
    }
    canvas.drawCircle(sizePx / 2f, sizePx / 2f, sizePx * 0.28f, dotPaint)

    // White border
    val borderPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        color = android.graphics.Color.WHITE
        style = Paint.Style.STROKE
        strokeWidth = 3f
    }
    canvas.drawCircle(sizePx / 2f, sizePx / 2f, sizePx * 0.28f, borderPaint)

    return BitmapDrawable(context.resources, bitmap)
}
