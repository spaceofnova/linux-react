import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "shared/components/ui/context-menu";
import { Button } from "shared/components/ui/button";
import { Input } from "shared/components/ui/input";
import fs from "@zenfs/core";
import { useCallback, useEffect, useState } from "react";
import {
  LucideFile,
  LucideFolder,
  ArrowLeft,
  LucideFileJson,
  LucideFileText,
  LucideUpload,
  LucideFileImage,
  Edit,
  Trash2,
  LucidePlay,
} from "lucide-react";
import { FileEditor } from "./FileEditor";
import { useWindowStore } from "shared/hooks/windowStore";
import { useProcessStore } from "shared/hooks/processStore";

interface FileInfo {
  name: string;
  created: string;
  modified: string;
  isDirectory: boolean;
}

const iconMap = {
  json: <LucideFileJson className="min-h-4 min-w-4 w-4 h-4" />,
  txt: <LucideFileText className="min-h-4 min-w-4 w-4 h-4" />,
  md: <LucideFileText className="min-h-4 min-w-4 w-4 h-4" />,
  js: <LucideFileJson className="min-h-4 min-w-4 w-4 h-4" />,
  png: <LucideFileImage className="min-h-4 min-w-4 w-4 h-4" />,
  jpg: <LucideFileImage className="min-h-4 min-w-4 w-4 h-4" />,
  jpeg: <LucideFileImage className="min-h-4 min-w-4 w-4 h-4" />,
};

const normalizePath = (path: string) => path.replace(/\/+/g, "/");

interface FileListItemProps {
  file: FileInfo;
  renamingFile: string | null;
  newName: string;
  setNewName: (name: string) => void;
  onRename: (oldName: string, newName: string) => void;
  onDelete: (name: string) => void;
  onDoubleClick: (file: FileInfo) => void;
  setRenamingFile: (name: string | null) => void;
  currentDirectory: string;
}

const FileListItem = ({
  file,
  renamingFile,
  newName,
  setNewName,
  onRename,
  onDelete,
  onDoubleClick,
  setRenamingFile,
  currentDirectory,
}: FileListItemProps) => {
  const startProcess = useProcessStore((state) => state.startProcess);
  const isJavaScript = file.name.endsWith(".js");

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div
          className="flex items-center justify-between p-1 px-2 hover:bg-accent transition-all duration-100 cursor-pointer"
          onDoubleClick={() => onDoubleClick(file)}
        >
          <div className="flex items-center gap-2 flex-1">
            {file.isDirectory ? (
              <LucideFolder className="min-h-4 min-w-4 w-4 h-4" />
            ) : (
              iconMap[file.name.split(".").pop() as keyof typeof iconMap] || (
                <LucideFile className="min-h-4 min-w-4 w-4 h-4" />
              )
            )}
            {renamingFile === file.name ? (
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    onRename(file.name, newName);
                  } else if (e.key === "Escape") {
                    setRenamingFile(null);
                  }
                }}
                onClick={(e) => e.stopPropagation()}
                autoFocus
                className="w-[200px]"
              />
            ) : (
              <div>
                <span>{file.name}</span>
                <span className="text-sm text-muted-foreground ml-2">
                  Created: {file.created} • Modified: {file.modified}
                </span>
              </div>
            )}
          </div>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        {isJavaScript && (
          <ContextMenuItem
            onClick={() => {
              const fullPath = normalizePath(
                `${currentDirectory}/${file.name}`,
              );
              startProcess(fullPath);
            }}
          >
            <LucidePlay className="h-4 w-4 mr-2" />
            Run
          </ContextMenuItem>
        )}
        <ContextMenuItem
          onClick={() => {
            setRenamingFile(file.name);
            setNewName(file.name);
          }}
        >
          <Edit className="h-4 w-4 mr-2" />
          Rename
        </ContextMenuItem>
        <ContextMenuItem onClick={() => onDelete(file.name)}>
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};

interface TempFileInputProps {
  tempFile: { type: "file" | "directory"; name: string };
  setTempFile: (
    file: { type: "file" | "directory"; name: string } | null,
  ) => void;
  onSubmit: (name: string) => void;
}

