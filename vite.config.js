import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [],
      manifest: {
        name: 'Gestión de Calderas',
        short_name: 'Calderas PWA',
        description: 'Aplicación para la gestión y mantenimiento de calderas',
        theme_color: '#FF6B00',
        icons: [
          {
            src: 'boiler_3d.png',
            sizes: '192x192',
            type: 'image/png'
          }
        ]
      }
    })
  ]
})
