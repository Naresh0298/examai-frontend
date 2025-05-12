
"use client"; 

import { useState, ChangeEvent, FormEvent } from 'react';

interface FileUploadProps {
  uploadUrl: string; // URL of your FastAPI upload endpoint
  expectedFieldName: string; // The field name FastAPI expects for the file(s) (e.g., 'files')
}

export default function FileUpload({ uploadUrl, expectedFieldName }: FileUploadProps) {
  // --- MODIFICATION 1: Change state to hold FileList for multiple files ---
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadResponse, setUploadResponse] = useState<any | null>(null); // To store backend response

  // --- MODIFICATION 2: Update handler to store the FileList ---
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFiles(event.target.files); // Store the entire FileList
      setError(null); // Clear previous errors on new file selection
      setUploadResponse(null); // Clear previous response
      console.log(`Selected ${event.target.files.length} file(s)`); // Log how many files were selected
    } else {
      setSelectedFiles(null);
    }
  };

  // --- MODIFICATION 3: Update upload handler logic ---
  const handleUpload = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Prevent default form submission

    // Updated check for multiple files
    if (!selectedFiles || selectedFiles.length === 0) {
      setError("Please select one or more files first.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setUploadResponse(null);

    const formData = new FormData();

    // Loop through the FileList and append each file
    // Use the field name FastAPI expects (passed via props)
    for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        formData.append(expectedFieldName, file, file.name);
        console.log(`Appending file to FormData: ${file.name} with key ${expectedFieldName}`); // Log appending
    }

    // Optional: You can log the FormData entries for debugging if needed
    // Note: Console logging FormData isn't always straightforward
    // for (let pair of formData.entries()) {
    //   console.log(`${pair[0]}: ${pair[1]}`);
    // }

    try {
      console.log(`Sending ${selectedFiles.length} file(s) to ${uploadUrl}`);

      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
        // Browser sets Content-Type automatically for FormData
      });

      const result = await response.json();

      if (!response.ok) {
        // Try to extract detail message from FastAPI's response
        let errorMessage = `HTTP error! status: ${response.status}`;
        if (result.detail) {
            if (typeof result.detail === 'string') {
               errorMessage = `Server Error (${response.status}): ${result.detail}`;
            } else if (Array.isArray(result.detail)) {
                // Format FastAPI validation errors
                errorMessage = `Server Validation Error (${response.status}): ${result.detail.map((e: any) => `${e.loc?.join('->') || 'field'}: ${e.msg}`).join(', ')}`;
            } else {
               errorMessage = `Server Error (${response.status}): ${JSON.stringify(result.detail)}`;
            }
        }
        throw new Error(errorMessage);
      }

      console.log("Upload successful, response:", result);
      setUploadResponse(result); // Store successful response from backend
      setSelectedFiles(null); // Clear the file input after successful upload

    } catch (err: any) {
      console.error("Upload error caught:", err);
      setError(err.message || "An error occurred during upload.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded bg-gray-100 w-full max-w-md">
      <h2 className="text-xl font-semibold mb-3 text-blue-600">Upload File(s)</h2>
      <form onSubmit={handleUpload}>
        <div className="mb-3">
          <label htmlFor="fileInput" className="block mb-1 text-sm font-medium text-gray-700">
            Select file(s):
          </label>
          {/* --- MODIFICATION 4: Add 'multiple' attribute --- */}
          <input
            id="fileInput"
            type="file"
            multiple // <-- ALLOW MULTIPLE FILE SELECTION
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
            // Add 'accept' attribute to suggest file types (optional)
            accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.bmp,.webp,.ppt,.pptx" // Match backend allowances
          />
          {/* --- MODIFICATION 5: Update display for multiple files --- */}
          {selectedFiles && selectedFiles.length > 0 && (
            <div className="mt-1 text-xs text-gray-600">
                <p>Selected ({selectedFiles.length}):</p>
                <ul className="list-disc list-inside">
                    {/* Convert FileList to array to use map */}
                    {Array.from(selectedFiles).map((file, index) => (
                        <li key={index}>{file.name} ({Math.round(file.size / 1024)} KB)</li>
                    ))}
                </ul>
            </div>
          )}
        </div>

        {/* Update disabled check and button text */}
        <button
          type="submit"
          disabled={!selectedFiles || selectedFiles.length === 0 || isLoading}
          className="px-4 py-2 font-semibold text-white bg-green-500 rounded hover:bg-green-600 disabled:bg-gray-400 w-full"
        >
          {isLoading ? 'Uploading...' : `Upload ${selectedFiles ? selectedFiles.length : 0} File(s)`}
        </button>
      </form>

      {/* Display Loading State */}
      {isLoading && <p className="mt-2 text-sm text-blue-600">Uploading file(s)...</p>}

      {/* Display Error Message */}
      {error && <p className="mt-2 text-sm text-red-600">Error: {error}</p>}

      {/* Display Success/Backend Response Message */}
      {uploadResponse && (
        <div className="mt-2 text-sm text-green-600">
          <p>Upload successful!</p>
          <pre className="text-xs bg-green-50 p-1 rounded overflow-x-auto">
            {JSON.stringify(uploadResponse, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}