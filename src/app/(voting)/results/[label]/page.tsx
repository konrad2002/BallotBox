"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface RoundTally {
  option: { id: string; label: string }
  votes: number
  percentage: string
}

interface ResultRound {
  roundNumber: number
  eliminated: { id: string; label: string } | null
  tallies: RoundTally[]
}

interface ResultsData {
  voteLabel: string
  voteTitle: string
  totalVotes: number
  winner: { id: string; label: string } | null
  rounds: ResultRound[]
}

export default function ResultsPage() {
  const params = useParams()
  const router = useRouter()
  const label = params?.label as string
  const [results, setResults] = useState<ResultsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!label) return

    const fetchResults = async () => {
      try {
        const res = await fetch(`/api/votes/${label}/results`)
        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error || "Failed to fetch results")
        }
        const data = await res.json()
        setResults(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error")
      } finally {
        setLoading(false)
      }
    }

    fetchResults()
  }, [label])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-muted-foreground">Loading results...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => router.push("/")}>Back to Home</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!results) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-muted-foreground">No results found</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="secondary">{results.voteLabel}</Badge>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">{results.voteTitle}</h1>
          <p className="text-slate-400">
            Instant Runoff Voting Results · {results.totalVotes} total votes
          </p>
        </div>

        {/* Winner */}
        {results.winner && (
          <Card className="mb-8 border-green-500/20 bg-green-950/20">
            <CardHeader>
              <CardTitle className="text-green-400">🏆 Winner</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-300">{results.winner.label}</p>
            </CardContent>
          </Card>
        )}

        {/* Rounds */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white">Voting Rounds</h2>

          {results.rounds.map((round, idx) => (
            <Card key={idx} className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    Round {round.roundNumber}
                  </CardTitle>
                  {round.eliminated && (
                    <Badge variant="destructive">
                      Eliminated: {round.eliminated.label}
                    </Badge>
                  )}
                  {!round.eliminated && (
                    <Badge variant="default" className="bg-green-600">
                      Winner Found
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {round.tallies.map((tally) => (
                    <div key={tally.option.id} className="flex items-center gap-4">
                      <div className="flex-1">
                        <p className="font-medium text-white">{tally.option.label}</p>
                      </div>
                      <div className="w-48">
                        <div className="w-full h-6 bg-slate-700 rounded overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all"
                            style={{
                              width: `${parseFloat(tally.percentage)}%`,
                            }}
                          />
                        </div>
                      </div>
                      <div className="text-right w-24">
                        <p className="font-mono text-white">
                          {tally.votes} ({tally.percentage}%)
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Back Button */}
        <div className="mt-8">
          <Button onClick={() => router.push("/")} variant="outline">
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  )
}
