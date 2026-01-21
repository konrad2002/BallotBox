import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function POST(req: Request, { params }: { params: Promise<{ label: string }> }) {
  const { label: rawLabel } = await params
  const label = rawLabel?.toUpperCase()
  if (!label) return NextResponse.json({ error: "Missing label" }, { status: 400 })

  const body = await req.json().catch(() => ({}))
  const orderedOptionIds: string[] | undefined = body?.orderedOptionIds
  const fingerprint: string | undefined = body?.fingerprint

  if (!orderedOptionIds || !Array.isArray(orderedOptionIds) || orderedOptionIds.length === 0) {
    return NextResponse.json({ error: "orderedOptionIds (array) is required" }, { status: 400 })
  }

  const vote = await prisma.vote.findUnique({
    where: { label },
    include: { options: true },
  })

  if (!vote) return NextResponse.json({ error: "Vote not found" }, { status: 404 })
  if (!vote.isOpen) return NextResponse.json({ error: "Vote is closed" }, { status: 403 })

  const optionIds = vote.options.map((o: any) => o.id)

  // Ensure submitted ids belong to this vote and are unique
  const submittedSet = new Set<string>()
  for (const id of orderedOptionIds) {
    if (!optionIds.includes(id)) {
      return NextResponse.json({ error: "Invalid option id in submission" }, { status: 400 })
    }
    if (submittedSet.has(id)) {
      return NextResponse.json({ error: "Duplicate option id in submission" }, { status: 400 })
    }
    submittedSet.add(id)
  }

  // Build rank records
  const ranks = orderedOptionIds.map((id, index) => ({ optionId: id, rank: index + 1 }))

  const created = await prisma.submission.create({
    data: {
      voteId: vote.id,
      fingerprint,
      ranks: { create: ranks },
    },
    include: { ranks: true },
  })

  return NextResponse.json({
    submissionId: created.id,
    voteLabel: vote.label,
    rankCount: created.ranks.length,
  })
}
