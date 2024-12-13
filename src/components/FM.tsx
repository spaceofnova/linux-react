import React, { useEffect, useState } from "react";
import fs from "@zenfs/core";
import FileEditor from "./FE";
import { ArrowLeft, Folder, File, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const FileManager = () => {
  const [currentPath, setCurrentPath] = useState("/");
  const [files, setFiles] = useState<string[]>([]);
  const [newFileName, setNewFileName] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState<string>("/data");

  useEffect(() => {
    listFiles(urlInput);
  }, [urlInput]);

  const listFiles = (path: string) => {
    if (!fs) return;

    try {
      const fileList = fs.readdirSync(path);
      setFiles(fileList);
      setCurrentPath(path);
      setUrlInput(path);
    } catch (error) {
      console.error("Error reading directory:", error);
    }
  };

  const createFile = () => {
    if (!fs || !newFileName) return;

    const fullPath = `${currentPath}/${newFileName}`;
    try {
      fs.writeFileSync(fullPath, "");
      listFiles(currentPath);
      setNewFileName("");
    } catch (error) {
      console.error("Error creating file:", error);
    }
  };

  const deleteFile = (fileName: string) => {
    if (!fs) return;

    const fullPath = `${currentPath}/${fileName}`;
    try {
      fs.unlinkSync(fullPath);
      listFiles(currentPath);
    } catch (error) {
      console.error("Error deleting file:", error);
    }
  };

  const openFileEditor = (fileName: string) => {
    try {
      const fullPath = `${currentPath}/${fileName}`;
      if (fs.statSync(fullPath).isFile()) {
        setSelectedFile(fileName);
      }
    } catch (error) {
      console.error("Error opening file:", error);
    }
  };

  const navigateToDirectory = (dirName: string) => {
    const newPath = `${currentPath}/${dirName}`;
    try {
      fs.readdirSync(newPath);
      listFiles(newPath);
    } catch (error) {
      console.error("Not a directory or error navigating:", error);
    }
  };

  const goBack = () => {
    if (currentPath === "/") return;

    const parentPath = currentPath.split("/").slice(0, -1).join("/") || "/";
    listFiles(parentPath);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>File Manager</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2 mb-4">
          <Button variant="outline" size="icon" onClick={goBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Input
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="Path"
          />
        </div>

        <div className="flex items-center space-x-2 mb-4">
          <Input
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            placeholder="New file name"
          />
          <Button onClick={createFile} variant="default">
            Create File
          </Button>
        </div>

        <div className="space-y-2">
          {files.map((file) => {
            const isDirectory = fs
              .statSync(`${currentPath}/${file}`)
              .isDirectory();
            return (
              <Button
                key={file}
                className="flex items-center justify-between p-2 rounded-md border hover:bg-accent w-full"
                variant={"outline"}
                onClick={() => {
                  try {
                    if (isDirectory) {
                      navigateToDirectory(file);
                    } else {
                      openFileEditor(file);
                    }
                  } catch (error) {
                    console.error("Error checking file type:", error);
                  }
                }}
              >
                <div className="inline-flex items-center space-x-2 flex-grow text-left">
                  {isDirectory ? (
                    <Folder className="h-4 w-4" />
                  ) : (
                    <File className="h-4 w-4" />
                  )}
                  <span>{file}</span>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteFile(file)}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </Button>
            );
          })}
        </div>

        {selectedFile && (
          <FileEditor
            fs={fs}
            currentPath={currentPath}
            fileName={selectedFile}
            onClose={() => setSelectedFile(null)}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default FileManager;
