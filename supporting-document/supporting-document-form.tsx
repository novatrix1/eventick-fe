// supporting-document-form.tsx
"use client"

import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Upload, FileText, Image, X, Edit2, Trash2 } from "lucide-react"
import { useSupportingDocument, type UploadedFile } from "./supporting-document-form-context"

const supportingDocumentSchema = z.object({})

function SupportingDocumentForm() {
  const {
    supportingDocument,
    addFileToCategory,
    removeFileFromCategory,
    saveSupportingDocumentsData,
    isLoading,
    isSaving
  } = useSupportingDocument()

  const proofOfCitizenshipRef = useRef<HTMLInputElement>(null)
  const birthCertificateRef = useRef<HTMLInputElement>(null)
  const passportRef = useRef<HTMLInputElement>(null)

  const form = useForm<z.infer<typeof supportingDocumentSchema>>({
    resolver: zodResolver(supportingDocumentSchema),
  })

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, category: keyof typeof supportingDocument) => {
    const files = event.target.files
    if (!files) return

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (file.type.includes('pdf') || file.type.includes('image') || file.name.endsWith('.svg')) {
        const newFile: UploadedFile = {
          id: Math.random().toString(36).substr(2, 9),
          file,
          type: file.type,
          name: file.name,
          size: file.size
        }
        addFileToCategory(category, newFile)
      }
    }
    event.target.value = ''
  }

  const handleRemoveFile = (category: keyof typeof supportingDocument, fileId: string) => {
    removeFileFromCategory(category, fileId)
  }

  const triggerFileInput = (ref: React.RefObject<HTMLInputElement>) => {
    ref.current?.click()
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return <FileText className="h-6 w-6 text-red-500" />
    if (fileType.includes('image') || fileType.includes('svg')) return <Image className="h-6 w-6 text-blue-500" />
    return <FileText className="h-6 w-6 text-gray-500" />
  }

  const onSubmit = async () => {
    try {
      await saveSupportingDocumentsData();
      console.log("Supporting documents saved successfully");
    } catch (error) {
      console.error("Failed to save supporting documents:", error);
    }
  }

  const UploadArea = ({ 
    title, 
    category,
    inputRef 
  }: { 
    title: string
    category: keyof typeof supportingDocument
    inputRef: React.RefObject<HTMLInputElement>
  }) => (
    <div>
      <label className="text-primary font-medium">{title}</label>
      
      <div 
        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition-colors mt-2"
        onClick={() => triggerFileInput(inputRef)}
      >
        <input
          type="file"
          ref={inputRef}
          onChange={(e) => handleFileUpload(e, category)}
          accept=".pdf,.png,.jpg,.jpeg,.svg"
          multiple
          className="hidden"
          disabled={isLoading || isSaving}
        />
        <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
        <p className="text-sm text-gray-600">
          <span className="text-primary">Click to upload</span> or drag and drop<br />SVG, PNG or PDF (max 800x400px)
        </p>
      </div>

      {supportingDocument[category].length > 0 && (
        <div className="mt-4 space-y-3">
          {supportingDocument[category].map((file) => (
            <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3 flex-1">
                {getFileIcon(file.type)}
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{file.name}</span>
                  <span className="text-xs text-gray-500">{formatFileSize(file.size)}</span>
                  {file.url && (
                    <span className="text-xs text-green-600">Uploaded</span>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => triggerFileInput(inputRef)}
                  className="h-8 w-8 p-0"
                  disabled={isLoading || isSaving}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleRemoveFile(category, file.id)}
                  className="h-8 w-8 p-0"
                  disabled={isLoading || isSaving}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-8">
        {/* Proof of Citizenship */}
        <UploadArea
          title="Proof of Citizenship"
          category="proofOfCitizenshipFiles"
          inputRef={proofOfCitizenshipRef}
        />

        {/* Birth Certificate */}
        <UploadArea
          title="Birth Certificate"
          category="birthCertificateFiles"
          inputRef={birthCertificateRef}
        />

        {/* Passport */}
        <UploadArea
          title="Passport"
          category="passportFiles"
          inputRef={passportRef}
        />

        <div className="flex justify-between gap-4 mt-6">
          <Button 
            type="button" 
            variant="outline" 
            className="border-none"
            disabled={isLoading || isSaving}
          >
            Skip
          </Button>

          <div className="flex gap-4">
            <Button 
              type="button" 
              variant="outline" 
              className="border-primary text-primary"
              disabled={isLoading || isSaving}
            >
              Next
            </Button>
            
            <Button
              type="button"
              variant="glow"
              onClick={onSubmit}
              disabled={isLoading || isSaving}
            >
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  )
}

export default SupportingDocumentForm