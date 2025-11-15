"use client"
import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { authClient } from "@/auth/auth-client";
import { ensureProfileExists, getSupportingDocuments, upsertSupportingDocument, deleteSupportingDocument } from "@/lib/actions/profile-actions";
import { uploadFileToS3, deleteFileFromS3 } from "@/lib/actions/upload-actions";

export interface UploadedFile {
  id: string;
  file?: File;
  type: string;
  name: string;
  size: number;
  url?: string;
  documentId?: number;
}

export interface SupportingDocumentProps {
  id?: number;
  tempId?: string;
  proofOfCitizenshipFiles: UploadedFile[];
  birthCertificateFiles: UploadedFile[];
  passportFiles: UploadedFile[];
}

interface SupportingDocumentContextProps {
  supportingDocument: SupportingDocumentProps;
  updateSupportingDocumentData: (property: Partial<SupportingDocumentProps>) => void;
  addFileToCategory: (category: keyof SupportingDocumentProps, file: UploadedFile) => void;
  removeFileFromCategory: (category: keyof SupportingDocumentProps, fileId: string) => void;
  saveSupportingDocumentsData: () => Promise<void>;
  isLoading: boolean;
  isSaving: boolean;
}

const SupportingDocumentContext = createContext<SupportingDocumentContextProps | undefined>(undefined);

const makeTempId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

const initialSupportingDocumentData: SupportingDocumentProps = {
  id: undefined,
  tempId: makeTempId(),
  proofOfCitizenshipFiles: [],
  birthCertificateFiles: [],
  passportFiles: [],
}

function mapSupportingDocument(existing: any): SupportingDocumentProps {
  return {
    id: existing.id ?? existing.ID ?? existing.id ?? undefined,
    tempId: existing.tempId ?? makeTempId(),
    proofOfCitizenshipFiles: existing.proofOfCitizenshipFiles ?? existing.proof_of_citizenship_files ?? [],
    birthCertificateFiles: existing.birthCertificateFiles ?? existing.birth_certificate_files ?? [],
    passportFiles: existing.passportFiles ?? existing.passport_files ?? [],
  };
}

export function SupportingDocumentProvider({ children }: { children: ReactNode }) {
  const { data: session } = authClient.useSession();
  const [supportingDocument, setSupportingDocument] = useState<SupportingDocumentProps>(initialSupportingDocumentData);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!session) {
      setIsLoading(false);
      return;
    }

    const loadInitialData = async () => {
      try {
        setIsLoading(true);
        const profile = await ensureProfileExists(session, "Job seeker");
        const existingSupportingDocuments = await getSupportingDocuments(profile.id);

        if (existingSupportingDocuments && existingSupportingDocuments.length > 0) {
          setSupportingDocument(mapSupportingDocument(existingSupportingDocuments[0]));
        } else {
          setSupportingDocument(initialSupportingDocumentData);
        }
      } catch (error) {
        console.error("Failed to load Supporting Documents information", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadInitialData();
  }, [session]);

  const updateSupportingDocumentData = (data: Partial<SupportingDocumentProps>) => {
    setSupportingDocument(prev => ({ ...prev, ...data }));
  };

  const addFileToCategory = (category: keyof SupportingDocumentProps, file: UploadedFile) => {
    setSupportingDocument(prev => ({
      ...prev,
      [category]: [...prev[category], file]
    }));
  };

  const removeFileFromCategory = (category: keyof SupportingDocumentProps, fileId: string) => {
    setSupportingDocument(prev => ({
      ...prev,
      [category]: prev[category].filter(file => file.id !== fileId)
    }));
  };

  const saveSupportingDocumentsData = async () => {
    if (!session) throw new Error("No session found");
    try {
      setIsSaving(true);
      const profile = await ensureProfileExists(session, "Job seeker");

      // Upload files to S3 and get URLs
      const categories: (keyof SupportingDocumentProps)[] = [
        'proofOfCitizenshipFiles', 
        'birthCertificateFiles', 
        'passportFiles'
      ];

      const updatedDocument = { ...supportingDocument };

      for (const category of categories) {
        const files = updatedDocument[category];
        const updatedFiles = [];

        for (const file of files) {
          if (file.file && !file.url) {
            // New file - upload to S3
            try {
              const s3Url = await uploadFileToS3(file.file, `supporting-documents/${profile.id}/${category}/${file.name}`);
              updatedFiles.push({
                ...file,
                url: s3Url
              });
            } catch (error) {
              console.error(`Failed to upload file ${file.name} to S3:`, error);
              throw new Error(`Failed to upload ${file.name}`);
            }
          } else {
            // Existing file - keep as is
            updatedFiles.push(file);
          }
        }

        updatedDocument[category] = updatedFiles;
      }

      const result = await upsertSupportingDocument(profile.id, updatedDocument);

      if (result) {
        setSupportingDocument(mapSupportingDocument(result));
      }
    } catch (error) {
      console.error("Failed to save Supporting Documents data:", error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SupportingDocumentContext.Provider
      value={{
        supportingDocument,
        updateSupportingDocumentData,
        addFileToCategory,
        removeFileFromCategory,
        saveSupportingDocumentsData,
        isLoading,
        isSaving
      }}
    >
      {children}
    </SupportingDocumentContext.Provider>
  );
}

export const useSupportingDocument = () => {
  const context = useContext(SupportingDocumentContext);
  if (!context) {
    throw new Error("useSupportingDocument must be used within an SupportingDocumentProvider");
  }
  return context;
};