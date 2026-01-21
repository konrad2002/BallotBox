import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET(_req: Request, { params }: { params: { label: string } }) {
  const label = params.label?.toUpperCase()
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

export async function PATCH(req: Request, { params }: { params: { label: string } }) {
  const label = params.label?.toUpperCase()
  if (!label) return NextResponse.json({ error: "Missing label" }, { status: 400 })

  const body = await req.json().catch(() => ({}))
  const isOpen: boolean | undefined = body?.isOpen

  if (typeof isOpen !== "boolean") {
    return NextResponse.json({ error: "isOpen boolean required" }, { status: 400 })
  }

  const updated = await prisma.vote.update({
    where: { label },
    data: { isOpen },
  }).catch(() => null)

  if (!updated) return NextResponse.json({ error: "Vote not found" }, { status: 404 })

  return NextResponse.json({ label: updated.label, isOpen: updated.isOpen })
}

export async function DELETE(_req: Request, { params }: { params: { label: string } }) {
  const label = params.label?.toUpperCase()
  if (!label) return NextResponse.json({ error: "Missing label" }, { status: 400 })

  const deleted = await prisma.vote.delete({ where: { label } }).catch(() => null)
  if (!deleted) return NextResponse.json({ error: "Vote not found" }, { status: 404 })

  return NextResponse.json({ ok: true })
}
