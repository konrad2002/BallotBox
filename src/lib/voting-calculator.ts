import {prisma} from "./prisma"

interface BallotRank {
  submissionId: string
  preferences: { optionId: string; rank: number }[]
}

interface RoundTally {
  optionId: string
  votes: number
}

interface RoundResult {
  tallyByOption: Map<string, number>
  eliminatedOption: string | null
  winner: string | null
}

/**
 * Calculates instant runoff voting (IRV) results for a ranked-choice vote.
 * Returns detailed round-by-round tally and the winner.
 */
export async function calculateIRVResults(voteId: string) {
  const vote = await prisma.vote.findUnique({
    where: { id: voteId },
    include: {
      options: { orderBy: { order: "asc" } },
      submissions: {
        include: {
          ranks: {
            include: { option: true },
            orderBy: { rank: "asc" },
          },
        },
      },
    },
  })

  if (!vote) throw new Error("Vote not found")

  // Build ballot preferences: for each submission, extract ordered preferences
  const ballots: BallotRank[] = vote.submissions.map((submission) => ({
    submissionId: submission.id,
    preferences: submission.ranks.map((rank) => ({
      optionId: rank.optionId,
      rank: rank.rank,
    })),
  }))

  const optionIds = new Set(vote.options.map((o) => o.id))
  const rounds: RoundResult[] = []
  let eliminated = new Set<string>()
  // Total submissions including abstentions for majority calculation
  // Ballots with preferences (excluding abstentions)
  const ballotsWithPreferences = ballots.filter((b) => b.preferences.length > 0)

  // IRV algorithm: repeat until a winner or all tied
  while (true) {
    const remaining = Array.from(optionIds).filter((id) => !eliminated.has(id))

    if (remaining.length === 0) break
    if (remaining.length === 1) {
      // Last remaining option wins
      const actualVotes = ballotsWithPreferences.filter((b) => 
        b.preferences.some((p) => remaining.includes(p.optionId))
      ).length
      rounds.push({
        tallyByOption: new Map([[remaining[0], actualVotes]]),
        eliminatedOption: null,
        winner: remaining[0],
      })
      break
    }

    // Count first preferences among remaining options
    const tally = new Map<string, number>()
    remaining.forEach((id) => tally.set(id, 0))

    for (const ballot of ballotsWithPreferences) {
      const firstPreference = ballot.preferences.find(
        (p) => remaining.includes(p.optionId)
      )
      if (firstPreference) {
        tally.set(firstPreference.optionId, (tally.get(firstPreference.optionId) || 0) + 1)
      }
    }

    const tallyArray = Array.from(tally.entries())
    const maxVotes = Math.max(...tallyArray.map((t) => t[1]))
    // Majority based on valid (non-abstention) ballots
    const majority = Math.ceil(ballotsWithPreferences.length / 2)

    // Check if we have a winner
    const winners = tallyArray.filter((t) => t[1] === maxVotes && t[1] >= majority)
    if (winners.length === 1) {
      rounds.push({
        tallyByOption: tally,
        eliminatedOption: null,
        winner: winners[0][0],
      })
      break
    }

    // If all remaining are tied, declare all as co-winners
    if (tallyArray.length === remaining.length && tallyArray.every((t) => t[1] === tallyArray[0][1])) {
      rounds.push({
        tallyByOption: tally,
        eliminatedOption: null,
        winner: remaining[0], // Designate first as primary winner
      })
      break
    }

    // Eliminate option with fewest votes (ties go to lowest index)
    const minVotes = Math.min(...tallyArray.map((t) => t[1]))
    const toEliminate = tallyArray
      .filter((t) => t[1] === minVotes)
      .sort((a, b) => remaining.indexOf(a[0]) - remaining.indexOf(b[0]))[0][0]

    eliminated.add(toEliminate)
    rounds.push({
      tallyByOption: tally,
      eliminatedOption: toEliminate,
      winner: null,
    })
  }

  return {
    totalVotes: ballots.length,
    rounds,
    winner: rounds[rounds.length - 1]?.winner || null,
  }
}

/**
 * Stores calculated voting results in the database
 */
export async function storeVotingResults(
  voteId: string,
  results: Awaited<ReturnType<typeof calculateIRVResults>>
) {
  const vote = await prisma.vote.findUnique({
    where: { id: voteId },
    include: { options: true },
  })

  if (!vote) throw new Error("Vote not found")

  // Create VoteResult record
  return prisma.voteResult.create({
    data: {
      voteId,
      totalVotes: results.totalVotes,
      winnerId: results.winner || undefined,
      rounds: {
        create: results.rounds.map((round, idx) => ({
          roundNumber: idx + 1,
          eliminatedId: round.eliminatedOption || undefined,
          tallies: {
            create: Array.from(
                new Map(
                    round.tallyByOption.entries()
                ).entries()
            ).map(([optionId, votes]) => ({
              optionId,
              votes,
            })),
          },
        })),
      },
    },
    include: {
      rounds: {
        include: {tallies: true},
      },
    },
  });
}
