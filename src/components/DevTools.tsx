import { usePrefrencesStore } from "@/stores/prefrencesStore";
import { View } from "@/components/ui/View";
import { useState } from "react";
import { Button } from "./ui/button";
import { BugIcon, XIcon } from "lucide-react";
import { Switch } from "./ui/switch";
import FPSGraph from "./FPSGraph";
import { Textarea } from "./ui/textarea";
import { useLogStore } from "@/stores/logstore";

export default function DevTools() {
  const developerTools = usePrefrencesStore(
    (state) => state.prefrences.developer.developerTools
  );
  const logs = useLogStore((state) => state.logs);
  const [isOpen, setIsOpen] = useState(true);
  const [showFpsGraph, setShowFpsGraph] = useState(false);
  if (!developerTools) return null;
  return (
    <>
      {showFpsGraph && <FPSGraph />}
      {isOpen ? (
        <View
          className={
            "flex flex-col gap-2 p-2 fixed right-2 top-2 w-64 h-[calc(100vh-1rem)] animate-in slide-in-from-right-96"
          }
        >
          <div className={"flex items-center justify-between gap-2 p-2"}>
            <p>DevTools</p>
            <Button
              onClick={() => setIsOpen(false)}
              size={"icon"}
              variant={"ghost"}
            >
              <XIcon />
            </Button>
          </div>
          <div className={"flex flex-col gap-2 p-2"}>
            <label htmlFor="showFpsGraph" className={"flex items-center gap-2"}>
              <Switch
                id="showFpsGraph"
                checked={showFpsGraph}
                onCheckedChange={setShowFpsGraph}
              />
              Show FPS Graph
            </label>
          </div>
          <Textarea
            placeholder="Logs"
            className={"h-full"}
            value={logs}
            readOnly
          />
        </View>
      ) : (
        <View
          className={"fixed right-2 top-2 aspect-square w-12 h-12"}
          onClick={() => setIsOpen(true)}
        >
          <BugIcon className={"w-full h-full p-3"} />
        </View>
      )}
    </>
  );
}
