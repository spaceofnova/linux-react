import { Button } from "@/components/ui/button";
import { useAppStore } from "@/stores/appstore";

export default function Apps() {
  const apps = useAppStore((state) => state.apps);
  const launchApp = useAppStore((state) => state.launchApp);
  const removeApp = useAppStore((state) => state.removeApp);
  return (
    <div>
      <h1>Apps</h1>
      {apps.map((app) => (
        <div key={app.id}>
          <h2>{app.name}</h2>
          <p>{app.description}</p>
          <Button onClick={() => launchApp(app.id)}>Launch</Button>
          <Button onClick={() => removeApp(app.id)}>Delete</Button>
        </div>
      ))}
    </div>
  );
}
