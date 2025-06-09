import { useState, useEffect } from 'react'
import { useUI } from '@/store'

interface NetworkInfo {
  isOnline: boolean
  effectiveType: 'slow-2g' | '2g' | '3g' | '4g' | 'unknown'
  downlink: number
  rtt: number
  saveData: boolean
}

interface NetworkOptimization {
  networkInfo: NetworkInfo
  isSlowConnection: boolean
  shouldOptimizeImages: boolean
  shouldPreloadContent: boolean
  connectionQuality: 'fast' | 'slow' | 'offline'
}

export const useNetworkOptimization = (): NetworkOptimization => {
  const { setNetworkStatus } = useUI()
  const [networkInfo, setNetworkInfo] = useState<NetworkInfo>({
    isOnline: navigator.onLine,
    effectiveType: 'unknown',
    downlink: 0,
    rtt: 0,
    saveData: false,
  })

  useEffect(() => {
    const updateNetworkInfo = () => {
      const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection

      const info: NetworkInfo = {
        isOnline: navigator.onLine,
        effectiveType: connection?.effectiveType || 'unknown',
        downlink: connection?.downlink || 0,
        rtt: connection?.rtt || 0,
        saveData: connection?.saveData || false,
      }

      setNetworkInfo(info)

      // Determine connection quality for South African networks
      let quality: 'fast' | 'slow' | 'offline' = 'fast'
      
      if (!info.isOnline) {
        quality = 'offline'
      } else if (
        info.effectiveType === 'slow-2g' || 
        info.effectiveType === '2g' || 
        (info.effectiveType === '3g' && info.downlink < 1.5) ||
        info.saveData
      ) {
        quality = 'slow'
      }

      setNetworkStatus(!info.isOnline, quality)
    }

    // Initial check
    updateNetworkInfo()

    // Listen for network changes
    window.addEventListener('online', updateNetworkInfo)
    window.addEventListener('offline', updateNetworkInfo)

    // Listen for connection changes (if supported)
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection
    if (connection) {
      connection.addEventListener('change', updateNetworkInfo)
    }

    return () => {
      window.removeEventListener('online', updateNetworkInfo)
      window.removeEventListener('offline', updateNetworkInfo)
      if (connection) {
        connection.removeEventListener('change', updateNetworkInfo)
      }
    }
  }, [setNetworkStatus])

  // Determine optimization strategies
  const isSlowConnection = 
    !networkInfo.isOnline ||
    networkInfo.effectiveType === 'slow-2g' ||
    networkInfo.effectiveType === '2g' ||
    (networkInfo.effectiveType === '3g' && networkInfo.downlink < 1.5) ||
    networkInfo.saveData

  const shouldOptimizeImages = isSlowConnection || networkInfo.saveData
  const shouldPreloadContent = networkInfo.isOnline && !isSlowConnection && !networkInfo.saveData

  const connectionQuality: 'fast' | 'slow' | 'offline' = 
    !networkInfo.isOnline ? 'offline' : isSlowConnection ? 'slow' : 'fast'

  return {
    networkInfo,
    isSlowConnection,
    shouldOptimizeImages,
    shouldPreloadContent,
    connectionQuality,
  }
}
