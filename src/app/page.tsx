
"use client";
import { useState } from 'react';
import FileUpload from '@/components/FileUpload'; // Adjust path if necessary


export default function Home() {
    // --- File Upload Configuration ---
  const FASTAPI_UPLOAD_URL = "https://examai-server-b0ffa534d6f6.herokuapp.com/upload_docs";
  
  const FASTAPI_EXPECTED_FIELD_NAME = "files";

  return (
    <main className="flex min-h-screen flex-col items-center p-10 space-y-8">
      <h1 className="text-3xl font-bold">FastAPI Test Frontend</h1>

      {/* --- File Upload Section --- */}
      <FileUpload
        
        uploadUrl={FASTAPI_UPLOAD_URL}
        expectedFieldName={FASTAPI_EXPECTED_FIELD_NAME}
      />

    </main>
  );
}