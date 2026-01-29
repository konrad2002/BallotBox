"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Trophy, Calendar, Users, CheckCircle2, Target } from "lucide-react"

interface Option {
  id: string
  label: string
  order: number
}

interface RoundTally {
  option: { id: string; label: string }
  votes: number
  percentage: string
}

interface ResultRound {
  roundNumber: number
  eliminated: { id: string; label: string } | null
  votesTransferred: number
  tallies: RoundTally[]
  leadingVotes: number
  hasWinner: boolean
}

interface ResultsData {
  voteLabel: string
  voteTitle: string
  createdAt: string
  closedAt: string
  totalVotes: number
  totalOptions: number
  majorityThreshold: number
  allOptions: Option[]
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
        const data = await res.json().catch(() => null)
        if (!res.ok) {
          throw new Error(data?.error || "Failed to fetch results")
        }
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
      <div className="min-h-screen bg-neutral-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Card>
            <CardContent className="py-12 text-center text-neutral-600">
              Loading results...
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Card>
            <CardHeader>
              <CardTitle>Error</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-600 mb-4">{error}</p>
              <p className="text-neutral-600 mb-4">If the vote is still open, results will appear after it is closed.</p>
              <Button onClick={() => router.push("/")}>Back to Home</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!results) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Card>
            <CardContent className="py-12 text-center text-neutral-600">
              No results found
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link
          href="/"
          className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>

        {/* Header */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <CardTitle className="text-2xl mb-2">{results.voteTitle}</CardTitle>
                <CardDescription className="flex items-center gap-3 flex-wrap">
                  <Badge variant="secondary" className="font-mono">{results.voteLabel}</Badge>
                  <span>Instant Runoff Voting Results</span>
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-neutral-500">
                  <Users className="w-4 h-4" />
                  <span>Total Votes</span>
                </div>
                <p className="text-2xl font-bold text-neutral-900">{results.totalVotes}</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-neutral-500">
                  <Target className="w-4 h-4" />
                  <span>Majority Needed</span>
                </div>
                <p className="text-2xl font-bold text-neutral-900">{results.majorityThreshold}</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-neutral-500">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Total Options</span>
                </div>
                <p className="text-2xl font-bold text-neutral-900">{results.totalOptions}</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-neutral-500">
                  <Calendar className="w-4 h-4" />
                  <span>Closed</span>
                </div>
                <p className="text-sm font-medium text-neutral-900">
                  {new Date(results.closedAt).toLocaleDateString()}
                </p>
                <p className="text-xs text-neutral-500">
                  {new Date(results.closedAt).toLocaleTimeString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Winner */}
        {results.winner && (
          <Card className="mb-6 border-green-600 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-900">
                <Trophy className="w-5 h-5" />
                Winner
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-semibold text-green-900">{results.winner.label}</p>
            </CardContent>
          </Card>
        )}

        {/* Rounds */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-neutral-900">Voting Rounds</h2>

          {results.rounds.map((round, idx) => (
            <Card key={idx}>
              <CardHeader>
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-lg">
                      Round {round.roundNumber}
                    </CardTitle>
                    {round.hasWinner && (
                      <Badge className="bg-green-600">
                        Winner Found
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {round.eliminated && (
                      <>
                        <Badge variant="destructive">
                          Eliminated: {round.eliminated.label}
                        </Badge>
                        {round.votesTransferred > 0 && (
                          <Badge variant="outline">
                            {round.votesTransferred} votes transferred
                          </Badge>
                        )}
                      </>
                    )}
                  </div>
                </div>
                {round.leadingVotes >= results.majorityThreshold && (
                  <CardDescription>
                    Leading option reached majority threshold ({round.leadingVotes} ≥ {results.majorityThreshold})
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {round.tallies.map((tally, tallyIdx) => {
                    const previousRound = idx > 0 ? results.rounds[idx - 1] : null
                    const previousVotes = previousRound
                      ? (previousRound.tallies.find((prev) => prev.option.id === tally.option.id)?.votes ?? 0)
                      : 0
                    const currentPct = Number.parseFloat(tally.percentage)
                    const previousPct = results.totalVotes > 0
                      ? (previousVotes / results.totalVotes) * 100
                      : 0
                    const deltaVotes = idx > 0 ? Math.max(tally.votes - previousVotes, 0) : tally.votes
                    const deltaPct = idx > 0
                      ? Math.max(currentPct - previousPct, 0)
                      : currentPct
                    const barColor = results.winner?.id === tally.option.id
                      ? "bg-green-600"
                      : round.eliminated?.id === tally.option.id
                      ? "bg-red-500"
                      : "bg-blue-500"
                    const previousTally = tallyIdx > 0 ? round.tallies[tallyIdx - 1] : null
                    const rankNumber = previousTally && previousTally.votes === tally.votes
                      ? null
                      : tallyIdx + 1

                    return (
                    <div key={tally.option.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-neutral-500 w-6">
                            {rankNumber ? `#${rankNumber}` : "="}
                          </span>
                          <span className="font-medium text-neutral-900">{tally.option.label}</span>
                          {results.winner?.id === tally.option.id && (
                            <Trophy className="w-4 h-4 text-green-600" />
                          )}
                        </div>
                        <span className="font-mono text-sm text-neutral-600">
                          {tally.votes} votes ({tally.percentage}%)
                          {idx > 0 && deltaVotes > 0 && (
                            <span className="ml-2 text-xs text-emerald-600">+{deltaVotes}</span>
                          )}
                        </span>
                      </div>
                      <div className="w-full h-3 bg-neutral-200 rounded-full overflow-hidden relative">
                        <div
                          className="absolute left-0 top-0 h-full bg-neutral-500"
                          style={{ width: `${currentPct}%` }}
                        />
                        {idx > 0 ? (
                          <div
                            className={`absolute top-0 h-full ${barColor}`}
                            style={{ left: `${previousPct}%`, width: `${deltaPct}%` }}
                          />
                        ) : (
                          <div
                            className={`absolute left-0 top-0 h-full ${barColor}`}
                            style={{ width: `${currentPct}%` }}
                          />
                        )}
                      </div>
                    </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Summary of All Options */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>All Options</CardTitle>
            <CardDescription>Complete list of options in this vote</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {results.allOptions.map((option) => {
                const isWinner = results.winner?.id === option.id
                const eliminatedRound = results.rounds.find((r) => r.eliminated?.id === option.id)
                
                return (
                  <div
                    key={option.id}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      isWinner
                        ? "border-green-600 bg-green-50"
                        : "border-neutral-200 bg-neutral-50"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      {isWinner && <Trophy className="w-4 h-4 text-green-600" />}
                      <span className={isWinner ? "font-semibold text-green-900" : "text-neutral-900"}>
                        {option.label}
                      </span>
                    </span>
                    {isWinner ? (
                      <Badge className="bg-green-600">Winner</Badge>
                    ) : eliminatedRound ? (
                      <Badge variant="outline">
                        Eliminated R{eliminatedRound.roundNumber}
                      </Badge>
                    ) : null}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Back Button */}
        <div className="mt-6">
          <Button onClick={() => router.push("/")} variant="outline">
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  )
}
