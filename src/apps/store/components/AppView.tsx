import { useNavigate, useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { App } from "./Home";
import { Button } from "shared/components/ui/button";
import { DownloadIcon } from "lucide-react";

export default function AppView() {
  const navigate = useNavigate();
  const apps = useQuery<App[]>({ queryKey: ["appsList"] });
  const { id } = useParams();
  const app = apps.data?.find((app: App) => app.id === id);
  if (!id || !app) {
    return <div>App not found</div>;
  }

  return (
    <div className={"flex flex-col gap-2 w-full h-full"}>
      <Button onClick={() => navigate("/")}>Back</Button>
      <div className={"flex justify-between items-center w-full"}>
        <div className={"flex flex-col gap-2"}>
          <h1 className={"text-2xl"}>{app.name}</h1>
          <p className={"text-sm"}>{app.description}</p>
        </div>
        <div className={"flex flex-col gap-2 items-center text-center"}>
          <Button>
            <DownloadIcon /> Install
          </Button>
          <p className={"text-sm"}>{app.version}</p>
        </div>
      </div>
    </div>
  );
}
