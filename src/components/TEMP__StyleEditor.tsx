import { readFile, writeFileSync } from "@zenfs/core";
import { useEffect, useState } from "react";

export default function TEMP__StyleEditor() {
  const [style, setStyle] = useState("");
  useEffect(() => {
    const loadStyleFromFile = async () => {
      readFile("/data/themes/default.css", "utf8", (err, data) => {
        if (err) {
          console.error(err);
          return;
        }
        setStyle(data);
      });
    };
    loadStyleFromFile();
  }, []);
  const saveStyleToFile = (e) => {
    e.preventDefault();
    if (!style || style.length === 0) {
      console.error("No content to save");
      return;
    }
    try {
      writeFileSync("/data/themes/default.css", style);
      reloadStyles();
    } catch (err) {
      console.error(err);
    }
  };

  // const runsetup = () => {
  //   monaco.editor.create(document.getElementById("editor"), {
  //     value: [style].join("\n"),
  //     language: "css",
  //     theme: "vs-dark",
  //   });
  // };
  // useEffect(() => {
  //   runsetup();
  // }, []);

  const reloadStyles = () => {
    const stylerheader = document.getElementById("styler-styles");
    if (stylerheader) {
      stylerheader.innerHTML = style;
    }
  };

  return (
    <div className="absolute top-0 right-0 h-full w-96 bg-gray-800 p-4 flex flex-col gap-4">
      <textarea
        id="styler"
        className="flex-grow rounded-md bg-gray-700 resize-none text-white p-2"
        defaultValue={style}
        onChange={(e) => setStyle(e.target.value)}
      />
      {/* <div id="editor" className=" max-h-full"></div> */}

      <button className="p-2 bg-blue-500 rounded-md" onClick={saveStyleToFile}>
        Save
      </button>
    </div>
  );
}
