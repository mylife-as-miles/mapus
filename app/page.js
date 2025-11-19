'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { getMapusDB } from '@/lib/db'

// Dynamically import MapComponent to avoid SSR issues with Leaflet
const MapComponent = dynamic(() => import('@/components/MapComponent'), {
  ssr: false
})

export default function Home() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [dbReady, setDbReady] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [showPopup, setShowPopup] = useState(false)
  const room = searchParams.get('file')

  useEffect(() => {
    async function init() {
      const db = getMapusDB()
      if (!db) return

      await db.init()
      
      // Create or get local user
      let user = await db.getUser('local_user')
      if (!user) {
        user = {
          id: 'local_user',
          uid: 'local_user',
          name: 'User',
          session: Date.now()
        }
        await db.saveUser('local_user', user)
      }
      
      setCurrentUser(user)
      setDbReady(true)

      if (!room) {
        setShowPopup(true)
      }
    }

    init()
  }, [room])

  const handleCreateMap = async () => {
    const db = getMapusDB()
    if (!db || !dbReady) return

    const key = db.generateId()
    await db.createRoom(key, {
      name: "New map",
      description: "Map description"
    })
    
    router.push(`/?file=${key}`)
    setShowPopup(false)
  }

  if (!dbReady) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <div>Loading...</div>
      </div>
    )
  }

  return (
    <main style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      {showPopup && (
        <>
          <div 
            id="overlay" 
            className="overlay signin"
            onClick={() => setShowPopup(false)}
            style={{
              position: 'absolute',
              zIndex: 9999999,
              backgroundColor: '#222222',
              opacity: 0.4,
              top: 0,
              left: 0,
              width: '100%',
              height: '100%'
            }}
          />
          <div 
            id="popup" 
            className="popup signin"
            style={{
              position: 'absolute',
              margin: 'auto',
              left: 0,
              right: 0,
              top: 0,
              bottom: 0,
              height: '190px',
              backgroundColor: '#FFF',
              borderRadius: '5px',
              width: '480px',
              zIndex: 99999999
            }}
          >
            <div className="header-text">Create a map</div>
            <div className="subheader-text">Create your first map to get started.</div>
            <div 
              id="create-map"
              onClick={handleCreateMap}
              style={{
                fontFamily: 'Inter',
                fontWeight: 500,
                fontSize: '14px',
                color: '#FFF',
                backgroundColor: '#222222',
                borderRadius: '5px',
                padding: '12px 24px',
                textAlign: 'center',
                cursor: 'pointer',
                margin: '20px auto',
                width: 'fit-content'
              }}
            >
              Create a map
            </div>
          </div>
        </>
      )}
      
      {room && <MapComponent room={room} currentUser={currentUser} />}
    </main>
  )
}

