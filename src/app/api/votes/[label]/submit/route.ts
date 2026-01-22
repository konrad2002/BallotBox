import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

const VOTED_COOKIE = "ballotbox-voted"

const readVoted = async () => {
  const store = await cookies()
  const raw = store.get(VOTED_COOKIE)?.value
  if (!raw) return [] as string[]
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.map((v) => v?.toString()).filter(Boolean).slice(0, 200) : []
  } catch {
    return []
  }
}

export const dynamic = "force-dynamic"

export async function POST(req: Request, { params }: { params: Promise<{ label: string }> }) {
  const { label: rawLabel } = await params
  const label = rawLabel?.toUpperCase()
  if (!label) return NextResponse.json({ error: "Missing label" }, { status: 400 })

  const body = await req.json().catch(() => ({}))
  const abstain = body?.abstain === true
  const orderedOptionIds: string[] = Array.isArray(body?.orderedOptionIds) ? body.orderedOptionIds : []
  const fingerprint: string | undefined = body?.fingerprint

  if (!abstain && orderedOptionIds.length === 0) {
    return NextResponse.json({ error: "orderedOptionIds (array) is required" }, { status: 400 })
  }

  const vote = await prisma.vote.findUnique({
    where: { label },
    include: { options: true },
  })

  if (!vote) return NextResponse.json({ error: "Vote not found" }, { status: 404 })
  if (!vote.isOpen) return NextResponse.json({ error: "Vote is closed" }, { status: 403 })

  const optionIds = vote.options.map((o: any) => o.id)

  if (!abstain) {
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
  }

  // Build rank records
  const ranks = abstain
    ? []
    : orderedOptionIds.map((id, index) => ({ optionId: id, rank: index + 1 }))

  const created = await prisma.submission.create({
    data: {
      voteId: vote.id,
      fingerprint,
      ranks: { create: ranks },
    },
    include: { ranks: true },
  })

  const voted = Array.from(new Set([...(await readVoted()), vote.label]))

  const response = NextResponse.json({
    submissionId: created.id,
    voteLabel: vote.label,
    rankCount: created.ranks.length,
    abstain,
  })

  response.cookies.set(VOTED_COOKIE, JSON.stringify(voted), {
    // readable on client to show "already voted" note
    httpOnly: false,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    secure: process.env.NODE_ENV === "production",
  })

  return response
}
