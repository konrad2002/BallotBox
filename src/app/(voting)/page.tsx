"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Settings } from "lucide-react"

export default function EntryPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-b from-neutral-50 to-neutral-100">
      <div className="absolute top-4 right-4">
        <Link href="/manage">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Manage votes"
            className="rounded-full text-neutral-600 hover:text-neutral-900"
          >
            <Settings className="w-5 h-5" />
          </Button>
        </Link>
      </div>

      <div className="w-full max-w-3xl px-4 py-16 text-center space-y-8">
        <div className="space-y-3">
          <h1 className="text-4xl md:text-5xl font-bold text-neutral-900">
            Join a Vote
          </h1>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            Enter the voting space quickly. Share your ranking and see results instantly when the poll closes.
          </p>
        </div>

        <div className="flex flex-col items-center gap-3">
          <Link href="/vote" className="w-full max-w-sm">
            <Button size="lg" className="w-full text-base h-12">
              Participate in a Vote
            </Button>
          </Link>
          <p className="text-sm text-neutral-500">
            Need to create or manage a vote? Use the gear in the corner.
          </p>
        </div>
      </div>
    </div>
  )
}
