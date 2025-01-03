import fs from "@zenfs/core";
import { useSearchParams } from "react-router";

const FileViewer = () => {
  const [searchParams] = useSearchParams();
  const f = searchParams.get("f");
  if (!f) {
    return <div>File not found</div>;
  }
  const file = fs.readFileSync(f, "utf-8");
  if (!file) {
    return <div>File not found</div>;
  }
  return <div>{file}</div>;
};

export default FileViewer;
