import { LocalAppInstall } from "shared/components/AddApp";
import { Button } from "shared/components/ui/button";
import { Input } from "shared/components/ui/input";
import { useAppStore } from "shared/hooks/appstore";
import { useState } from "react";
import { useNavigate } from "react-router";

export default function Settings() {
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const launchApp = useAppStore((state) => state.launchApp);

  const handleClick = () => {
    launchApp(input);
  };

  return (
    <div>
      <Button onClick={() => navigate("/")}>Back</Button>
      <h1 className={"text-2xl"}>Settings</h1>
      <LocalAppInstall />
      <p>DEBUG AHEAD!!!</p>
      <div className="flex gap-4 w-full">
        <Input value={input} onChange={(e) => setInput(e.target.value)} />
        <Button onClick={handleClick}>Launch</Button>
      </div>
    </div>
  );
}
