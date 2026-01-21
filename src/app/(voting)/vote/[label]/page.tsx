"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, GripVertical, Check } from "lucide-react"
import { useParams, useRouter } from "next/navigation"

interface Option {
  id: string
  label: string
}

// Mock data - in real app, this would come from server
const MOCK_VOTES: Record<string, { title: string; options: Option[] }> = {
  "ABC123": {
    title: "Best Programming Language",
    options: [
      { id: "1", label: "TypeScript" },
      { id: "2", label: "Python" },
      { id: "3", label: "Rust" },
      { id: "4", label: "Go" },
      { id: "5", label: "Java" },
    ]
  },
  "XYZ789": {
    title: "Favorite Frontend Framework",
    options: [
      { id: "1", label: "React" },
      { id: "2", label: "Vue" },
      { id: "3", label: "Svelte" },
      { id: "4", label: "Angular" },
    ]
  }
}

type VoteStep = "select" | "order" | "submit"

interface SelectedOption extends Option {
  rank: number
}

export default function SpecificVotePage() {
  const router = useRouter()
  const params = useParams<{ label?: string | string[] }>()
  const rawLabel = params?.label
  const voteLabel = (Array.isArray(rawLabel) ? rawLabel[0] : rawLabel)?.toUpperCase() || ""
  const vote = voteLabel ? MOCK_VOTES[voteLabel] : undefined

  const [step, setStep] = useState<VoteStep>("select")
  const [selectedOptions, setSelectedOptions] = useState<SelectedOption[]>([])
  const [submitted, setSubmitted] = useState(false)

  if (!vote) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="py-12 text-center">
            <p className="text-xl font-semibold text-neutral-900 mb-2">
              Vote Not Found
            </p>
            <p className="text-neutral-600 mb-6">
              The vote label &quot;{voteLabel}&quot; could not be found.
            </p>
            <Link href="/vote">
              <Button variant="outline">Try Another Label</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const toggleOption = (option: Option) => {
    const isSelected = selectedOptions.some(o => o.id === option.id)
    if (isSelected) {
      setSelectedOptions(selectedOptions.filter(o => o.id !== option.id))
    } else {
      setSelectedOptions([
        ...selectedOptions,
        { ...option, rank: selectedOptions.length + 1 }
      ])
    }
  }

  const moveOption = (index: number, direction: "up" | "down") => {
    const newOptions = [...selectedOptions]
    if (direction === "up" && index > 0) {
      [newOptions[index], newOptions[index - 1]] = [newOptions[index - 1], newOptions[index]]
    } else if (direction === "down" && index < newOptions.length - 1) {
      [newOptions[index], newOptions[index + 1]] = [newOptions[index + 1], newOptions[index]]
    }
    // Update ranks
    newOptions.forEach((opt, idx) => {
      opt.rank = idx + 1
    })
    setSelectedOptions(newOptions)
  }

  const handleSubmit = () => {
    setSubmitted(true)
    // In real app, submit vote to server
    setTimeout(() => {
      router.push("/vote/success")
    }, 1500)
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <Card className="w-full max-w-md">
          <CardContent className="py-12 text-center">
            <div className="text-5xl mb-4">✓</div>
            <h2 className="text-xl font-semibold mb-2">Vote Submitted!</h2>
            <p className="text-neutral-600">
              Your ranked vote has been recorded.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Link
          href="/vote"
          className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>

        <Card>
          <CardHeader>
            <CardTitle>{vote.title}</CardTitle>
            <CardDescription>
              Vote Label: <span className="font-mono font-semibold">{voteLabel}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {step === "select" && (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                  <p className="text-sm text-blue-900">
                    Select one or more options. You&apos;ll rank them in the next step.
                  </p>
                </div>

                <div className="space-y-2">
                  {vote.options.map(option => {
                    const isSelected = selectedOptions.some(o => o.id === option.id)
                    return (
                      <div
                        key={option.id}
                        onClick={() => toggleOption(option)}
                        className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          isSelected
                            ? "border-blue-500 bg-blue-50"
                            : "border-neutral-200 bg-white hover:border-neutral-300"
                        }`}
                      >
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleOption(option)}
                          className="pointer-events-none"
                        />
                        <span className="flex-1 text-neutral-900">{option.label}</span>
                        {isSelected && (
                          <span className="text-xs font-semibold bg-blue-500 text-white px-2 py-1 rounded">
                            #{selectedOptions.find(o => o.id === option.id)?.rank}
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>

                <div className="pt-4">
                  <Button
                    onClick={() => setStep("order")}
                    disabled={selectedOptions.length === 0}
                    className="w-full"
                    size="lg"
                  >
                    Order Selection ({selectedOptions.length})
                  </Button>
                </div>
              </div>
            )}

            {step === "order" && (
              <div className="space-y-4">
                <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
                  <p className="text-sm text-amber-900">
                    Drag to reorder your choices. #1 is your top choice.
                  </p>
                </div>

                <div className="space-y-2">
                  {selectedOptions.map((option, index) => (
                    <div
                      key={option.id}
                      className="flex items-center gap-3 p-4 bg-white border border-neutral-200 rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-neutral-500 w-6 text-center">
                          #{option.rank}
                        </span>
                        <GripVertical className="w-4 h-4 text-neutral-400" />
                      </div>
                      <span className="flex-1 text-neutral-900">{option.label}</span>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => moveOption(index, "up")}
                          disabled={index === 0}
                          className="h-8 w-8 p-0"
                        >
                          ↑
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => moveOption(index, "down")}
                          disabled={index === selectedOptions.length - 1}
                          className="h-8 w-8 p-0"
                        >
                          ↓
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 pt-4">
                  <Button
                    onClick={handleSubmit}
                    className="w-full"
                    size="lg"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Submit Vote
                  </Button>
                  <Button
                    onClick={() => setStep("select")}
                    variant="outline"
                    className="w-full"
                  >
                    Edit Selection
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
