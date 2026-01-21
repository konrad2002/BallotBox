"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

export default function GenericVotePage() {
  const [voteLabel, setVoteLabel] = useState("")
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (voteLabel.trim()) {
      router.push(`/vote/${voteLabel.toUpperCase()}`)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
      <div className="w-full max-w-md px-4">
        <Link
          href="/"
          className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>

        <Card>
          <CardHeader>
            <CardTitle>Enter Vote Label</CardTitle>
            <CardDescription>
              Enter the vote label provided by the organizer
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Vote Label
                </label>
                <Input
                  placeholder="e.g., ABC123"
                  value={voteLabel}
                  onChange={(e) => setVoteLabel(e.target.value.toUpperCase())}
                  className="text-center text-2xl font-mono tracking-widest"
                  maxLength={6}
                  autoFocus
                />
                <p className="text-xs text-neutral-500 mt-2">
                  6 characters, letters and numbers
                </p>
              </div>

              <Button
                type="submit"
                disabled={voteLabel.length !== 6}
                className="w-full"
                size="lg"
              >
                Continue
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
