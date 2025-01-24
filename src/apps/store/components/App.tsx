import { Button } from "shared/components/ui/button";
import { useDownload } from "shared/utils/unix";
import { Progress } from "shared/components/ui/progress";
import { Loader2Icon } from "lucide-react";
import { UI_ASSETS_URL } from "shared/constants";

const App = () => {
  const { status, error, progress, startDownload } = useDownload();

  const downloadAssets = () => {
    startDownload({
      url: UI_ASSETS_URL,
      isZip: true,
      zipOptions: { outputDir: "system" },
    });
  };

  return (
    <div className={"flex flex-col w-full h-full p-4"}>
      <Button disabled={status === "inProgress"} onClick={downloadAssets}>
        Download System Icons
        {status === "inProgress" && <Loader2Icon className="animate-spin" />}
      </Button>
      {status === "inProgress" && (
        <>
          <Progress value={progress.percentage} />
          <p>Downloading: {progress.currentFile}</p>
          <p>Total Files: {progress.total}</p>
        </>
      )}
      {status === "finished" && <p>Finished!</p>}
      {error && <p>Error: {error}</p>}
    </div>
  );
};

export default App;
