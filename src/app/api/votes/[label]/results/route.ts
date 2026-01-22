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
      options: { orderBy: { order: "asc" } },
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

  if (vote.isOpen) {
    return NextResponse.json({ error: "Results are available only after the vote is closed." }, { status: 403 })
  }

  if (!vote.result) {
    return NextResponse.json({ error: "Results not yet calculated" }, { status: 404 })
  }

  const totalVotes = vote.result.totalVotes
  const majorityThreshold = Math.ceil(totalVotes / 2)
  const voteResult = vote.result

  return NextResponse.json({
    voteLabel: vote.label,
    voteTitle: vote.title,
    createdAt: vote.createdAt,
    closedAt: vote.updatedAt,
    totalVotes,
    totalOptions: vote.options.length,
    majorityThreshold,
    allOptions: vote.options.map((o) => ({
      id: o.id,
      label: o.label,
      order: o.order,
    })),
    winner: voteResult.winner
      ? { id: voteResult.winner.id, label: voteResult.winner.label }
      : null,
    rounds: voteResult.rounds.map((round, idx) => {
      const sortedTallies = round.tallies
        .map((tally) => ({
          option: { id: tally.option.id, label: tally.option.label },
          votes: tally.votes,
          percentage: totalVotes > 0
            ? ((tally.votes / totalVotes) * 100).toFixed(1)
            : "0.0",
        }))
        .sort((a, b) => b.votes - a.votes)

      const previousRound = idx > 0 ? voteResult.rounds[idx - 1] : null
      const votesTransferred = previousRound && round.eliminated
        ? previousRound.tallies.find((t) => t.optionId === round.eliminated?.id)?.votes || 0
        : 0

      return {
        roundNumber: round.roundNumber,
        eliminated: round.eliminated
          ? { id: round.eliminated.id, label: round.eliminated.label }
          : null,
        votesTransferred,
        tallies: sortedTallies,
        leadingVotes: sortedTallies[0]?.votes || 0,
        hasWinner: sortedTallies[0]?.votes >= majorityThreshold,
      }
    }),
  })
}
