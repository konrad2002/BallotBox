"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Plus, Trash2, Lock, Unlock } from "lucide-react"
import * as htmlToImage from "html-to-image"
import jsPDF from "jspdf"

interface Option {
  id: string
  label: string
  order?: number
}

interface Vote {
  label: string
  title: string
  options: Option[]
  isOpen: boolean
  createdAt: string
}

export default function ManagePage() {
  const [votes, setVotes] = useState<Vote[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [showNewVoteForm, setShowNewVoteForm] = useState(false)
  const [newVoteTitle, setNewVoteTitle] = useState("")
  const [newOptions, setNewOptions] = useState<Option[]>([])
  const [newOptionInput, setNewOptionInput] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const loadVotes = useMemo(() => async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch("/api/votes", { cache: "no-store" })
      if (!res.ok) throw new Error("Failed to load votes")
      const data = await res.json()
      setVotes(data.votes ?? [])
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadVotes()
  }, [loadVotes])

  const startNewVote = () => {
    setShowNewVoteForm(true)
    setNewVoteTitle("")
    setNewOptions([])
    setNewOptionInput("")
  }

  const addOption = () => {
    if (newOptionInput.trim()) {
      setNewOptions([
        ...newOptions,
        { id: Math.random().toString(), label: newOptionInput }
      ])
      setNewOptionInput("")
    }
  }

  const removeOption = (id: string) => {
    setNewOptions(newOptions.filter(opt => opt.id !== id))
  }

  const createVote = async () => {
    if (!newVoteTitle.trim() || newOptions.length === 0) return
    setSubmitting(true)
    try {
      const res = await fetch("/api/votes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newVoteTitle.trim(),
          options: newOptions.map((o) => o.label.trim()),
        }),
      })
      if (!res.ok) throw new Error("Failed to create vote")
      const created = await res.json()
      setVotes((prev) => [created, ...prev])
      setShowNewVoteForm(false)
      setNewVoteTitle("")
      setNewOptions([])
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  const toggleVoteStatus = async (label: string) => {
    const current = votes.find((v) => v.label === label)
    if (!current) return
    const nextOpen = !current.isOpen
    setVotes((prev) => prev.map((v) => (v.label === label ? { ...v, isOpen: nextOpen } : v)))
    const res = await fetch(`/api/votes/${label}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isOpen: nextOpen }),
    })
    if (!res.ok) {
      // revert if failed
      setVotes((prev) => prev.map((v) => (v.label === label ? { ...v, isOpen: current.isOpen } : v)))
      setError("Failed to update vote status")
    }
  }

  const deleteVote = async (label: string) => {
    const prev = votes
    setVotes((p) => p.filter((v) => v.label !== label))
    const res = await fetch(`/api/votes/${label}`, { method: "DELETE" })
    if (!res.ok) {
      setVotes(prev)
      setError("Failed to delete vote")
    }
  }

  const fetchResults = async (label: string) => {
    const res = await fetch(`/api/votes/${label}/results`, { cache: "no-store" })
    if (!res.ok) {
      const data = await res.json().catch(() => null)
      throw new Error(data?.error || "Failed to load results")
    }
    return res.json()
  }

  const buildShareCard = (
    data: any,
    options?: { doc?: Document; mode?: "capture" | "preview"; attach?: boolean }
  ) => {
    const doc = options?.doc || document
    const mode = options?.mode || "capture"
    const container = doc.createElement("div")
    container.style.width = "1200px"
    container.style.height = "1200px"
    container.style.display = "flex"
    container.style.flexDirection = "column"
    container.style.padding = "60px"
    container.style.boxSizing = "border-box"
    container.style.borderRadius = "0"
    container.style.background = "#ffffff"
    container.style.backgroundColor = "#ffffff"
    container.style.color = "#0f172a"
    container.style.fontFamily = "'Inter', system-ui, -apple-system, sans-serif"
    if (mode === "capture") {
      container.style.position = "fixed"
      container.style.top = "0"
      container.style.left = "0"
      container.style.transform = "translate(-2000px, -2000px)"
      container.style.opacity = "1"
      container.style.visibility = "visible"
      container.style.pointerEvents = "none"
      container.style.zIndex = "-1"
    } else {
      container.style.position = "relative"
      container.style.top = "0"
      container.style.left = "0"
      container.style.transform = "none"
      container.style.opacity = "1"
      container.style.visibility = "visible"
      container.style.pointerEvents = "auto"
      container.style.zIndex = "1"
      container.style.margin = "24px auto"
    }

    const header = doc.createElement("div")
    header.style.display = "flex"
    header.style.justifyContent = "space-between"
    header.style.alignItems = "flex-start"
    header.style.gap = "16px"

    const titleBox = doc.createElement("div")
    const title = doc.createElement("div")
    title.textContent = data.voteTitle
    title.style.fontSize = "68px"
    title.style.fontWeight = "900"
    title.style.color = "#0f172a"
    title.style.marginTop = "0"
    title.style.lineHeight = "1.1"

    const stats = doc.createElement("div")
    stats.style.display = "flex"
    stats.style.gap = "12px"
    stats.style.flexWrap = "wrap"
    stats.style.marginTop = "16px"

    const stat = (label: string, value: string) => {
      const chip = doc.createElement("div")
      chip.style.display = "inline-flex"
      chip.style.alignItems = "center"
      chip.style.gap = "8px"
      chip.style.padding = "10px 16px"
      chip.style.borderRadius = "999px"
      chip.style.background = "#f1f5f9"
      chip.style.border = "2px solid #e2e8f0"

      const v = doc.createElement("span")
      v.style.fontWeight = "800"
      v.style.fontSize = "24px"
      v.style.color = "#0f172a"
      v.textContent = value

      const l = doc.createElement("span")
      l.style.fontSize = "22px"
      l.style.color = "#64748b"
      l.textContent = label

      chip.appendChild(v)
      chip.appendChild(l)
      return chip
    }

    stats.appendChild(stat("Total votes", String(data.totalVotes)))
    if (data.winnerLabel) stats.appendChild(stat("Winner", data.winnerLabel))

    titleBox.appendChild(title)
    titleBox.appendChild(stats)

    header.appendChild(titleBox)

    const listWrapper = doc.createElement("div")
    listWrapper.style.marginTop = "48px"
    listWrapper.style.display = "grid"
    listWrapper.style.gap = "16px"

    const heading = doc.createElement("div")
    heading.textContent = "Top 5"
    heading.style.fontSize = "38px"
    heading.style.fontWeight = "800"
    heading.style.color = "#0f172a"
    heading.style.marginBottom = "12px"
    listWrapper.appendChild(heading)

    const items = data.topFive && data.topFive.length > 0
      ? data.topFive
      : [{ label: "No votes yet", votes: 0 }]
    const maxVotes = Math.max(...items.map((t: any) => t.votes || 0), 1)

    items.forEach((item: any, idx: number) => {
      const row = doc.createElement("div")
      row.style.display = "flex"
      row.style.flexDirection = "column"
      row.style.padding = "20px 24px"
      row.style.borderRadius = "12px"
      row.style.background = "#f8fafc"
      row.style.border = "3px solid #e2e8f0"

      const top = doc.createElement("div")
      top.style.display = "flex"
      top.style.justifyContent = "space-between"
      top.style.alignItems = "center"
      top.style.gap = "12px"

      const left = doc.createElement("div")
      left.style.display = "flex"
      left.style.alignItems = "center"
      left.style.gap = "12px"

      const rank = doc.createElement("div")
      rank.textContent = `#${idx + 1}`
      rank.style.width = "68px"
      rank.style.height = "68px"
      rank.style.borderRadius = "12px"
      rank.style.display = "flex"
      rank.style.alignItems = "center"
      rank.style.justifyContent = "center"
      rank.style.fontWeight = "900"
      rank.style.fontSize = "32px"
      rank.style.background = idx === 0 ? "#22c55e" : "#e2e8f0"
      rank.style.color = idx === 0 ? "#ffffff" : "#0f172a"

      const label = doc.createElement("div")
      label.textContent = item.label
      label.style.fontSize = "28px"
      label.style.fontWeight = "800"
      label.style.color = "#0f172a"

      left.appendChild(rank)
      left.appendChild(label)

      const votes = doc.createElement("div")
      votes.textContent = `${item.votes} votes`
      votes.style.fontSize = "26px"
      votes.style.fontWeight = "700"
      votes.style.color = "#64748b"

      top.appendChild(left)
      top.appendChild(votes)

      row.appendChild(top)

      if (item.votes > 0) {
        const barOuter = doc.createElement("div")
        barOuter.style.marginTop = "12px"
        barOuter.style.height = "16px"
        barOuter.style.borderRadius = "999px"
        barOuter.style.background = "#e2e8f0"

        const barInner = doc.createElement("div")
        barInner.style.height = "100%"
        barInner.style.borderRadius = "999px"
        barInner.style.width = `${Math.max(4, Math.round((item.votes / maxVotes) * 100))}%`
        barInner.style.background = idx === 0 ? "#22c55e" : "#6366f1"
        barInner.style.boxShadow = idx === 0 ? "0 4px 12px rgba(34,197,94,0.3)" : "0 4px 12px rgba(99,102,241,0.3)"

        barOuter.appendChild(barInner)
        row.appendChild(barOuter)
      }
      listWrapper.appendChild(row)
    })

    const footer = doc.createElement("div")
    footer.style.marginTop = "auto"
    footer.style.paddingTop = "32px"
    footer.style.display = "flex"
    footer.style.flexDirection = "column"
    footer.style.alignItems = "center"
    footer.style.gap = "4px"

    const toolName = doc.createElement("div")
    toolName.textContent = "BallotBox"
    toolName.style.fontSize = "24px"
    toolName.style.fontWeight = "800"
    toolName.style.color = "#0f172a"

    const domain = doc.createElement("div")
    domain.textContent = typeof window !== 'undefined' ? window.location.hostname : 'ballotbox.app'
    domain.style.fontSize = "20px"
    domain.style.fontWeight = "600"
    domain.style.color = "#64748b"

    footer.appendChild(toolName)
    footer.appendChild(domain)

    container.appendChild(header)
    container.appendChild(listWrapper)
    container.appendChild(footer)
    if (options?.attach !== false) {
      doc.body.appendChild(container)
    }
    return container
  }

  const getShareDataUrl = async (label: string) => {
    const data = await fetchResults(label)
    const finalRound = data.rounds?.[data.rounds.length - 1]
    const tallies = finalRound?.tallies || []
    const sorted = [...tallies].sort((a: any, b: any) => Number(b.votes) - Number(a.votes))
    const topFive = sorted.slice(0, 5).map((t: any) => ({
      label: t.option.label,
      votes: t.votes,
    }))
    const node = buildShareCard({
      voteLabel: data.voteLabel,
      voteTitle: data.voteTitle,
      winnerLabel: data.winner?.label,
      totalVotes: data.totalVotes,
      topFive,
    }, { mode: "capture" })
    // Wait a couple frames and a short timeout to ensure layout and fonts apply before capture
    await new Promise((resolve) => requestAnimationFrame(() => resolve(null)))
    await new Promise((resolve) => requestAnimationFrame(() => resolve(null)))
    await new Promise((resolve) => setTimeout(resolve, 50))
    try {
      const dataUrl = await htmlToImage.toPng(node, {
        cacheBust: true,
        skipFonts: true,
        width: 1200,
        height: 1200,
        backgroundColor: "#0f172a",
        pixelRatio: 2,
      })
      return dataUrl
    } finally {
      node.remove()
    }
  }

  const downloadPng = async (label: string) => {
    try {
      const data = await fetchResults(label)
      const finalRound = data.rounds?.[data.rounds.length - 1]
      const tallies = finalRound?.tallies || []
      const sorted = [...tallies].sort((a: any, b: any) => Number(b.votes) - Number(a.votes))
      const topFive = sorted.slice(0, 5).map((t: any) => ({
        label: t.option.label,
        votes: t.votes,
      }))

      const win = window.open("", "_blank")
      if (!win) return
      const doc = win.document
      doc.open()
      doc.write("<!DOCTYPE html><html><head><title>Results Preview</title></head><body></body></html>")
      doc.close()

      doc.body.style.margin = "0"
      doc.body.style.background = "#f8fafc"
      doc.body.style.fontFamily = "'Inter', system-ui, -apple-system, sans-serif"
      doc.body.style.display = "flex"
      doc.body.style.flexDirection = "column"
      doc.body.style.alignItems = "center"
      doc.body.style.padding = "48px 32px"

      const heading = doc.createElement("h1")
      heading.textContent = "Share Card Preview"
      heading.style.color = "#0f172a"
      heading.style.fontSize = "32px"
      heading.style.fontWeight = "800"
      heading.style.margin = "0 0 8px 0"
      doc.body.appendChild(heading)

      const sub = doc.createElement("p")
      sub.textContent = "Review the card below, then click Download PNG"
      sub.style.color = "#64748b"
      sub.style.fontSize = "16px"
      sub.style.margin = "0 0 32px 0"
      doc.body.appendChild(sub)

      const card = buildShareCard({
        voteLabel: data.voteLabel,
        voteTitle: data.voteTitle,
        winnerLabel: data.winner?.label,
        totalVotes: data.totalVotes,
        topFive,
      }, { doc, mode: "preview" })
      doc.body.appendChild(card)

      const button = doc.createElement("button")
      button.textContent = "Download PNG"
      button.style.marginTop = "32px"
      button.style.padding = "16px 32px"
      button.style.border = "none"
      button.style.borderRadius = "12px"
      button.style.fontSize = "18px"
      button.style.fontWeight = "800"
      button.style.cursor = "pointer"
      button.style.background = "#6366f1"
      button.style.color = "#ffffff"
      button.style.boxShadow = "0 4px 12px rgba(99,102,241,0.3)"
      button.style.transition = "all 0.2s"
      button.onmouseover = () => { button.style.background = "#4f46e5" }
      button.onmouseout = () => { button.style.background = "#6366f1" }
      button.onclick = async () => {
        try {
          button.textContent = "Preparing..."
          // Temporarily remove margin for capture
          const originalMargin = card.style.margin
          card.style.margin = "0"
          
          const dataUrl = await htmlToImage.toPng(card, {
            cacheBust: true,
            skipFonts: true,
            width: 1200,
            height: 1200,
            canvasWidth: 1200,
            canvasHeight: 1200,
            backgroundColor: "#ffffff",
          })
          
          // Restore margin
          card.style.margin = originalMargin
          
          const link = doc.createElement("a")
          link.download = `vote-${label}-results.png`
          link.href = dataUrl
          link.click()
          button.textContent = "Download PNG"
        } catch (error) {
          button.textContent = "Download PNG"
          console.error(error)
          alert("Failed to export PNG")
        }
      }
      doc.body.appendChild(button)
    } catch (err) {
      setError((err as Error).message || "Failed to export PNG")
      console.error(err)
    }
  }

  const downloadPdf = async (label: string) => {
    try {
      const dataUrl = await getShareDataUrl(label)
      const size = 1200
      const pdf = new jsPDF({ orientation: "p", unit: "px", format: [size, size] })
      pdf.addImage(dataUrl, "PNG", 0, 0, size, size)
      pdf.save(`vote-${label}-results.pdf`)
    } catch (err) {
      setError((err as Error).message || "Failed to export PDF")
      console.error(err)
    }
  }

  if (showNewVoteForm) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <button
            onClick={() => setShowNewVoteForm(false)}
            className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <Card>
            <CardHeader>
              <CardTitle>Create New Vote</CardTitle>
              <CardDescription>
                Set up a new ranked voting session
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Vote Title
                </label>
                <Input
                  placeholder="e.g., Best Programming Language"
                  value={newVoteTitle}
                  onChange={(e) => setNewVoteTitle(e.target.value)}
                  className="text-base"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-sm font-medium text-neutral-700">
                    Options
                  </label>
                  <span className="text-xs text-neutral-500">
                    {newOptions.length} option{newOptions.length !== 1 ? 's' : ''}
                  </span>
                </div>
                
                <div className="space-y-2 mb-4">
                  {newOptions.map(option => (
                    <div
                      key={option.id}
                      className="flex items-center justify-between bg-neutral-100 p-3 rounded-md"
                    >
                      <span className="text-neutral-900">{option.label}</span>
                      <button
                        onClick={() => removeOption(option.id)}
                        className="text-neutral-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Input
                    placeholder="Add an option..."
                    value={newOptionInput}
                    onChange={(e) => setNewOptionInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        addOption()
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={addOption}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={createVote}
                  disabled={submitting || !newVoteTitle.trim() || newOptions.length === 0}
                  className="flex-1"
                >
                  {submitting ? "Creating..." : "Create Vote"}
                </Button>
                <Button
                  onClick={() => setShowNewVoteForm(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <Link
              href="/"
              className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Home
            </Link>
            <h1 className="text-3xl font-bold text-neutral-900">
              Manage Votes
            </h1>
          </div>
          <Button onClick={startNewVote}>
            <Plus className="w-4 h-4 mr-2" />
            New Vote
          </Button>
        </div>
        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
            {error}
          </div>
        )}

        {loading ? (
          <Card>
            <CardContent className="py-12 text-center text-neutral-600">Loading votes...</CardContent>
          </Card>
        ) : votes.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-neutral-600 mb-4">No votes created yet</p>
              <Button onClick={startNewVote}>Create your first vote</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {votes.map(vote => (
              <Card
                key={vote.label}
                id={`vote-card-${vote.label}`}
                className="hover:shadow-md transition-shadow"
              >
                <CardHeader>
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="mb-2 truncate" title={vote.title}>{vote.title}</CardTitle>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge 
                          variant={vote.isOpen ? "default" : "secondary"}
                          className="font-mono"
                        >
                          {vote.label}
                        </Badge>
                        <Badge variant="outline">
                          {vote.options.length} option{vote.options.length !== 1 ? 's' : ''}
                        </Badge>
                        <span className="text-xs text-neutral-500">
                          {new Date(vote.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant={vote.isOpen ? "default" : "outline"}
                        onClick={() => toggleVoteStatus(vote.label)}
                      >
                        {vote.isOpen ? (
                          <>
                            <Lock className="w-3 h-3 mr-1" />
                            Close
                          </>
                        ) : (
                          <>
                            <Unlock className="w-3 h-3 mr-1" />
                            Open
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteVote(vote.label)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    {vote.options.map(option => (
                      <div key={option.id} className="text-sm text-neutral-600 flex items-center gap-2">
                        <span className="w-1 h-1 bg-neutral-400 rounded-full"></span>
                        {option.label}
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-neutral-200 space-y-2">
                    <Link href={`/vote/${vote.label}`} className="block">
                      <Button variant="ghost" size="sm" className="w-full justify-center">
                        Vote
                      </Button>
                    </Link>
                    <a
                      href={`/api/votes/${vote.label}/qrcode`}
                      target="_blank"
                      rel="noreferrer"
                      className="block"
                    >
                      <Button variant="outline" size="sm" className="w-full justify-center">
                        QR Code
                      </Button>
                    </a>
                    <Link href={`/projector/${vote.label}`} className="block">
                      <Button variant="outline" size="sm" className="w-full justify-center">
                        Projector View
                      </Button>
                    </Link>
                    {!vote.isOpen && (
                      <>
                        <Link href={`/results/${vote.label}`} className="block">
                          <Button variant="outline" size="sm" className="w-full justify-center">
                            View Results
                          </Button>
                        </Link>
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => downloadPng(vote.label)}
                          >
                            Download PNG
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => downloadPdf(vote.label)}
                          >
                            Download PDF
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
