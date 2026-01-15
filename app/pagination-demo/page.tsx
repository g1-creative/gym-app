'use client'

import { useState } from 'react'
import { PageLayout } from '@/components/layout/PageLayout'
import { PaginationDemo } from '@/components/ui/pagination-demo'
import { 
  Pagination, 
  PaginationContent, 
  PaginationEllipsis, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from '@/components/ui/pagination'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function PaginationDemoPage() {
  const [currentPage, setCurrentPage] = useState(1)
  const [advancedPage, setAdvancedPage] = useState(1)
  const totalPages = 10

  // Generate dummy data
  const itemsPerPage = 5
  const allItems = Array.from({ length: totalPages * itemsPerPage }, (_, i) => ({
    id: i + 1,
    name: `Item ${i + 1}`,
    description: `Description for item ${i + 1}`,
  }))

  const currentItems = allItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  return (
    <PageLayout
      title="Pagination Component"
      subtitle="Examples of pagination components for navigating through pages"
    >
      <div className="space-y-8">
        {/* Simple Pagination Example */}
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white">Simple Pagination</CardTitle>
            <CardDescription className="text-zinc-400">
              Basic previous/next navigation with page counter
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-3">
              {currentItems.map((item) => (
                <div
                  key={item.id}
                  className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg"
                >
                  <h3 className="font-medium text-white">{item.name}</h3>
                  <p className="text-sm text-zinc-400">{item.description}</p>
                </div>
              ))}
            </div>

            <PaginationDemo
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </CardContent>
        </Card>

        {/* Advanced Pagination Example */}
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white">Advanced Pagination</CardTitle>
            <CardDescription className="text-zinc-400">
              Pagination with numbered pages and ellipsis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      if (advancedPage > 1) setAdvancedPage(advancedPage - 1)
                    }}
                    className={advancedPage === 1 ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>

                {/* Page 1 */}
                <PaginationItem>
                  <PaginationLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      setAdvancedPage(1)
                    }}
                    isActive={advancedPage === 1}
                  >
                    1
                  </PaginationLink>
                </PaginationItem>

                {/* Show ellipsis if needed */}
                {advancedPage > 3 && (
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                )}

                {/* Show pages around current page */}
                {advancedPage > 2 && advancedPage < totalPages - 1 && (
                  <>
                    {advancedPage > 3 && (
                      <PaginationItem>
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault()
                            setAdvancedPage(advancedPage - 1)
                          }}
                        >
                          {advancedPage - 1}
                        </PaginationLink>
                      </PaginationItem>
                    )}
                    <PaginationItem>
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault()
                        }}
                        isActive
                      >
                        {advancedPage}
                      </PaginationLink>
                    </PaginationItem>
                    {advancedPage < totalPages - 2 && (
                      <PaginationItem>
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault()
                            setAdvancedPage(advancedPage + 1)
                          }}
                        >
                          {advancedPage + 1}
                        </PaginationLink>
                      </PaginationItem>
                    )}
                  </>
                )}

                {/* Show page 2 if current page is 2 */}
                {advancedPage === 2 && (
                  <PaginationItem>
                    <PaginationLink
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                      }}
                      isActive
                    >
                      2
                    </PaginationLink>
                  </PaginationItem>
                )}

                {/* Show ellipsis if needed */}
                {advancedPage < totalPages - 2 && (
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                )}

                {/* Last page */}
                <PaginationItem>
                  <PaginationLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      setAdvancedPage(totalPages)
                    }}
                    isActive={advancedPage === totalPages}
                  >
                    {totalPages}
                  </PaginationLink>
                </PaginationItem>

                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      if (advancedPage < totalPages) setAdvancedPage(advancedPage + 1)
                    }}
                    className={
                      advancedPage === totalPages ? 'pointer-events-none opacity-50' : ''
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>

            <div className="mt-4 text-center text-sm text-zinc-400">
              Currently viewing page {advancedPage} of {totalPages}
            </div>
          </CardContent>
        </Card>

        {/* Usage Example */}
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white">Usage Example</CardTitle>
            <CardDescription className="text-zinc-400">
              How to implement pagination in your components
            </CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 overflow-x-auto">
              <code className="text-sm text-zinc-300">
{`import { PaginationDemo } from '@/components/ui/pagination-demo'

function MyComponent() {
  const [currentPage, setCurrentPage] = useState(1)
  const totalPages = 10

  return (
    <PaginationDemo
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={setCurrentPage}
    />
  )
}`}
              </code>
            </pre>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  )
}
