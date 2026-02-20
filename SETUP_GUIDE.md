# Web3 Integration Setup Guide

## Prerequisites
- Node.js 16+ and npm/yarn
- A [Dynamic.xyz](https://www.dynamic.xyz/) account for wallet authentication
- A Supabase project (for database)

## 1. Install Dependencies

First, install the required dependencies:

```bash
# Navigate to frontend directory
cd frontend

# Install Dynamic SDK and other dependencies
npm install @dynamic-labs/sdk-react-core @dynamic-labs/ethereum
```

## 2. Environment Setup

1. Copy the `.env.template` file to `.env.local` in the frontend directory:
   ```bash
   cp env.template .env.local
   ```

2. Update the environment variables in `.env.local`:
   - `NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID`: Get this from your Dynamic.xyz dashboard
   - `NEXT_PUBLIC_API_URL`: Your backend API URL (default: http://localhost:8000)

## 3. Update Layout Component

Replace your `app/layout.tsx` with the following to include the Web3Provider:

```tsx
import { Web3Provider } from "@/components/Web3Provider"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Web3Provider>
          {children}
        </Web3Provider>
      </body>
    </html>
  )
}
```

## 4. Using the useWallet Hook

You can now use the `useWallet` hook in any component to interact with the user's wallet:

```tsx
"use client"

import { useWallet } from "@/hooks/useWallet"

export default function YourComponent() {
  const { address, isConnected, connect, disconnect } = useWallet()

  return (
    <div>
      {isConnected ? (
        <div>
          <p>Connected: {address}</p>
          <button onClick={disconnect}>Disconnect</button>
        </div>
      ) : (
        <button onClick={connect}>Connect Wallet</button>
      )}
    </div>
  )
}
```

## 5. Run the Application

Start the development server:

```bash
npm run dev
```

Visit `http://localhost:3000` in your browser to see the application.

## 6. Testing

1. Try connecting a wallet using the Connect button
2. Verify that the wallet address is displayed when connected
3. Test disconnecting the wallet

## Troubleshooting

- If you see "Invalid Dynamic environment ID" errors, double-check your `NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID` in `.env.local`
- Make sure your Dynamic.xyz dashboard has the correct allowed domains configured
- Check browser console for any errors

## Next Steps

- Implement wallet-based authentication with your backend
- Add transaction signing for on-chain actions
- Display user's NFTs or tokens in their wallet
