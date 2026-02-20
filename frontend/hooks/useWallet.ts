"use client"

import { useDynamicContext } from "@dynamic-labs/sdk-react-core"
import { useEffect, useState } from "react"

/**
 * Custom hook for simplified wallet management
 * Provides easy access to wallet state and user information
 */
export function useWallet() {
  const { 
    primaryWallet, 
    user, 
    sdkHasLoaded, 
    handleLogOut,
    setShowAuthFlow
  } = useDynamicContext()

  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    if (sdkHasLoaded) {
      setIsReady(true)
    }
  }, [sdkHasLoaded])

  return {
    // Wallet information
    address: primaryWallet?.address ?? null,
    chain: primaryWallet?.chain ?? null,
    connector: primaryWallet?.connector ?? null,
    
    // User information
    user: user ?? null,
    email: user?.email ?? null,
    username: user?.username ?? null,
    
    // Authentication state
    isConnected: !!primaryWallet?.address,
    isReady,
    
    // Actions
    connect: () => setShowAuthFlow(true),
    disconnect: handleLogOut,
    
    // Raw wallet object for advanced use
    wallet: primaryWallet,
  }
}

/**
 * Example usage:
 * 
 * ```tsx
 * function MyComponent() {
 *   const { address, isConnected, connect, disconnect } = useWallet()
 *   
 *   if (!isConnected) {
 *     return <button onClick={connect}>Connect Wallet</button>
 *   }
 *   
 *   return (
 *     <div>
 *       <p>Connected: {address}</p>
 *       <button onClick={disconnect}>Disconnect</button>
 *     </div>
 *   )
 * }
 * ```
 */
