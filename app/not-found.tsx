'use client'

import { Button } from '@/components/ui/button'
import { FileQuestion } from 'lucide-react'
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-slate-700/50 p-4 rounded-full">
            <FileQuestion className="h-12 w-12 text-slate-400" />
          </div>
        </div>
        
        <h1 className="text-6xl font-bold mb-4">404</h1>
        
        <h2 className="text-2xl font-semibold mb-2">Page not found</h2>
        
        <p className="text-slate-400 mb-6">
          The page you're looking for doesn't exist or has been moved.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/">
            <Button className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
              Go to dashboard
            </Button>
          </Link>
          
          <Link href="/programs">
            <Button variant="outline" className="border-slate-600 hover:bg-slate-800 w-full sm:w-auto">
              View programs
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
