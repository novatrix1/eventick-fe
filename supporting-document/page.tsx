"use client"

import { Card, CardHeader, CardDescription, CardContent } from '@/components/ui/card'
import SupportingDocumentForm from './supporting-document-form'

function Page() {
  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardDescription className='font-medium'>
          Supporting Documents
        </CardDescription>
      </CardHeader>
      <CardContent>
        <SupportingDocumentForm />
      </CardContent>
    </Card>
  )
}

export default Page