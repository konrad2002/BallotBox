"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function EntryPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-neutral-50 to-neutral-100">
      <div className="w-full max-w-md px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-neutral-900 mb-2">
            Ballot Box
          </h1>
          <p className="text-neutral-600">
            Simple & Elegant Ranked Voting
          </p>
        </div>

        <div className="space-y-4">
          <Link href="/manage" className="block">
            <Button 
              size="lg" 
              className="w-full"
            >
              Create a Vote
            </Button>
          </Link>
          
          <Link href="/vote" className="block">
            <Button 
              size="lg" 
              variant="outline"
              className="w-full"
            >
              Participate in Vote
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
