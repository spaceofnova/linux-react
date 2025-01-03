import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import fs from "@zenfs/core";
import Editor from "@monaco-editor/react";

interface FileEditorProps {
  currentPath: string;
  fileName: string;
  onClose: () => void;
}

const langmap = {
  js: "javascript",
  ts: "typescript",
  py: "python",
  html: "html",
  css: "css",
  json: "json",
};

const FileEditor = ({ currentPath, fileName, onClose }: FileEditorProps) => {
  const [content, setContent] = useState("");

  useEffect(() => {
    try {
      const fileContent = fs.readFileSync(
        `${currentPath}/${fileName}`,
        "utf-8"
      );
      setContent(fileContent);
    } catch (error) {
      console.error("Error reading file:", error);
    }
  }, [currentPath, fileName]);

  const handleSave = () => {
    try {
      fs.writeFileSync(`${currentPath}/${fileName}`, content);
    } catch (error) {
      console.error("Error saving file:", error);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl min-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Editing: {fileName}</DialogTitle>
          <DialogDescription>
            {fileName.split(".")[1] as keyof typeof langmap}
          </DialogDescription>
        </DialogHeader>
        <Editor
          value={content}
          onChange={(value) => setContent(value || "")}
          language={langmap[fileName.split(".")[1] as keyof typeof langmap]}
          theme="vs-dark"
          className="h-full w-full"
        />
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export { FileEditor };
