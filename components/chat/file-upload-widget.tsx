"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Paperclip } from "lucide-react";

interface FileUploadWidgetProps {
  onFileUploaded: (file: any) => void;
  disabled?: boolean;
}

export function FileUploadWidget({
  onFileUploaded,
  disabled,
}: FileUploadWidgetProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleButtonClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      // Create FormData to upload directly to your API
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/files/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to process file upload");
      }

      const { file: uploadedFile } = await response.json();
      onFileUploaded(uploadedFile); // Pass uploaded file to parent (MessageInput)
    } catch (error) {
      console.error("Error uploading file:", error);
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = ""; // reset input so same file can be uploaded again
      }
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileChange}
        disabled={disabled}
      />

      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="flex-shrink-0"
        onClick={handleButtonClick}
        disabled={disabled}
      >
        <Paperclip className="h-4 w-4" />
      </Button>
    </>
  );
}
