"use client"

import { DynamicContextProvider, DynamicWidget } from "@dynamic-labs/sdk-react-core"
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum"
import { ReactNode } from "react"

interface Web3ProviderProps {
  children: ReactNode
}

export function Web3Provider({ children }: Web3ProviderProps) {
  return (
    <DynamicContextProvider
      settings={{
        environmentId: process.env.NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID!,
        walletConnectors: [EthereumWalletConnectors],
        
        // 🎨 Theme customization to match your brand
        cssOverrides: `
          /* Modal overlay */
          .dynamic-widget-modal-overlay {
            background: rgba(5, 10, 8, 0.95);
            backdrop-filter: blur(8px);
          }

          /* Main modal card */
          .dynamic-widget-card {
            background: #0a1411;
            border: 2px solid rgba(6, 214, 160, 0.4);
            border-radius: 24px;
            box-shadow: 0 20px 60px rgba(0, 255, 255, 0.2);
          }

          /* Header */
          .dynamic-widget-modal__header {
            border-bottom: 1px solid rgba(6, 214, 160, 0.2);
          }

          /* Wallet buttons */
          .dynamic-widget-wallet-button {
            background: rgba(6, 214, 160, 0.1);
            border: 1px solid rgba(6, 214, 160, 0.3);
            border-radius: 12px;
            transition: all 0.2s ease;
          }

          .dynamic-widget-wallet-button:hover {
            background: rgba(6, 214, 160, 0.2);
            border-color: rgba(6, 214, 160, 0.5);
            transform: translateY(-2px);
          }

          /* Connect button */
          .dynamic-connect-button {
            background: linear-gradient(135deg, #06d6a0 0%, #00f0ff 100%);
            color: #050a08;
            font-weight: 900;
            font-family: 'Arial Black', sans-serif;
            letter-spacing: 0.05em;
            border-radius: 12px;
            padding: 12px 24px;
            border: none;
            transition: all 0.2s ease;
          }

          .dynamic-connect-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(6, 214, 160, 0.4);
          }

          /* Log in or sign up button - NEW */
          .dynamic-widget-button,
          .dynamic-widget-auth-button,
          .dynamic-widget-primary-button,
          .dynamic-widget-secondary-button,
          button[data-testid="dynamic-widget-button"],
          button[class*="dynamic-widget"][class*="button"] {
            background: linear-gradient(135deg, #06d6a0 0%, #00f0ff 100%) !important;
            color: #050a08 !important;
            font-weight: 900 !important;
            font-family: 'Arial Black', sans-serif !important;
            letter-spacing: 0.05em !important;
            border-radius: 12px !important;
            padding: 12px 24px !important;
            border: none !important;
            transition: all 0.2s ease !important;
          }

          .dynamic-widget-button:hover,
          .dynamic-widget-auth-button:hover,
          .dynamic-widget-primary-button:hover,
          .dynamic-widget-secondary-button:hover,
          button[data-testid="dynamic-widget-button"]:hover,
          button[class*="dynamic-widget"][class*="button"]:hover {
            transform: translateY(-2px) !important;
            box-shadow: 0 8px 24px rgba(6, 214, 160, 0.4) !important;
            background: linear-gradient(135deg, #00f0ff 0%, #06d6a0 100%) !important;
          }

          /* Social login buttons */
          .dynamic-widget-social-button,
          [class*="social"][class*="button"] {
            background: rgba(6, 214, 160, 0.1) !important;
            border: 1px solid rgba(6, 214, 160, 0.3) !important;
            color: #06d6a0 !important;
            border-radius: 12px !important;
            transition: all 0.2s ease !important;
          }

          .dynamic-widget-social-button:hover,
          [class*="social"][class*="button"]:hover {
            background: rgba(6, 214, 160, 0.2) !important;
            border-color: rgba(6, 214, 160, 0.5) !important;
            transform: translateY(-2px) !important;
          }

          /* Email form submit button */
          .dynamic-widget-submit-button,
          [type="submit"][class*="dynamic-widget"] {
            background: linear-gradient(135deg, #06d6a0 0%, #00f0ff 100%) !important;
            color: #050a08 !important;
            font-weight: 900 !important;
            font-family: 'Arial Black', sans-serif !important;
            letter-spacing: 0.05em !important;
            border-radius: 12px !important;
            padding: 12px 24px !important;
            border: none !important;
            transition: all 0.2s ease !important;
          }

          .dynamic-widget-submit-button:hover,
          [type="submit"][class*="dynamic-widget"]:hover {
            transform: translateY(-2px) !important;
            box-shadow: 0 8px 24px rgba(6, 214, 160, 0.4) !important;
          }

          /* Text colors */
          .dynamic-widget-modal__content {
            color: rgba(224, 240, 255, 0.9);
          }

          /* Input fields */
          .dynamic-widget-input {
            background: #050a08;
            border: 1px solid rgba(6, 214, 160, 0.3);
            border-radius: 8px;
            color: #fff;
          }

          .dynamic-widget-input:focus {
            border-color: rgba(6, 214, 160, 0.6);
            outline: none;
            box-shadow: 0 0 0 3px rgba(6, 214, 160, 0.1);
          }

          /* Scrollbar */
          .dynamic-widget-modal__content::-webkit-scrollbar {
            width: 8px;
          }

          .dynamic-widget-modal__content::-webkit-scrollbar-track {
            background: rgba(6, 214, 160, 0.1);
            border-radius: 4px;
          }

          .dynamic-widget-modal__content::-webkit-scrollbar-thumb {
            background: rgba(6, 214, 160, 0.4);
            border-radius: 4px;
          }

          .dynamic-widget-modal__content::-webkit-scrollbar-thumb:hover {
            background: rgba(6, 214, 160, 0.6);
          }
        `,

        // 🔐 Events handlers (useful for analytics & user tracking)
        events: {
          onAuthSuccess: (args) => {
            console.log("✅ User authenticated:", args.user)
            // TODO: Track authentication event
            // analytics.track('wallet_connected', { wallet: args.primaryWallet?.address })
          },
          onLogout: () => {
            console.log("👋 User logged out")
            // TODO: Track logout event
            // analytics.track('wallet_disconnected')
          },
          onAuthFlowClose: () => {
            console.log("❌ Auth flow closed")
          },
          onAuthFlowOpen: () => {
            console.log("🔓 Auth flow opened")
          },
        },

        // 🎯 Recommended settings for Web3 dApps
        initialAuthenticationMode: 'connect-only', // Don't require email
        recommendedWallets: [
          {
            walletKey: 'metamask',
            label: 'Popular',
          },
          {
            walletKey: 'walletconnect',
          },
          {
            walletKey: 'coinbase',
          },
        ],

        // 🔗 Enable email/social login (optional - for better UX)
        // emailWalletsEnabled: true,
        // socialProvidersFilter: (providers) => providers.filter(p => 
        //   ['google', 'twitter', 'discord'].includes(p.provider)
        // ),

        // 🛡️ Privacy settings
        privacyPolicyUrl: 'https://thesislab.xyz/privacy',
        termsOfServiceUrl: 'https://thesislab.xyz/terms',

        // 🌐 Network configuration
        // The Dynamic SDK automatically handles mainnet by default
        // No need to explicitly define networks unless you're using custom networks
      }}
    >
      {children}
    </DynamicContextProvider>
  )
}

// 🎨 Custom styled wallet button component
export function ConnectWalletButton({ 
  className = "",
  children 
}: { 
  className?: string
  children?: ReactNode 
}) {
  return (
    <DynamicWidget
      innerButtonComponent={
        children || (
          <span className={`
            inline-flex items-center space-x-2 
            px-6 py-3 
            bg-gradient-to-r from-cyan-400 to-cyan-300
            text-[#050a08] 
            rounded-lg 
            font-black 
            text-sm 
            tracking-wide 
            hover:shadow-lg hover:shadow-cyan-400/50
            hover:-translate-y-0.5
            transition-all duration-200
            ${className}
          `}>
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            <span>CONNECT WALLET</span>
          </span>
        )
      }
    />
  )
}
