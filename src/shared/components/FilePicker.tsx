import { useWindowStore } from "shared/hooks/windowStore";
import { useEffect, useState } from "react";
import { Button } from "shared/components/ui/button";
import { FilesApp } from "apps/files";
import { WindowType } from "shared/types/storeTypes";

interface FilePickerOptions {
  accept?: string;
  multiple?: boolean;
}

export function showFilePicker(options: FilePickerOptions = {}): Promise<string> {
  return new Promise((resolve) => {
    const id = `file-picker-${Date.now()}`;
    const windowOptions: WindowType = {
      id,
      title: "Select File",
      ReactElement: FilesApp,
      pickerMode: true,
      fileTypes: options.accept?.split(",").map(type => type.replace("*", "").trim()),
      allowMultiple: options.multiple,
    };

    const unsubscribe = useWindowStore.subscribe((state) => {
      const window = state.windows.find(w => w.id === id);
      if (window?.selectedFile) {
        resolve(window.selectedFile);
        useWindowStore.getState().closeWindow(id);
        unsubscribe();
      }
    });

    useWindowStore.getState().createWindow(windowOptions);
  });
}

interface FilePickerProps {
  onSelect?: (path: string) => void;
  accept?: string;
  multiple?: boolean;
  asChild?: boolean;
  children?: React.ReactNode;
}

const FilePicker = ({ onSelect, accept, multiple = false, asChild = false, children }: FilePickerProps) => {
  const [pickerWindowId, setPickerWindowId] = useState<string | null>(null);
  const closeWindow = useWindowStore((state) => state.closeWindow);

  useEffect(() => {
    if (pickerWindowId) {
      // Set up a listener for file selection
      const unsubscribe = useWindowStore.subscribe((state) => {
        const window = state.windows.find(w => w.id === pickerWindowId);
        if (window?.selectedFile) {
          onSelect?.(window.selectedFile);
          closeWindow(pickerWindowId);
        }
      });

      return () => unsubscribe();
    }
  }, [pickerWindowId, onSelect, closeWindow]);

  const openPicker = () => {
    const id = `file-picker-${Date.now()}`;
    const windowOptions: WindowType = {
      id,
      title: "Select File",
      ReactElement: FilesApp,
      pickerMode: true,
      fileTypes: accept?.split(",").map(type => type.replace("*", "").trim()),
      allowMultiple: multiple,
    };
    useWindowStore.getState().createWindow(windowOptions);
    setPickerWindowId(id);
  };

  if (asChild && children) {
    return (
      <div onClick={openPicker}>
        {children}
      </div>
    );
  }

  return (
    <Button onClick={openPicker}>
      Select File
    </Button>
  );
};

export default FilePicker; 