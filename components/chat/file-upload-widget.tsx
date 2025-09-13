"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Paperclip, X } from "lucide-react";

interface FileUploadWidgetProps {
  onFileUploaded: (file: any) => void;
  disabled?: boolean;
}

declare global {
  interface Window {
    uploadcare: any;
    UPLOADCARE_PUBLIC_KEY: string;
    UPLOADCARE_TABS: string;
    UPLOADCARE_EFFECTS: string;
  }
}

export function FileUploadWidget({
  onFileUploaded,
  disabled,
}: FileUploadWidgetProps) {
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);

  useEffect(() => {
    if (!document.querySelector('script[src*="uploadcare"]')) {
      const script = document.createElement("script");
      script.src =
        "https://ucarecdn.com/libs/widget/3.x/uploadcare.full.min.js";
      script.async = true;
      document.head.appendChild(script);
    }
  }, []);

  const openWidget = () => {
    if (!window.uploadcare || disabled) return;

    window.UPLOADCARE_PUBLIC_KEY =
      process.env.NEXT_PUBLIC_UPLOADCARE_PUBLIC_KEY || "";
    window.UPLOADCARE_TABS = "file camera url";
    window.UPLOADCARE_EFFECTS = "crop,rotate,enhance";

    const dialog = window.uploadcare.openDialog(null, {
      publicKey: process.env.NEXT_PUBLIC_UPLOADCARE_PUBLIC_KEY,
      tabs: "file camera url",
      effects: "crop,rotate,enhance",
      previewStep: true,
      clearable: true,
      multiple: true, // ✅ multiple enabled
      imagesOnly: false,
    });

    console.log("inside openWidget");

    dialog.done((result: any) => {
      console.log("dialog done", result);

      // When multiple: true → result.files() gives array of file promises
      if (result.files) {
        result.files().forEach((filePromise: any) => {
          filePromise.done((fileInfo: any) => {
            console.log("file done", fileInfo.uuid);
            handleFileUpload(fileInfo.uuid, fileInfo);
          });
        });
      } else {
        // single file fallback
        result.done((fileInfo: any) => {
          console.log("file done", fileInfo.uuid);
          handleFileUpload(fileInfo.uuid, fileInfo);
        });
      }
    });
  };


  const handleFileUpload = async (uuid: string, fileInfo: any) => {
    try {
      const response = await fetch("/api/files/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uploadcareUuid: uuid,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to process file upload");
      }

      const { file } = await response.json();

      // update local preview list
      setUploadedFiles((prev) => [...prev, file]);

      // bubble up to parent
      onFileUploaded(file);
    } catch (error) {
      console.error("Error processing file upload:", error);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="flex-shrink-0"
        onClick={openWidget}
        disabled={disabled}
      >
        <Paperclip className="h-4 w-4" />
      </Button>

      {/* Uploaded Files Preview */}
      {/* {uploadedFiles.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {uploadedFiles.map((file, index) => (
            <div
              key={file.id || index}
              className="flex items-center gap-2 border rounded-md p-2 bg-muted text-sm"
            >
              {file.type?.startsWith("image/") ? (
                <img
                  src={file.url}
                  alt={file.name}
                  className="h-10 w-10 rounded object-cover"
                />
              ) : (
                <span className="truncate max-w-[120px]">{file.name}</span>
              )}
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="text-muted-foreground hover:text-red-500"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )} */}
    </div>
  );
}
