import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET(_req: Request, { params }: { params: Promise<{ label: string }> }) {
  const { label: rawLabel } = await params
  const label = rawLabel?.toUpperCase()
  if (!label) return NextResponse.json({ error: "Missing label" }, { status: 400 })

  const vote = await prisma.vote.findUnique({
    where: { label },
    include: {
      result: {
        include: {
          winner: true,
          rounds: {
            include: {
              tallies: {
                include: { option: true },
              },
              eliminated: true,
            },
            orderBy: { roundNumber: "asc" },
          },
        },
      },
    },
  })

  if (!vote) return NextResponse.json({ error: "Vote not found" }, { status: 404 })

  if (!vote.result) {
    return NextResponse.json({ error: "Results not yet calculated" }, { status: 404 })
  }

  return NextResponse.json({
    voteLabel: vote.label,
    voteTitle: vote.title,
    totalVotes: vote.result.totalVotes,
    winner: vote.result.winner
      ? { id: vote.result.winner.id, label: vote.result.winner.label }
      : null,
    rounds: vote.result.rounds.map((round) => ({
      roundNumber: round.roundNumber,
      eliminated: round.eliminated
        ? { id: round.eliminated.id, label: round.eliminated.label }
        : null,
      tallies: round.tallies.map((tally) => ({
        option: { id: tally.option.id, label: tally.option.label },
        votes: tally.votes,
        percentage: vote.result && vote.result.totalVotes > 0
          ? ((tally.votes / vote.result.totalVotes) * 100).toFixed(1)
          : "0.0",
      })),
    })),
  })
}
