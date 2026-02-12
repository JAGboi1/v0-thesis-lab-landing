import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Thesis Lab - AI Evaluation Mining Platform",
  description: "Mine valuable data by evaluating AI responses on the Ritual chain",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-dark-32x32.png",
        sizes: "32x32",
        type: "image/png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon-light-32x32.png",
        sizes: "32x32",
        type: "image/png",
        media: "(prefers-color-scheme: light)",
      },
    ],
    apple: "/apple-icon.png",
  },
  themeColor: "#000000",
  manifest: "/site.webmanifest",
}
