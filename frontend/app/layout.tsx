"use client"

import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { DynamicContextProvider } from "@dynamic-labs/sdk-react-core"
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Thesis Lab - AI Evaluation Mining Platform",
  description: "Mine valuable data by evaluating AI responses on the Ritual chain",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans antialiased">
        <DynamicContextProvider
          settings={{
            environmentId: process.env.NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID!,
            walletConnectors: [EthereumWalletConnectors],
            // Optional: customize the Dynamic modal appearance
            cssOverrides: `
              .dynamic-widget-inline-controls {
                background: transparent;
              }
              .dynamic-widget-card {
                background: #0a1411;
                border: 2px solid rgba(0, 255, 255, 0.3);
                border-radius: 16px;
              }
              .dynamic-widget-modal {
                background: #050a08;
              }
            `,
          }}
        >
          {children}
          <Analytics />
        </DynamicContextProvider>
      </body>
    </html>
  )
}