"use client";

import { useState, useRef } from "react";
import { Button } from "@/src/shared/components/global/ui/button";
import { Upload, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/src/shared/utils";

interface CsvUploadProps {
  onUploadComplete?: (data: {
    headers: string[];
    rows: Record<string, string>[];
    totalRows: number;
    fileName: string;
    fileSize: number;
  }) => void;
  className?: string;
  disabled?: boolean;
}

export function CsvUpload({ onUploadComplete, className, disabled }: CsvUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.name.endsWith(".csv")) {
        toast.error("Apenas arquivos CSV são permitidos");
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Selecione um arquivo CSV primeiro");
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch("/api/upload/accounts-payment", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao processar CSV");
      }

      toast.success(`CSV processado com sucesso! ${data.data.totalRows} linhas importadas.`);
      
      if (onUploadComplete) {
        onUploadComplete(data.data);
      }

      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Erro ao fazer upload:", error);
      toast.error(error instanceof Error ? error.message : "Erro ao fazer upload do arquivo");
    } finally {
      setIsUploading(false);
    }
  };

  const handleButtonClick = () => {
    if (selectedFile) {
      handleUpload();
    } else {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || isUploading}
      />
      
      <div className="flex items-center gap-2">
        <Button
          type="button"
          onClick={handleButtonClick}
          disabled={disabled || isUploading}
          variant="outline"
          className="flex items-center gap-2"
        >
          {isUploading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Processando...
            </>
          ) : selectedFile ? (
            <>
              <Upload className="h-4 w-4" />
              Enviar CSV
            </>
          ) : (
            <>
              <FileText className="h-4 w-4" />
              Selecionar CSV
            </>
          )}
        </Button>

        {selectedFile && !isUploading && (
          <span className="text-sm text-muted-foreground truncate max-w-[200px]">
            {selectedFile.name}
          </span>
        )}
      </div>

      {selectedFile && (
        <div className="text-xs text-muted-foreground">
          Arquivo selecionado: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
        </div>
      )}
    </div>
  );
}

