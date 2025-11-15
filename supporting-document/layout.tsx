"use client";

import { ReactNode } from "react";
import { SupportingDocumentProvider } from "./supporting-document-form-context";

export default function Layout({ children }: { children: ReactNode }) {
    return (
        <SupportingDocumentProvider>
            {children}
        </SupportingDocumentProvider>
    );
}