const TempFileInput = ({
  tempFile,
  setTempFile,
  onSubmit,
}: TempFileInputProps) => (
  <div className="flex items-center gap-2 p-2 rounded-lg bg-accent">
    {tempFile.type === "directory" ? (
      <LucideFolder className="h-4 w-4" />
    ) : (
      <LucideFile className="h-4 w-4" />
    )}
    <Input
      value={tempFile.name}
      onChange={(e) => setTempFile({ ...tempFile, name: e.target.value })}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          onSubmit(tempFile.name);
        } else if (e.key === "Escape") {
          setTempFile(null);
        }
      }}
      autoFocus
      onClick={(e) => e.stopPropagation()}
    />
  </div>
);

const FilesApp = () => {
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [currentDirectory, setCurrentDirectory] = useState("/");
  const [inputValue, setInputValue] = useState("/");
  const [renamingFile, setRenamingFile] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [tempFile, setTempFile] = useState<{
    type: "file" | "directory";
    name: string;
  } | null>(null);

  const windowId = useWindowStore((state) => state.activeWindowId);
  const window = useWindowStore((state) =>
    state.windows.find((w) => w.id === windowId),
  );
  const updateWindow = useWindowStore((state) => state.updateWindow);

  const listFiles = useCallback(
    (path: string) => {
      if (!fs) return;

      const normalizedPath = normalizePath(path);

      try {
        const fileList = fs.readdirSync(normalizedPath);
        const filesWithDates = fileList.map((fileName: string) => {
          const stats = fs.statSync(
            normalizePath(`${normalizedPath}/${fileName}`),
          );
          return {
            name: fileName,
            created: new Date(stats.birthtimeMs).toLocaleString(),
            modified: new Date(stats.mtimeMs).toLocaleString(),
            isDirectory: stats.isDirectory(),
          };
        });

        const sortedFiles = filesWithDates.sort((a, b) => {
          if (a.isDirectory !== b.isDirectory) {
            return a.isDirectory ? -1 : 1;
          }
          return a.name.localeCompare(b.name);
        });

        if (window?.pickerMode && window.fileTypes?.length) {
          const filteredFiles = sortedFiles.filter(
            (file) =>
              file.isDirectory ||
              window.fileTypes?.some((type) =>
                file.name.toLowerCase().endsWith(type.toLowerCase()),
              ),
          );
          setFiles(filteredFiles);
        } else {
          setFiles(sortedFiles);
        }

        setCurrentDirectory(normalizedPath);
        setInputValue(normalizedPath);
      } catch (error) {
        console.error("Error reading directory:", error);
      }
    },
    [window],
  );

  useEffect(() => {
    listFiles(inputValue);
  }, [inputValue, listFiles]);

  const deleteFile = useCallback(
    (fileName: string) => {
      if (!fs) return;
      const fullPath = normalizePath(`${currentDirectory}/${fileName}`);
      try {
        const stats = fs.statSync(fullPath);
        if (stats.isDirectory()) {
          fs.rmSync(fullPath, { recursive: true, force: true });
        } else {
          fs.unlinkSync(fullPath);
        }
        listFiles(currentDirectory);
      } catch (error) {
        console.error("Error deleting file:", error);
      }
    },
    [currentDirectory, listFiles],
  );

  const renameFile = useCallback(
    (oldName: string, newName: string) => {
      if (!fs || !newName) return;
      try {
        fs.renameSync(
          normalizePath(`${currentDirectory}/${oldName}`),
          normalizePath(`${currentDirectory}/${newName}`),
        );
        setRenamingFile(null);
        listFiles(currentDirectory);
      } catch (error) {
        console.error("Error renaming file:", error);
      }
    },
    [currentDirectory, listFiles],
  );

  const navigateToDirectory = useCallback(
    (dirName: string) => {
      const newPath = normalizePath(
        dirName === ".."
          ? currentDirectory.split("/").slice(0, -1).join("/") || "/"
          : `${currentDirectory}/${dirName}`,
      );

      try {
        fs.readdirSync(newPath);
        listFiles(newPath);
      } catch (error) {
        console.error("Not a directory or error navigating:", error);
      }
    },
    [currentDirectory, listFiles],
  );

  const handleItemClick = useCallback(
    (file: FileInfo) => {
      if (file.isDirectory) {
        navigateToDirectory(file.name);
      } else if (window?.pickerMode) {
        const fullPath = normalizePath(`${currentDirectory}/${file.name}`);
        if (windowId) {
          updateWindow(windowId, { selectedFile: fullPath });
        }
      } else {
        setSelectedFile(file.name);
      }
    },
    [
      navigateToDirectory,
      window?.pickerMode,
      currentDirectory,
      windowId,
      updateWindow,
    ],
  );

  const handleTempItemSubmit = useCallback(
    (name: string) => {
      if (!tempFile || !name.trim()) return;

      try {
        const fullPath = normalizePath(`${currentDirectory}/${name}`);
        if (tempFile.type === "file") {
          fs.writeFileSync(fullPath, "");
        } else {
          fs.mkdirSync(fullPath);
        }
        listFiles(currentDirectory);
      } catch (error) {
        console.error(`Error creating ${tempFile.type}:`, error);
      }
      setTempFile(null);
    },
    [currentDirectory, listFiles, tempFile],
  );

  const handleUploadFile = useCallback(async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "*";
    input.multiple = false;
    input.click();

    input.onchange = (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        if (!e.target?.result) return;

        const isTextFile =
          file.type.startsWith("text/") ||
          /\.(txt|json|md|js|ts|css|html)$/.test(file.name);

        if (isTextFile) {
          fs.writeFileSync(
            `${currentDirectory}/${file.name}`,
            e.target.result.toString(),
          );
        } else {
          const buffer = new Uint8Array(e.target.result as ArrayBuffer);
          fs.writeFileSync(`${currentDirectory}/${file.name}`, buffer);
        }

        listFiles(currentDirectory);
      };

      reader.readAsArrayBuffer(file);
    };
  }, [currentDirectory, listFiles]);

  const isRootDirectory = currentDirectory === "/";
  const isEmpty = files.length === 0;

  return (
    <div className="h-full w-full">
      <ContextMenu>
        <ContextMenuTrigger className="h-full w-full">
          <div className="p-2 h-full">
            <div className="flex items-center gap-2 mb-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigateToDirectory("..")}
                disabled={isRootDirectory}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="flex-1"
              />
            </div>

            <div className="grid gap-2">
              {isEmpty && (
                <div className="flex items-center justify-center h-full">
                  <span className="text-muted-foreground">
                    Directory is empty
                  </span>
                </div>
              )}

              {files.map((file) => (
                <FileListItem
                  key={file.name}
                  file={file}
                  renamingFile={renamingFile}
                  newName={newName}
                  setNewName={setNewName}
                  onRename={renameFile}
                  onDelete={deleteFile}
                  onDoubleClick={handleItemClick}
                  setRenamingFile={setRenamingFile}
                  currentDirectory={currentDirectory}
                />
              ))}

              {tempFile && (
                <TempFileInput
                  tempFile={tempFile}
                  setTempFile={setTempFile}
                  onSubmit={handleTempItemSubmit}
                />
              )}
            </div>

            {selectedFile && !window?.pickerMode && (
              <div className="mt-6">
                <FileEditor
                  currentPath={currentDirectory}
                  fileName={selectedFile}
                  onClose={() => setSelectedFile(null)}
                />
              </div>
            )}
          </div>
        </ContextMenuTrigger>

        {!window?.pickerMode && (
          <ContextMenuContent>
            <ContextMenuItem
              onClick={() => setTempFile({ type: "file", name: "New File" })}
            >
              <LucideFile className="h-4 w-4 mr-2" />
              New File
            </ContextMenuItem>
            <ContextMenuItem
              onClick={() =>
                setTempFile({ type: "directory", name: "New Folder" })
              }
            >
              <LucideFolder className="h-4 w-4 mr-2" />
              New Folder
            </ContextMenuItem>
            <ContextMenuItem onClick={handleUploadFile}>
              <LucideUpload className="h-4 w-4 mr-2" />
              Upload File Here
            </ContextMenuItem>
          </ContextMenuContent>
        )}
      </ContextMenu>
    </div>
  );
};

export { FilesApp };
