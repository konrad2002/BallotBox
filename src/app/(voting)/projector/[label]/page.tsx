"use client"

import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ExternalLink, Download } from "lucide-react"

interface VoteData {
  label: string
  title: string
  isOpen: boolean
}

export default function ProjectorQRPage() {
  const params = useParams<{ label?: string | string[] }>()
  const rawLabel = params?.label
  const label = (Array.isArray(rawLabel) ? rawLabel[0] : rawLabel)?.toUpperCase() || ""

  const [vote, setVote] = useState<VoteData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      if (!label) {
        setError("Missing label")
        setLoading(false)
        return
      }
      try {
        setLoading(true)
        setError(null)
        const res = await fetch(`/api/votes/${label}`, { cache: "no-store" })
        if (!res.ok) {
          const data = await res.json().catch(() => null)
          throw new Error(data?.error || "Failed to load vote")
        }
        const data = await res.json()
        setVote({ label: data.label, title: data.title, isOpen: data.isOpen })
      } catch (err) {
        setError((err as Error).message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [label])

  const voteUrl = vote ? `/vote/${vote.label}` : ""
  const qrUrl = vote ? `/api/votes/${vote.label}/qrcode` : ""

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link
          href="/manage"
          className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>

        {loading ? (
          <Card>
            <CardContent className="py-12 text-center text-neutral-600">
              Loading...
            </CardContent>
          </Card>
        ) : error ? (
          <Card>
            <CardHeader>
              <CardTitle>Error</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-600">{error}</p>
            </CardContent>
          </Card>
        ) : !vote ? (
          <Card>
            <CardContent className="py-12 text-center text-neutral-600">
              Vote not found
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-3xl truncate" title={vote.title}>{vote.title}</CardTitle>
                  <CardDescription className="mt-2 flex items-center gap-2 flex-wrap">
                    <Badge variant={vote.isOpen ? "default" : "secondary"} className="font-mono text-base px-3 py-1">
                      {vote.label}
                    </Badge>
                    <span className="text-neutral-600">Scan to join voting</span>
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Link href={voteUrl} target="_blank" rel="noreferrer">
                    <Button variant="outline" size="sm">
                      <ExternalLink className="w-4 h-4 mr-2" /> Open Vote
                    </Button>
                  </Link>
                  <a href={qrUrl} download={`vote-${vote.label}-qr.png`}>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" /> Download QR
                    </Button>
                  </a>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center py-6">
                {/* Large QR image */}
                <img
                  src={qrUrl}
                  alt={`QR code for vote ${vote.label}`}
                  width={512}
                  height={512}
                  className="w-full max-w-md h-auto border border-neutral-200 rounded-md bg-white"
                />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
