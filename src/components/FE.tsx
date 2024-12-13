import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Editor from "@monaco-editor/react";
import fs from "@zenfs/core";
import { useHotkeys } from "react-hotkeys-hook";

interface FileEditorProps {
  fs: typeof fs;
  currentPath: string;
  fileName: string;
  onClose: () => void;
}

const codemap = [
  { ext: ".js", lang: "javascript" },
  { ext: ".ts", lang: "typescript" },
  { ext: ".jsx", lang: "javascript" },
  { ext: ".tsx", lang: "typescript" },
  { ext: ".json", lang: "json" },
  { ext: ".css", lang: "css" },
];

const FileEditor: React.FC<FileEditorProps> = ({
  fs,
  currentPath,
  fileName,
  onClose,
}) => {
  const [fileContent, setFileContent] = useState("");
  const [isModified, setIsModified] = useState(false);

  useEffect(() => {
    if (!fs || !fileName) return;

    try {
      const fullPath = `${currentPath}/${fileName}`;
      const content = fs.readFileSync(fullPath, "utf-8");
      setFileContent(content);
      setIsModified(false);
    } catch (error) {
      console.error("Error reading file:", error);
    }
  }, [fs, currentPath, fileName]);

  const saveFile = () => {
    if (!fs || !fileName) return;

    try {
      const fullPath = `${currentPath}/${fileName}`;
      fs.writeFileSync(fullPath, fileContent);
      setIsModified(false);
    } catch (error) {
      console.error("Error saving file:", error);
    }
  };

  const handleContentChange = (value?: string) => {
    if (!value) return;
    setFileContent(value);
    setIsModified(true);
  };

  useHotkeys("ctrl+s, command+s", () => {
    saveFile();
  });

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="min-w-[80vw] min-h-[80vh] p-3">
        <DialogHeader>
          <DialogTitle className="inline-flex items-center gap-2">
            {isModified && (
              <span className="w-2 aspect-square bg-foreground rounded-full" />
            )}
            Editing: {fileName}
            <Button
              onClick={saveFile}
              disabled={!isModified}
              variant={isModified ? "default" : "secondary"}
            >
              Save
            </Button>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Editor
            language={codemap.find((c) => fileName.endsWith(c.ext))?.lang || ""}
            theme="vs-dark"
            value={fileContent}
            className="max-h-[80vh] min-h-[400px] font-mono"
            onChange={handleContentChange}
          />
          {/* <div className="flex justify-end space-x-2">
            
          </div> */}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FileEditor;
