import { jsx, jsxs } from "react/jsx-runtime";
import { useState, useRef } from "react";
import { T as ToolLayout } from "./ToolLayout-CZQXENmQ.js";
import { O as OutputPanel } from "./OutputPanel-_jsXcgH_.js";
import { T as TextAreaField } from "./TextAreaField-MMKDS5d8.js";
import { T as ToggleGroup } from "./ToggleGroup-C-Nc8HT0.js";
import { e as encodeBase64, d as decodeBase64 } from "../main.mjs";
import { Upload, ArrowLeftRight } from "lucide-react";
import "react-router-dom";
import "./CopyButton-BRH0SK_m.js";
import "vite-react-ssg";
import "lz-string";
const MODES = [
  { value: "encode", label: "Encode" },
  { value: "decode", label: "Decode" }
];
function Base64Tool() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [mode, setMode] = useState("encode");
  const [urlSafe, setUrlSafe] = useState(false);
  const [dataUriMode, setDataUriMode] = useState(false);
  const fileInputRef = useRef(null);
  const processConversion = (text, currentMode, isUrlSafe, isDataUri) => {
    if (!text) return "";
    if (currentMode === "encode") {
      let encoded = encodeBase64(text);
      if (isUrlSafe) {
        encoded = encoded.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
      }
      if (isDataUri && !encoded.startsWith("data:")) {
        encoded = `data:text/plain;base64,${encoded}`;
      }
      return encoded;
    } else {
      let cleanInput = text.trim();
      if (cleanInput.startsWith("data:")) {
        const parts = cleanInput.split(",");
        if (parts.length > 1) cleanInput = parts[1];
      }
      if (isUrlSafe) {
        cleanInput = cleanInput.replace(/-/g, "+").replace(/_/g, "/");
        while (cleanInput.length % 4) {
          cleanInput += "=";
        }
      }
      return decodeBase64(cleanInput);
    }
  };
  const handleInput = (val, m = mode, isUrl = urlSafe, isUri = dataUriMode) => {
    setInput(val);
    setError("");
    if (!val) {
      setOutput("");
      return;
    }
    try {
      setOutput(processConversion(val, m, isUrl, isUri));
    } catch {
      setError(m === "encode" ? "Encoding failed" : "Invalid Base64 payload");
      setOutput("");
    }
  };
  const handleModeChange = (m) => {
    setMode(m);
    handleInput(input, m, urlSafe, dataUriMode);
  };
  const handleUrlSafeToggle = (checked) => {
    setUrlSafe(checked);
    handleInput(input, mode, checked, dataUriMode);
  };
  const handleDataUriToggle = (checked) => {
    setDataUriMode(checked);
    handleInput(input, mode, urlSafe, checked);
  };
  const handleFileUpload = (e) => {
    var _a;
    const file = (_a = e.target.files) == null ? void 0 : _a[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      var _a2;
      const result = (_a2 = event.target) == null ? void 0 : _a2.result;
      if (result) {
        if (mode === "encode") {
          setInput(`[Binary File: ${file.name}]`);
          setOutput(result);
        } else {
          setInput(result);
          handleInput(result, "decode", urlSafe, dataUriMode);
        }
      }
    };
    if (mode === "encode") {
      reader.readAsDataURL(file);
    } else {
      reader.readAsText(file);
    }
    e.target.value = "";
  };
  const swap = () => {
    if (!output) return;
    const newMode = mode === "encode" ? "decode" : "encode";
    setInput(output);
    setMode(newMode);
    handleInput(output, newMode, urlSafe, dataUriMode);
  };
  const clear = () => {
    setInput("");
    setOutput("");
    setError("");
  };
  return /* @__PURE__ */ jsx(
    ToolLayout,
    {
      title: "Base64 Encoder / Decoder",
      description: "Safely encode text or binary files to Base64, or decode Base64 back to original text with 100% browser privacy.",
      tag: "encode",
      children: /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3 p-3 bg-surface border border-border rounded-xl shadow-xs", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
            /* @__PURE__ */ jsx(ToggleGroup, { options: MODES, value: mode, onChange: handleModeChange }),
            /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-1.5 text-xs font-mono text-dim hover:text-bright cursor-pointer px-2 py-1 rounded bg-muted/40", children: [
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "checkbox",
                  checked: urlSafe,
                  onChange: (e) => handleUrlSafeToggle(e.target.checked),
                  className: "rounded border-border accent-indigo-500"
                }
              ),
              "URL-Safe Base64"
            ] }),
            mode === "encode" && /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-1.5 text-xs font-mono text-dim hover:text-bright cursor-pointer px-2 py-1 rounded bg-muted/40", children: [
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "checkbox",
                  checked: dataUriMode,
                  onChange: (e) => handleDataUriToggle(e.target.checked),
                  className: "rounded border-border accent-indigo-500"
                }
              ),
              "Data URI Format"
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "file",
                ref: fileInputRef,
                onChange: handleFileUpload,
                className: "hidden"
              }
            ),
            /* @__PURE__ */ jsxs(
              "button",
              {
                type: "button",
                onClick: () => {
                  var _a;
                  return (_a = fileInputRef.current) == null ? void 0 : _a.click();
                },
                className: "btn-ghost text-xs flex items-center gap-1",
                title: "Upload file to convert to Base64",
                children: [
                  /* @__PURE__ */ jsx(Upload, { size: 13 }),
                  "Upload File"
                ]
              }
            ),
            output && /* @__PURE__ */ jsxs(
              "button",
              {
                type: "button",
                onClick: swap,
                className: "btn-ghost text-xs flex items-center gap-1",
                title: "Swap input and output",
                children: [
                  /* @__PURE__ */ jsx(ArrowLeftRight, { size: 13 }),
                  "Swap"
                ]
              }
            ),
            /* @__PURE__ */ jsx("button", { type: "button", onClick: clear, className: "btn-ghost text-xs", children: "Clear" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsx(
            TextAreaField,
            {
              label: mode === "encode" ? "Plain Text or File Content" : "Base64 Encoded Input",
              value: input,
              onChange: (val) => handleInput(val, mode, urlSafe, dataUriMode),
              placeholder: mode === "encode" ? "Type or paste text to encode..." : "Paste Base64 payload (e.g. SGVsbG8sIFdvcmxkIQ==)...",
              className: "textarea-base h-40"
            }
          ),
          /* @__PURE__ */ jsx(
            OutputPanel,
            {
              label: mode === "encode" ? "Base64 Result" : "Decoded Text Result",
              value: output,
              error,
              heightClass: "min-h-[200px]"
            }
          )
        ] })
      ] })
    }
  );
}
export {
  Base64Tool as default
};
