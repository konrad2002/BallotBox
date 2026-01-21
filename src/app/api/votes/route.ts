import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { generateVoteLabel } from "@/lib/utils"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const votes = await prisma.vote.findMany({
      orderBy: { createdAt: "desc" },
      include: { options: { orderBy: { order: "asc" } } },
      take: 100,
    })

    return NextResponse.json(
      votes.map((vote) => ({
        label: vote.label,
        title: vote.title,
        isOpen: vote.isOpen,
        createdAt: vote.createdAt,
        options: vote.options.map((o) => ({ id: o.id, label: o.label, order: o.order })),
      }))
    )
  } catch (error) {
    console.error("GET /api/votes error", error)
    return NextResponse.json({ error: "Unexpected error fetching votes." }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const title: string | undefined = body?.title
    const options: string[] | undefined = body?.options

    if (!title || !options || !Array.isArray(options) || options.length < 2) {
      return NextResponse.json({ error: "Title and at least two options are required." }, { status: 400 })
    }

    const trimmedOptions = options.map((o) => o?.toString().trim()).filter(Boolean)
    if (trimmedOptions.length < 2) {
      return NextResponse.json({ error: "Provide at least two non-empty options." }, { status: 400 })
    }

    // generate unique label with a few attempts
    let label = ""
    for (let i = 0; i < 5; i++) {
      const candidate = generateVoteLabel()
      const exists = await prisma.vote.findUnique({ where: { label: candidate } })
      if (!exists) {
        label = candidate
        break
      }
    }
    if (!label) {
      return NextResponse.json({ error: "Unable to generate unique vote label. Try again." }, { status: 500 })
    }

    const created = await prisma.vote.create({
      data: {
        label,
        title: title.trim(),
        options: {
          create: trimmedOptions.map((label, index) => ({ label, order: index })),
        },
      },
      include: { options: true },
    })

    return NextResponse.json({
      label: created.label,
      title: created.title,
      isOpen: created.isOpen,
      options: created.options.map((o: any) => ({ id: o.id, label: o.label, order: o.order })),
    })
  } catch (error) {
    console.error("POST /api/votes error", error)
    return NextResponse.json({ error: "Unexpected error creating vote." }, { status: 500 })
  }
}
