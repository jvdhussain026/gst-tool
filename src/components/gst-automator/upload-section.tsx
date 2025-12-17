'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/icons';
import type { InvoiceFile } from '@/lib/types';
import { cn } from '@/lib/utils';

interface UploadSectionProps {
  files: InvoiceFile[];
  onFilesAdded: (files: File[]) => void;
  onRemoveFile: (id: string) => void;
  onClearAll: () => void;
}

export function UploadSection({ files, onFilesAdded, onRemoveFile, onClearAll }: UploadSectionProps) {
  const [isDragActive, setIsDragActive] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    onFilesAdded(acceptedFiles);
    setIsDragActive(false);
  }, [onFilesAdded]);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Step 1: Upload Your Invoices</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors",
            isDragActive ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
          )}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <Icons.upload className="w-10 h-10" />
            <p className="font-semibold">Drag & drop your PDF invoices here</p>
            <p className="text-sm">or</p>
            <Button type="button" variant="secondary">Click to browse files</Button>
          </div>
        </div>

        {files.length > 0 && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">Uploaded Files</h3>
              <Button variant="ghost" size="sm" onClick={onClearAll} className="text-destructive hover:text-destructive">
                <Icons.trash className="mr-2 h-4 w-4" /> Clear All
              </Button>
            </div>
            <ul className="space-y-3">
              {files.map(file => (
                <FileStatusItem key={file.id} file={file} onRemove={onRemoveFile} />
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function FileStatusItem({ file, onRemove }: { file: InvoiceFile; onRemove: (id: string) => void }) {
  const getStatusInfo = () => {
    switch (file.status) {
      case 'pending':
        return { icon: <Icons.spinner className="animate-spin text-muted-foreground" />, text: 'Pending', color: 'bg-gray-400' };
      case 'processing':
        return { icon: <Icons.spinner className="animate-spin text-primary" />, text: 'Processing...', color: 'bg-blue-400' };
      case 'success':
        return { icon: <Icons.check className="text-green-500" />, text: 'Success', color: 'bg-green-500' };
      case 'error':
        return { icon: <Icons.error className="text-destructive" />, text: 'Error', color: 'bg-red-500' };
      case 'duplicate':
        return { icon: <Icons.copy className="text-yellow-500" />, text: 'Duplicate', color: 'bg-yellow-500' };
      default:
        return { icon: null, text: '', color: 'bg-gray-400' };
    }
  };

  const { icon, text } = getStatusInfo();

  return (
    <li className="flex items-center gap-4 p-3 bg-secondary/50 rounded-lg">
      <div className="flex-shrink-0">{icon}</div>
      <div className="flex-grow min-w-0">
        <p className="truncate text-sm font-medium">{file.file.name}</p>
        <div className="flex items-center gap-2">
            {file.status === 'processing' ? (
                <Progress value={file.progress} className="h-2 w-24" />
            ) : (
                <p className="text-xs text-muted-foreground">{text}</p>
            )}
        </div>

      </div>
      <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0" onClick={() => onRemove(file.id)}>
        <Icons.trash className="h-4 w-4 text-muted-foreground" />
        <span className="sr-only">Remove file</span>
      </Button>
    </li>
  );
}
