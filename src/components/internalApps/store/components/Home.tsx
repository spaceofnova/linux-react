import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";
import { AppType } from "@/types/storeTypes";

const getApps = async () => {
  const response = await fetch(
    "https://raw.githubusercontent.com/spaceofnova/linux-react-store/main/core.json"
  );
  const data = await response.json();
  return data;
};

export default function Home() {
  const navigate = useNavigate();
  const query = useQuery({ queryKey: ["appsList"], queryFn: getApps });
  return (
    <div className={"flex flex-col gap-2 w-full h-full"}>
      <h1 className={"text-2xl"}>App Store</h1>
      <div className={"flex flex-wrap gap-2 w-full h-full"}>
        {query.data?.map((app: AppType) => (
          <Button key={app.id} onClick={() => navigate(`/app/${app.id}`)}>
            <h1>
              {app.name} - {app.version}
            </h1>
          </Button>
        ))}
      </div>
    </div>
  );
}
