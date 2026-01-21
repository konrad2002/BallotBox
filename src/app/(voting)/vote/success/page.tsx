"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Check } from "lucide-react"

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardContent className="py-12 text-center">
          <div className="mb-6 flex justify-center">
            <div className="rounded-full bg-green-100 p-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">
            Vote Submitted!
          </h1>
          <p className="text-neutral-600 mb-8">
            Your ranked vote has been successfully recorded.
          </p>
          <div className="space-y-2">
            <Link href="/vote" className="block">
              <Button variant="outline" className="w-full">
                Vote Again
              </Button>
            </Link>
            <Link href="/" className="block">
              <Button className="w-full">
                Back to Home
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
