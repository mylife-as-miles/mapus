import { Inter } from 'next/font/google'
import '../styles/globals.css'
import 'leaflet/dist/leaflet.css'
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Mapus - Map Tool with IndexedDB',
  description: 'A map tool with local storage using IndexedDB',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className} style={{ margin: 0 }}>
        {children}
      </body>
    </html>
  )
}

