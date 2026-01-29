"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

export default function GenericVotePage() {
  const [voteLabel, setVoteLabel] = useState("")
  const [recentLabels, setRecentLabels] = useState<string[]>([])
  const router = useRouter()

  useEffect(() => {
    if (typeof window === "undefined") return
    const raw = window.localStorage.getItem("ballotbox-recent-votes")
    if (!raw) return
    try {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        setRecentLabels(parsed.filter(Boolean).slice(0, 6))
      }
    } catch {
      setRecentLabels([])
    }
  }, [])

  const updateRecent = (label: string) => {
    if (typeof window === "undefined") return
    const normalized = label.trim().toUpperCase()
    if (!normalized) return
    const next = [normalized, ...recentLabels.filter((l) => l !== normalized)].slice(0, 6)
    setRecentLabels(next)
    window.localStorage.setItem("ballotbox-recent-votes", JSON.stringify(next))
  }

  const clearRecent = () => {
    if (typeof window === "undefined") return
    window.localStorage.removeItem("ballotbox-recent-votes")
    setRecentLabels([])
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (voteLabel.trim()) {
      const normalized = voteLabel.toUpperCase()
      updateRecent(normalized)
      router.push(`/vote/${normalized}`)
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

        {recentLabels.length > 0 && (
          <Card className="mt-4">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">Recent votes</CardTitle>
                <CardDescription>Jump back in with one tap</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={clearRecent}>
                Clear
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {recentLabels.map((label) => (
                  <Button
                    key={label}
                    variant="outline"
                    className="font-mono"
                    onClick={() => {
                      updateRecent(label)
                      router.push(`/vote/${label}`)
                    }}
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
