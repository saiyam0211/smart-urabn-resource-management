// src/components/InteractiveMap.js
import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const LocationMarker = ({ position, onPositionChange, draggableMarker }) => {
    const map = useMap();

    useEffect(() => {
        if (position) {
            map.flyTo(position, map.getZoom());
        }
    }, [position, map]);

    return position ? (
        <Marker 
            position={position}
            draggable={draggableMarker}
            eventHandlers={{
                dragend: (e) => {
                    if (onPositionChange) {
                        const marker = e.target;
                        const position = marker.getLatLng();
                        onPositionChange(position);
                    }
                },
            }}
        >
            <Popup>Selected Location</Popup>
        </Marker>
    ) : null;
};

const InteractiveMap = ({ 
    position,
    onPositionChange,
    draggableMarker = false,
    className = "h-[400px]"
}) => {
    const defaultPosition = position || { lat: 51.505, lng: -0.09 };

    return (
        <div className={className}>
            <MapContainer
                center={[defaultPosition.lat, defaultPosition.lng]}
                zoom={13}
                style={{ height: "100%", width: "100%" }}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <LocationMarker 
                    position={position} 
                    onPositionChange={onPositionChange}
                    draggableMarker={draggableMarker}
                />
            </MapContainer>
        </div>
    );
};

export default InteractiveMap;