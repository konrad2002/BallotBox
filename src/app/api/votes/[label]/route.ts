import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { calculateIRVResults, storeVotingResults } from "@/lib/voting-calculator"

const OWNER_COOKIE_NAME = "ballotbox-owned-votes"
const ADMIN_TOKEN_ENV = process.env.BALLOTBOX_ADMIN_TOKEN

const getOwnedLabels = async () => {
  const store = await cookies()
  const raw = store.get(OWNER_COOKIE_NAME)?.value
  if (!raw) return [] as string[]
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed)
      ? parsed.map((v) => v?.toString().trim()).filter(Boolean).slice(0, 200)
      : []
  } catch {
    return []
  }
}

const isAdminRequest = (req: Request) => {
  if (!ADMIN_TOKEN_ENV) return false
  const adminToken = req.headers.get("x-admin-token")
  return Boolean(adminToken && adminToken === ADMIN_TOKEN_ENV)
}

export const dynamic = "force-dynamic"

export async function GET(_req: Request, { params }: { params: Promise<{ label: string }> }) {
  const { label: rawLabel } = await params
  const label = rawLabel?.toUpperCase()
  if (!label) {
    return NextResponse.json({ error: "Missing label" }, { status: 400 })
  }

  const vote = await prisma.vote.findUnique({
    where: { label },
    include: {
      options: { orderBy: { order: "asc" } },
    },
  })

  if (!vote) {
    return NextResponse.json({ error: "Vote not found" }, { status: 404 })
  }

  return NextResponse.json({
    label: vote.label,
    title: vote.title,
    isOpen: vote.isOpen,
    options: vote.options.map((o: any) => ({ id: o.id, label: o.label, order: o.order })),
  })
}

export async function PATCH(req: Request, { params }: { params: Promise<{ label: string }> }) {
  const { label: rawLabel } = await params
  const label = rawLabel?.toUpperCase()
  if (!label) return NextResponse.json({ error: "Missing label" }, { status: 400 })

  if (!isAdminRequest(req)) {
    const owned = await getOwnedLabels()
    if (!owned.includes(label)) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 })
    }
  }

  const body = await req.json().catch(() => ({}))
  const isOpen: boolean | undefined = body?.isOpen

  if (typeof isOpen !== "boolean") {
    return NextResponse.json({ error: "isOpen boolean required" }, { status: 400 })
  }

  const vote = await prisma.vote.findUnique({
    where: { label },
    include: { result: true },
  })

  if (!vote) return NextResponse.json({ error: "Vote not found" }, { status: 404 })

  // If closing the vote, (re)calculate results
  if (!isOpen && vote.isOpen === true) {
    try {
            // Delete existing results if any
            if (vote.result) {
              await prisma.voteResult.delete({ where: { voteId: vote.id } })
            }
      
            // Calculate and store new results
      const results = await calculateIRVResults(vote.id)
      await storeVotingResults(vote.id, results)
    } catch (error) {
      console.error("Error calculating results:", error)
      return NextResponse.json(
        { error: "Failed to calculate results" },
        { status: 500 }
      )
    }
  }

  const updated = await prisma.vote.update({
    where: { label },
    data: { isOpen },
  })

  return NextResponse.json({ label: updated.label, isOpen: updated.isOpen })
}

export async function DELETE(req: Request, { params }: { params: Promise<{ label: string }> }) {
  const { label: rawLabel } = await params
  const label = rawLabel?.toUpperCase()
  if (!label) return NextResponse.json({ error: "Missing label" }, { status: 400 })

  if (!isAdminRequest(req)) {
    const owned = await getOwnedLabels()
    if (!owned.includes(label)) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 })
    }
  }

  const deleted = await prisma.vote.delete({ where: { label } }).catch(() => null)
  if (!deleted) return NextResponse.json({ error: "Vote not found" }, { status: 404 })

  return NextResponse.json({ ok: true })
}
