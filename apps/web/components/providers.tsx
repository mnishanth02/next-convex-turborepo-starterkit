"use client"

import { Toaster } from "@workspace/ui/components/sonner";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ThemeProvider as NextThemesProvider } from "next-themes"

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL!;

const convex = new ConvexReactClient(convexUrl);

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ConvexProvider client={ convex }>
      <NextThemesProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
        enableColorScheme
      >
        { children }
        <Toaster
          position="bottom-left"
          richColors
          toastOptions={ { style: { textAlign: "center" } } }
        />
      </NextThemesProvider>
    </ConvexProvider>
  )
}
