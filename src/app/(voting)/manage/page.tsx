"use client"

import {useEffect, useMemo, useState} from "react"
import Link from "next/link"
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import {Badge} from "@/components/ui/badge"
import {ArrowLeft, Lock, Plus, Trash2, Unlock} from "lucide-react"
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

  const getTopFiveFromResults = (data: any) => {
    const rounds = data.rounds || []
    const byOption = new Map<string, { label: string; votes: number }>()

    rounds.forEach((round: any) => {
      round.tallies?.forEach((t: any) => {
        const label = t.option?.label || ""
        const votes = Number(t.votes) || 0
        const prev = byOption.get(label)
        if (!prev || votes > prev.votes) {
          byOption.set(label, { label, votes })
        }
      })
    })

    // Fallback: if no rounds, return empty
    const sorted = Array.from(byOption.values()).sort((a, b) => b.votes - a.votes)
    return sorted.slice(0, 5)
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
    listWrapper.style.marginTop = "36px"
    listWrapper.style.display = "grid"
    listWrapper.style.gap = "12px"

    const heading = doc.createElement("div")
    heading.textContent = "Top 5"
    heading.style.fontSize = "34px"
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
      row.style.padding = "16px 20px"
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
      rank.style.width = "60px"
      rank.style.height = "60px"
      rank.style.borderRadius = "12px"
      rank.style.display = "flex"
      rank.style.alignItems = "center"
      rank.style.justifyContent = "center"
      rank.style.fontWeight = "900"
      rank.style.fontSize = "30px"
      rank.style.background = idx === 0 ? "#22c55e" : "#e2e8f0"
      rank.style.color = idx === 0 ? "#ffffff" : "#0f172a"

      const label = doc.createElement("div")
      label.textContent = item.label
      label.style.fontSize = "26px"
      label.style.fontWeight = "800"
      label.style.color = "#0f172a"

      left.appendChild(rank)
      left.appendChild(label)

      const votes = doc.createElement("div")
      votes.textContent = `${item.votes} votes`
      votes.style.fontSize = "24px"
      votes.style.fontWeight = "700"
      votes.style.color = "#64748b"

      top.appendChild(left)
      top.appendChild(votes)

      row.appendChild(top)

      if (item.votes > 0) {
        const barOuter = doc.createElement("div")
        barOuter.style.marginTop = "10px"
        barOuter.style.height = "14px"
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
  const downloadPng = async (label: string) => {
    try {
      const data = await fetchResults(label)
      const topFive = getTopFiveFromResults(data)

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

  const buildPdfDocument = (data: any, options?: { doc?: Document }) => {
    const doc = options?.doc || document
    const container = doc.createElement("div")
    
    // A4 at 96 DPI: 794 × 1123 px, but we'll use higher res for PDF
    container.style.width = "794px"
    container.style.minHeight = "1123px"
    container.style.background = "#ffffff"
    container.style.color = "#000000"
    container.style.fontFamily = "'Times New Roman', serif"
    container.style.padding = "60px"
    container.style.boxSizing = "border-box"
    container.style.position = "relative"
    
    // Header
    const header = doc.createElement("div")
    header.style.borderBottom = "2px solid #000000"
    header.style.paddingBottom = "16px"
    header.style.marginBottom = "24px"
    
    const title = doc.createElement("h1")
    title.textContent = "Voting Results Report"
    title.style.fontSize = "24px"
    title.style.fontWeight = "bold"
    title.style.margin = "0 0 8px 0"
    title.style.color = "#000000"
    
    const voteTitle = doc.createElement("h2")
    voteTitle.textContent = data.voteTitle
    voteTitle.style.fontSize = "18px"
    voteTitle.style.fontWeight = "normal"
    voteTitle.style.margin = "0 0 8px 0"
    voteTitle.style.color = "#333333"
    
    const meta = doc.createElement("div")
    meta.style.fontSize = "12px"
    meta.style.color = "#666666"
    meta.textContent = `Vote ID: ${data.voteLabel} • Generated: ${new Date().toLocaleString()}`
    
    header.appendChild(title)
    header.appendChild(voteTitle)
    header.appendChild(meta)
    
    // Summary section
    const summary = doc.createElement("div")
    summary.style.marginBottom = "24px"
    
    const summaryTitle = doc.createElement("h3")
    summaryTitle.textContent = "Summary"
    summaryTitle.style.fontSize = "16px"
    summaryTitle.style.fontWeight = "bold"
    summaryTitle.style.margin = "0 0 12px 0"
    summaryTitle.style.borderBottom = "1px solid #cccccc"
    summaryTitle.style.paddingBottom = "4px"
    summary.appendChild(summaryTitle)
    
    const summaryGrid = doc.createElement("div")
    summaryGrid.style.display = "grid"
    summaryGrid.style.gridTemplateColumns = "1fr 1fr"
    summaryGrid.style.gap = "8px"
    summaryGrid.style.fontSize = "14px"
    
    const addSummaryItem = (label: string, value: string) => {
      const item = doc.createElement("div")
      const labelSpan = doc.createElement("strong")
      labelSpan.textContent = label + ": "
      item.appendChild(labelSpan)
      item.appendChild(doc.createTextNode(value))
      summaryGrid.appendChild(item)
    }
    
    addSummaryItem("Total Votes Cast", String(data.totalVotes))
    addSummaryItem("Total Options", String(data.rounds?.[0]?.tallies?.length || 0))
    if (data.winner) {
      addSummaryItem("Winner", data.winner.label)
    }
    addSummaryItem("Voting Method", "Instant Runoff Voting (IRV)")
    
    summary.appendChild(summaryGrid)
    
    // Rounds section
    const roundsSection = doc.createElement("div")
    roundsSection.style.marginBottom = "24px"
    
    const roundsTitle = doc.createElement("h3")
    roundsTitle.textContent = "Round-by-Round Results"
    roundsTitle.style.fontSize = "16px"
    roundsTitle.style.fontWeight = "bold"
    roundsTitle.style.margin = "0 0 12px 0"
    roundsTitle.style.borderBottom = "1px solid #cccccc"
    roundsTitle.style.paddingBottom = "4px"
    roundsSection.appendChild(roundsTitle)
    
    if (data.rounds && data.rounds.length > 0) {
      data.rounds.forEach((round: any) => {
        const roundDiv = doc.createElement("div")
        roundDiv.style.marginBottom = "16px"
        
        const roundHeader = doc.createElement("div")
        roundHeader.style.fontSize = "14px"
        roundHeader.style.fontWeight = "bold"
        roundHeader.style.marginBottom = "8px"
        roundHeader.textContent = `Round ${round.roundNumber}`
        if (round.eliminated) {
          const eliminated = doc.createElement("span")
          eliminated.style.fontWeight = "normal"
          eliminated.style.color = "#cc0000"
          const eliminatedLabel = typeof round.eliminated === 'object' ? round.eliminated.label : round.eliminated
          eliminated.textContent = ` (Eliminated: ${eliminatedLabel})`
          roundHeader.appendChild(eliminated)
        }
        roundDiv.appendChild(roundHeader)
        
        const table = doc.createElement("table")
        table.style.width = "100%"
        table.style.borderCollapse = "collapse"
        table.style.fontSize = "12px"
        
        const thead = doc.createElement("thead")
        const headerRow = doc.createElement("tr")
        headerRow.style.borderBottom = "1px solid #000000"
        
        const th1 = doc.createElement("th")
        th1.textContent = "Option"
        th1.style.textAlign = "left"
        th1.style.padding = "4px 8px"
        th1.style.fontWeight = "bold"
        
        const th2 = doc.createElement("th")
        th2.textContent = "Votes"
        th2.style.textAlign = "right"
        th2.style.padding = "4px 8px"
        th2.style.fontWeight = "bold"
        
        const th3 = doc.createElement("th")
        th3.textContent = "Percentage"
        th3.style.textAlign = "right"
        th3.style.padding = "4px 8px"
        th3.style.fontWeight = "bold"
        
        headerRow.appendChild(th1)
        headerRow.appendChild(th2)
        headerRow.appendChild(th3)
        thead.appendChild(headerRow)
        table.appendChild(thead)
        
        const tbody = doc.createElement("tbody")
        const sortedTallies = [...round.tallies].sort((a: any, b: any) => Number(b.votes) - Number(a.votes))
        
        sortedTallies.forEach((tally: any) => {
          const row = doc.createElement("tr")
          row.style.borderBottom = "1px solid #eeeeee"
          
          const td1 = doc.createElement("td")
          td1.textContent = tally.option.label
          td1.style.padding = "4px 8px"
          
          const td2 = doc.createElement("td")
          td2.textContent = String(tally.votes)
          td2.style.textAlign = "right"
          td2.style.padding = "4px 8px"
          
          const td3 = doc.createElement("td")
          const pct = data.totalVotes > 0 ? ((tally.votes / data.totalVotes) * 100).toFixed(1) : "0.0"
          td3.textContent = `${pct}%`
          td3.style.textAlign = "right"
          td3.style.padding = "4px 8px"
          
          row.appendChild(td1)
          row.appendChild(td2)
          row.appendChild(td3)
          tbody.appendChild(row)
        })
        
        table.appendChild(tbody)
        roundDiv.appendChild(table)
        roundsSection.appendChild(roundDiv)
      })
    }
    
    // Footer
    const footer = doc.createElement("div")
    footer.style.marginTop = "32px"
    footer.style.paddingTop = "16px"
    footer.style.borderTop = "1px solid #cccccc"
    footer.style.fontSize = "10px"
    footer.style.color = "#666666"
    footer.style.textAlign = "center"
    
    const footerText = doc.createElement("div")
    footerText.textContent = "Generated by BallotBox"
    const footerDomain = doc.createElement("div")
    footerDomain.textContent = typeof window !== 'undefined' ? window.location.hostname : 'ballotbox.app'
    
    footer.appendChild(footerText)
    footer.appendChild(footerDomain)
    
    container.appendChild(header)
    container.appendChild(summary)
    container.appendChild(roundsSection)
    container.appendChild(footer)
    
    return container
  }

  const downloadPdf = async (label: string) => {
    try {
      const data = await fetchResults(label)
      
      const win = window.open("", "_blank")
      if (!win) return
      const doc = win.document
      doc.open()
      doc.write("<!DOCTYPE html><html><head><title>PDF Preview</title></head><body></body></html>")
      doc.close()

      doc.body.style.margin = "0"
      doc.body.style.background = "#e5e5e5"
      doc.body.style.fontFamily = "'Times New Roman', serif"
      doc.body.style.display = "flex"
      doc.body.style.flexDirection = "column"
      doc.body.style.alignItems = "center"
      doc.body.style.padding = "32px"

      const heading = doc.createElement("h1")
      heading.textContent = "PDF Document Preview"
      heading.style.color = "#0f172a"
      heading.style.fontSize = "24px"
      heading.style.fontWeight = "700"
      heading.style.margin = "0 0 8px 0"
      doc.body.appendChild(heading)

      const sub = doc.createElement("p")
      sub.textContent = "Review the document below, then click Download PDF"
      sub.style.color = "#64748b"
      sub.style.fontSize = "14px"
      sub.style.margin = "0 0 24px 0"
      doc.body.appendChild(sub)

      const pdfDoc = buildPdfDocument(data, { doc })
      pdfDoc.style.boxShadow = "0 4px 20px rgba(0,0,0,0.15)"
      pdfDoc.style.margin = "0 auto 24px auto"
      doc.body.appendChild(pdfDoc)

      const button = doc.createElement("button")
      button.textContent = "Download PDF"
      button.style.marginTop = "16px"
      button.style.padding = "14px 28px"
      button.style.border = "none"
      button.style.borderRadius = "8px"
      button.style.fontSize = "16px"
      button.style.fontWeight = "700"
      button.style.cursor = "pointer"
      button.style.background = "#6366f1"
      button.style.color = "#ffffff"
      button.style.boxShadow = "0 4px 12px rgba(99,102,241,0.3)"
      button.style.transition = "all 0.2s"
      button.onmouseover = () => { button.style.background = "#4f46e5" }
      button.onmouseout = () => { button.style.background = "#6366f1" }
      button.onclick = async () => {
        try {
          button.textContent = "Generating PDF..."
          
          const pdf = new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: "a4"
          })
          
          const pageWidth = 210
          const pageHeight = 297
          const margin = 20
          let yPos = margin

          // Header
          pdf.setFontSize(20)
          pdf.setFont("times", "bold")
          pdf.text("Voting Results Report", margin, yPos)
          yPos += 8
          
          pdf.setFontSize(14)
          pdf.setFont("times", "normal")
          pdf.text(data.voteTitle, margin, yPos)
          yPos += 6
          
          pdf.setFontSize(9)
          pdf.setTextColor(100, 100, 100)
          const hostname = typeof window !== 'undefined' ? window.location.hostname : 'ballotbox.app'
          pdf.text(`Vote ID: ${data.voteLabel} • Generated: ${new Date().toLocaleString()}`, margin, yPos)
          yPos += 8
          
          // Line under header
          pdf.setDrawColor(0, 0, 0)
          pdf.setLineWidth(0.5)
          pdf.line(margin, yPos, pageWidth - margin, yPos)
          yPos += 8
          
          // Summary section
          pdf.setFontSize(12)
          pdf.setFont("times", "bold")
          pdf.setTextColor(0, 0, 0)
          pdf.text("Summary", margin, yPos)
          yPos += 5
          
          pdf.setLineWidth(0.3)
          pdf.setDrawColor(200, 200, 200)
          pdf.line(margin, yPos, pageWidth - margin, yPos)
          yPos += 6
          
          pdf.setFontSize(10)
          pdf.setFont("times", "normal")
          pdf.text(`Total Votes Cast: ${data.totalVotes}`, margin, yPos)
          pdf.text(`Total Options: ${data.rounds?.[0]?.tallies?.length || 0}`, margin + 80, yPos)
          yPos += 5
          
          if (data.winner) {
            pdf.text(`Winner: ${data.winner.label}`, margin, yPos)
          }
          pdf.text("Voting Method: Instant Runoff Voting (IRV)", margin + 80, yPos)
          yPos += 10
          
          // Rounds section
          pdf.setFontSize(12)
          pdf.setFont("times", "bold")
          pdf.text("Round-by-Round Results", margin, yPos)
          yPos += 5
          
          pdf.setLineWidth(0.3)
          pdf.setDrawColor(200, 200, 200)
          pdf.line(margin, yPos, pageWidth - margin, yPos)
          yPos += 6
          
          if (data.rounds && data.rounds.length > 0) {
            data.rounds.forEach((round: any) => {
              // Check if we need a new page
              if (yPos > pageHeight - 60) {
                pdf.addPage()
                yPos = margin
              }
              
              pdf.setFontSize(10)
              pdf.setFont("times", "bold")
              pdf.setTextColor(0, 0, 0)
              let roundText = `Round ${round.roundNumber}`
              if (round.eliminated) {
                const eliminatedLabel = typeof round.eliminated === 'object' ? round.eliminated.label : round.eliminated
                roundText += ` (Eliminated: ${eliminatedLabel})`
              }
              pdf.text(roundText, margin, yPos)
              yPos += 5
              
              // Table header
              pdf.setFontSize(9)
              pdf.setFont("times", "bold")
              pdf.text("Option", margin, yPos)
              pdf.text("Votes", margin + 120, yPos, { align: "right" })
              pdf.text("Percentage", margin + 150, yPos, { align: "right" })
              yPos += 1
              
              pdf.setLineWidth(0.3)
              pdf.setDrawColor(0, 0, 0)
              pdf.line(margin, yPos, pageWidth - margin, yPos)
              yPos += 4
              
              // Table rows
              pdf.setFont("times", "normal")
              const sortedTallies = [...round.tallies].sort((a: any, b: any) => Number(b.votes) - Number(a.votes))
              
              sortedTallies.forEach((tally: any) => {
                // Check if we need a new page
                if (yPos > pageHeight - 40) {
                  pdf.addPage()
                  yPos = margin
                }
                
                const optionLabel = tally.option.label.length > 50 
                  ? tally.option.label.substring(0, 47) + "..." 
                  : tally.option.label
                pdf.text(optionLabel, margin, yPos)
                pdf.text(String(tally.votes), margin + 120, yPos, { align: "right" })
                const pct = data.totalVotes > 0 ? ((tally.votes / data.totalVotes) * 100).toFixed(1) : "0.0"
                pdf.text(`${pct}%`, margin + 150, yPos, { align: "right" })
                yPos += 5
              })
              
              yPos += 3
            })
          }
          
          // Footer
          const footerY = pageHeight - 15
          pdf.setFontSize(8)
          pdf.setTextColor(100, 100, 100)
          pdf.setFont("times", "normal")
          pdf.text("Generated by BallotBox", pageWidth / 2, footerY, { align: "center" })
          pdf.text(hostname, pageWidth / 2, footerY + 4, { align: "center" })
          
          pdf.save(`vote-${label}-results.pdf`)
          button.textContent = "Download PDF"
        } catch (error) {
          button.textContent = "Download PDF"
          console.error(error)
          alert("Failed to generate PDF")
        }
      }
      doc.body.appendChild(button)
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
