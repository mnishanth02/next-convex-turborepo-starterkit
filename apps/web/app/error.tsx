"use client"

import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { AlertTriangle } from "lucide-react"
import { useEffect } from "react"

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to console in development
    console.error("Task page error:", error)

    // TODO: In production, integrate error tracking service
    // Recommended services:
    // - Sentry: https://sentry.io
    // - LogRocket: https://logrocket.com
    // - Datadog: https://www.datadoghq.com
    //
    // Example with Sentry:
    // import * as Sentry from "@sentry/nextjs"
    // Sentry.captureException(error, {
    //   tags: {
    //     page: "tasks",
    //     digest: error.digest,
    //   },
    // })
  }, [error])

  const handleGoHome = () => {
    window.location.href = "/"
  }

  return (
    <div className="container mx-auto p-6 lg:p-8">
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle>Something went wrong!</CardTitle>
            <CardDescription>
              An error occurred while loading your tasks. Please try again.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Button onClick={reset} className="w-full">
              Try again
            </Button>
            <Button variant="outline" onClick={handleGoHome} className="w-full">
              Go to home
            </Button>
            {error.message && (
              <p className="mt-4 text-sm text-muted-foreground text-center">
                Error: {error.message}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
