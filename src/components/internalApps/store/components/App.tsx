import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { Outlet, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { useDownload } from "@/functions/unix";
import { Progress } from "@/components/ui/progress";
import { Loader2Icon } from "lucide-react";
import { ASSETS_DOWNLOAD_URL } from "@/lib/constants";

const App = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState<string>("");
  const queryClient = useQueryClient();
  const { status, error, progress, startDownload } = useDownload();

  

  useEffect(() => {
    if (search.length > 0) {
      navigate(`/s/${search}`);
    } else {
      navigate("/");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  return (
    <div className={"flex flex-col w-full h-full p-4"}>
      {/* <div className={"flex items-center justify-between gap-2 w-full h-8"}> */}
      {/* <Button
          size={"icon"}
          variant={"secondary"}
          onClick={() =>
            queryClient.invalidateQueries({ queryKey: ["appsList"] })
          }
        >
          <RefreshCwIcon />
        </Button>
        <Input
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
        />
        <Button variant={"secondary"} onClick={() => navigate("/settings")}>
          Settings
        </Button>
      </div>
      <div className={"flex flex-col gap-2 w-full h-full"}>
        <Outlet />
      </div> */}
      <Button
        disabled={status === "inProgress"}
        onClick={() => startDownload(ASSETS_DOWNLOAD_URL)}
      >
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
