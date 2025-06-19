'use client';

import React, { useState, useCallback } from 'react';
import { Upload, Play, Download, Code, Eye, FileText } from 'lucide-react';

export default function TSXRunnerPage() {
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; content: string }[]>([]);
  const [activeFile, setActiveFile] = useState<string>('');
  const [code, setCode] = useState<string>(`import React, { useState } from 'react';

const MyComponent = () => {
  const [count, setCount] = useState(0);

  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">TSX Runner Demo</h1>
      <div className="space-y-4">
        <div className="bg-blue-100 p-4 rounded-lg">
          <p className="text-lg">Count: {count}</p>
        </div>
        <div className="space-x-2">
          <button 
            onClick={() => setCount(count + 1)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Increment
          </button>
          <button 
            onClick={() => setCount(count - 1)}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Decrement
          </button>
          <button 
            onClick={() => setCount(0)}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};

export default MyComponent;`);

  const [viewMode, setViewMode] = useState<'editor' | 'preview' | 'split'>('split');

  // Handle file upload
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        const newFile = { name: file.name, content };
        setUploadedFiles(prev => [...prev, newFile]);
        if (!activeFile) {
          setActiveFile(file.name);
          setCode(content);
        }
      };
      reader.readAsText(file);
    });
  }, [activeFile]);

  // Handle drag and drop
  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    
    Array.from(files).forEach((file) => {
      if (file.name.endsWith('.tsx') || file.name.endsWith('.jsx') || file.name.endsWith('.ts') || file.name.endsWith('.js')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          const newFile = { name: file.name, content };
          setUploadedFiles(prev => [...prev, newFile]);
          if (!activeFile) {
            setActiveFile(file.name);
            setCode(content);
          }
        };
        reader.readAsText(file);
      }
    });
  }, [activeFile]);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="glass-card p-6 m-6 mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold mb-2">TSX Runner</h1>
            <p className="text-muted-foreground">
              Upload and preview your TSX/JSX files with live editing
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-muted rounded-lg p-1">
              <button
                onClick={() => setViewMode('editor')}
                className={`p-2 rounded ${viewMode === 'editor' ? 'bg-background shadow' : ''}`}
              >
                <Code className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('split')}
                className={`p-2 rounded ${viewMode === 'split' ? 'bg-background shadow' : ''}`}
              >
                <FileText className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('preview')}
                className={`p-2 rounded ${viewMode === 'preview' ? 'bg-background shadow' : ''}`}
              >
                <Eye className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* File Upload Area */}
      <div className="mx-6 mb-8">
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="glass-card border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors"
        >
          <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg font-medium mb-2">
            Drop your TSX/JSX files here or click to upload
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            Supports .tsx, .jsx, .ts, .js files (including BusinessSentryTracker.jsx)
          </p>
          <input
            type="file"
            multiple
            accept=".tsx,.jsx,.ts,.js"
            onChange={handleFileUpload}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="cursor-pointer bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 inline-block"
          >
            Choose Files
          </label>
        </div>

        {/* File Tabs */}
        {uploadedFiles.length > 0 && (
          <div className="mt-6 flex space-x-2 border-b border-border">
            {uploadedFiles.map((file) => (
              <button
                key={file.name}
                onClick={() => {
                  setActiveFile(file.name);
                  setCode(file.content);
                }}
                className={`px-4 py-2 rounded-t-lg ${
                  activeFile === file.name
                    ? 'bg-background border-t border-l border-r border-border text-primary'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {file.name}
              </button>
            ))}
          </div>
        )}

        {/* Editor Area */}
        <div className="mt-6">
          <div className="glass-card overflow-hidden">
            {viewMode === 'editor' && (
              <div className="p-4">
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full h-96 font-mono text-sm bg-background border border-border rounded p-4 resize-none"
                  placeholder="Paste your TSX/JSX code here..."
                />
              </div>
            )}

            {viewMode === 'preview' && (
              <div className="p-6">
                <div className="bg-background border border-border rounded-lg p-6 min-h-96">
                  <div className="text-center text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4" />
                    <p>Live preview will be implemented with Sandpack</p>
                    <p className="text-sm mt-2">Your code is ready to be rendered here</p>
                  </div>
                </div>
              </div>
            )}

            {viewMode === 'split' && (
              <div className="flex h-96">
                <div className="w-1/2 border-r border-border p-4">
                  <textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full h-full font-mono text-sm bg-background border border-border rounded p-4 resize-none"
                    placeholder="Paste your TSX/JSX code here..."
                  />
                </div>
                <div className="w-1/2 p-4">
                  <div className="bg-background border border-border rounded-lg p-6 h-full">
                    <div className="text-center text-muted-foreground">
                      <FileText className="h-12 w-12 mx-auto mb-4" />
                      <p>Live preview will be implemented with Sandpack</p>
                      <p className="text-sm mt-2">Your code is ready to be rendered here</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 glass-card p-6">
          <h3 className="text-lg font-semibold mb-2">How to use TSX Runner</h3>
          <ul className="text-sm space-y-1 text-muted-foreground">
            <li>• Upload your BusinessSentryTracker.jsx or any TSX/JSX file</li>
            <li>• Edit your code in the textarea with syntax highlighting (coming soon)</li>
            <li>• See live preview of your React components (coming soon)</li>
            <li>• Switch between editor-only, preview-only, or split view</li>
            <li>• Perfect for testing Claude-generated artifacts</li>
          </ul>
        </div>
      </div>
    </div>
  );
}