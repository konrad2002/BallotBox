"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Plus, Trash2, Lock, Unlock } from "lucide-react"
type ApiVote = {
  label: string
  title: string
  isOpen: boolean
  createdAt?: string
  options: { id: string; label: string; order: number }[]
}

interface Option {
  id: string
  label: string
}

interface Vote {
  label: string
  title: string
  options: Option[]
  isOpen: boolean
  createdAt: Date
}

export default function ManagePage() {
  const [votes, setVotes] = useState<Vote[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showNewVoteForm, setShowNewVoteForm] = useState(false)
  const [newVoteTitle, setNewVoteTitle] = useState("")
  const [newOptions, setNewOptions] = useState<Option[]>([])
  const [newOptionInput, setNewOptionInput] = useState("")

  const startNewVote = () => {
    setShowNewVoteForm(true)
    setNewVoteTitle("")
    setNewOptions([])
    setNewOptionInput("")
  }

  // Load votes on mount
  useEffect(() => {
    const load = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const res = await fetch("/api/votes")
        if (!res.ok) throw new Error(await res.text())
        const data: ApiVote[] = await res.json()
        setVotes(
          data.map((v) => ({
            label: v.label,
            title: v.title,
            isOpen: v.isOpen,
            createdAt: v.createdAt ? new Date(v.createdAt) : new Date(),
            options: v.options.map((o) => ({ id: o.id, label: o.label })),
          }))
        )
      } catch (err) {
        console.error(err)
        setError("Could not load votes.")
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

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
    setIsSaving(true)
    setError(null)
    try {
      const res = await fetch("/api/votes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newVoteTitle.trim(),
          options: newOptions.map((o) => o.label.trim()),
        }),
      })
      if (!res.ok) throw new Error(await res.text())
      const created: ApiVote = await res.json()
      setVotes([
        {
          label: created.label,
          title: created.title,
          isOpen: created.isOpen,
          createdAt: new Date(created.createdAt ?? Date.now()),
          options: created.options.map((o) => ({ id: o.id, label: o.label })),
        },
        ...votes,
      ])
      setShowNewVoteForm(false)
      setNewVoteTitle("")
      setNewOptions([])
    } catch (err) {
      console.error(err)
      setError("Could not create vote.")
    } finally {
      setIsSaving(false)
    }
  }

  const toggleVoteStatus = async (label: string, current: boolean) => {
    setError(null)
    setVotes((prev) => prev.map((v) => (v.label === label ? { ...v, isOpen: !current } : v)))
    const res = await fetch(`/api/votes/${label}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isOpen: !current }),
    })
    if (!res.ok) {
      setError("Could not update vote status.")
      // revert
      setVotes((prev) => prev.map((v) => (v.label === label ? { ...v, isOpen: current } : v)))
    }
  }

  const deleteVote = async (label: string) => {
    setError(null)
    // optimistic remove
    const previous = votes
    setVotes((prev) => prev.filter((v) => v.label !== label))
    const res = await fetch(`/api/votes/${label}`, { method: "DELETE" })
    if (!res.ok) {
      setVotes(previous)
      setError("Could not delete vote.")
    }
  }

  const canSubmit = useMemo(() => newVoteTitle.trim() && newOptions.length >= 2 && !isSaving, [newVoteTitle, newOptions.length, isSaving])

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
                  disabled={!canSubmit}
                  className="flex-1"
                >
                  {isSaving ? "Creating..." : "Create Vote"}
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

        {votes.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-neutral-600 mb-4">No votes created yet</p>
              <Button onClick={startNewVote}>Create your first vote</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {votes.map(vote => (
              <Card key={vote.label} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="mb-2">{vote.title}</CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={vote.isOpen ? "default" : "secondary"}
                          className="font-mono"
                        >
                          {vote.label}
                        </Badge>
                        <Badge variant="outline">
                          {vote.options.length} option{vote.options.length !== 1 ? 's' : ''}
                        </Badge>
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
                  <div className="mt-4 pt-4 border-t border-neutral-200">
                    <Link href={`/vote/${vote.label}`}>
                      <Button variant="ghost" size="sm" className="w-full justify-center">
                        Vote Link
                      </Button>
                    </Link>
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
