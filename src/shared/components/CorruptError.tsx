import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "shared/components/ui/card";
import { Button } from "shared/components/ui/button";
import fs from "@zenfs/core";
import { validateFileStructure } from "shared/utils/corruption";
import { useEffect, useState } from "react";

const CorruptError = () => {
  const [corruption, setCorruption] = useState(false);

  useEffect(() => {
    if (!fs) return console.log("fs not found");
    if (!validateFileStructure()) {
      setCorruption(true);
    }
    console.log(validateFileStructure());
  }, []);

  const fullReset = () => {
    try {
      fs.rmSync("/", { recursive: true });
    } catch (err) {
      console.log(err);
    }
    localStorage.clear();
    window.location.reload();
  };
  return corruption ? (
    <div className="flex items-center justify-center h-screen p-8">
      <Card className="h-3/4 w-1/2">
        <CardContent className="flex flex-col h-full">
          <CardHeader>
            <CardTitle className="text-center text-2xl font-bold">
              System Corruption Detected!
            </CardTitle>
          </CardHeader>
          <CardDescription>
            <p>
              The system has detected that the system is corrupted. Please
              reinstall the system.
            </p>
          </CardDescription>
          <Button>Ignore for now</Button>
          <Button onClick={fullReset}>Reinstall System</Button>
        </CardContent>
      </Card>
    </div>
  ) : null;
};

export default CorruptError;
