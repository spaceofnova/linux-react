import { LocalAppInstall } from "@/components/AddApp";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppStore } from "@/stores/appstore";
import { useState } from "react";
import { useNavigate } from "react-router";

export default function Settings() {
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const launchApp = useAppStore((state) => state.launchApp);

  const handleClick = () => {
    launchApp(input);
  };

  const fetchTest = async () => {
    const response = await fetch(
      "http://localhost:5173/apps/api.test/assets/index-_xqS-YfD.js"
    );
    const data = await response.text();
    console.log(data);
  };
  return (
    <div>
      <Button onClick={() => navigate("/")}>Back</Button>
      <h1 className={"text-2xl"}>Settings</h1>
      <LocalAppInstall />
      <p>DEBUG AHEAD!!!</p>
      <div className="flex gap-4 w-full">
        <Input value={input} onChange={(e) => setInput(e.target.value)} />
        <Button onClick={fetchTest}>Launch</Button>
      </div>
    </div>
  );
}
