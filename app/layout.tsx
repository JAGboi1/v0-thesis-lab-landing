"use client"

import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { GeistProvider, CssBaseline } from "@geist-ui/core"
import { Analytics } from "@vercel/analytics/next"
import { DynamicContextProvider } from "@dynamic-labs/sdk-react-core"
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum"
import "./globals.css"

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
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable} dark`}>
      <body className="font-sans antialiased">
        <GeistProvider>
          <CssBaseline />
          <DynamicContextProvider
            settings={{
              environmentId: process.env.NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID || "",
              walletConnectors: [EthereumWalletConnectors],
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
        </GeistProvider>
      </body>
    </html>
  )
}