'use client'

import { useEffect, useRef, useState } from 'react'
import { MapContainer, TileLayer } from 'react-leaflet'
import { getMapusDB } from '@/lib/db'
import 'leaflet/dist/leaflet.css'
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css'

export default function MapComponent({ room, currentUser }) {
  const mapRef = useRef(null)
  const [mapInstance, setMapInstance] = useState(null)
  const [objects, setObjects] = useState([])

  useEffect(() => {
    async function loadData() {
      const db = getMapusDB()
      if (!db) return

      const roomData = await db.getRoom(room)
      const allObjects = await db.getAllObjects(room)
      
      if (allObjects) {
        setObjects(Object.values(allObjects))
      }
    }

    if (room) {
      loadData()
    }
  }, [room])

  useEffect(() => {
    if (mapInstance && typeof window !== 'undefined') {
      // Initialize Geoman when map is ready
      import('@geoman-io/leaflet-geoman-free').then((PM) => {
        if (mapInstance.pm) {
          mapInstance.pm.setOptIn(true)
        }
      })
    }
  }, [mapInstance])

  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative' }}>
      <MapContainer
        center={[51.52, -0.09]}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        whenCreated={setMapInstance}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={18}
          minZoom={3}
          noWrap={true}
        />
      </MapContainer>
      
      {/* Sidebar and controls will be added here */}
      <div id="sidebar" style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: '320px',
        height: '100%',
        backgroundColor: '#FFF',
        zIndex: 1000,
        overflowY: 'auto',
        boxShadow: '2px 0 10px rgba(0,0,0,0.1)'
      }}>
        <div style={{ padding: '20px' }}>
          <h2>Mapus</h2>
          <p>Room: {room}</p>
        </div>
      </div>
    </div>
  )
}

