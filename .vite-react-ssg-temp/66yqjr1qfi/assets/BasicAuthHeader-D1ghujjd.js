import { jsx, jsxs } from "react/jsx-runtime";
import { useState, useMemo } from "react";
import { T as ToolLayout } from "./ToolLayout-CZQXENmQ.js";
import { F as FieldCard } from "./FieldCard-CLpLrKQd.js";
import { T as TextAreaField } from "./TextAreaField-MMKDS5d8.js";
import { T as TextInputField } from "./TextInputField-ds4hNHlD.js";
import "./CopyButton-BRH0SK_m.js";
import "lucide-react";
import "../main.mjs";
import "vite-react-ssg";
import "react-router-dom";
import "lz-string";
function encodeBasicAuth(username, password) {
  return btoa(`${username}:${password}`);
}
function decodeBasicAuth(header) {
  const raw = header.trim().replace(/^Basic\s+/i, "");
  if (!raw) return null;
  try {
    const decoded = atob(raw);
    const separator = decoded.indexOf(":");
    if (separator === -1) {
      return { username: decoded, password: "" };
    }
    return {
      username: decoded.slice(0, separator),
      password: decoded.slice(separator + 1)
    };
  } catch {
    return null;
  }
}
function BasicAuthHeader() {
  const [username, setUsername] = useState("service-account");
  const [password, setPassword] = useState("s3cret-token");
  const [headerInput, setHeaderInput] = useState("Basic c2VydmljZS1hY2NvdW50OnMzY3JldC10b2tlbg==");
  const encoded = useMemo(() => encodeBasicAuth(username, password), [username, password]);
  const authorizationHeader = `Basic ${encoded}`;
  const decoded = useMemo(() => decodeBasicAuth(headerInput), [headerInput]);
  return /* @__PURE__ */ jsx(
    ToolLayout,
    {
      title: "Basic Auth Header",
      description: "Generate and decode HTTP Basic Authorization headers entirely in your browser",
      tag: "auth",
      children: /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsx(TextInputField, { label: "Username", value: username, onChange: setUsername }),
            /* @__PURE__ */ jsx(TextInputField, { label: "Password", value: password, onChange: setPassword }),
            /* @__PURE__ */ jsx(FieldCard, { label: "Authorization header", value: authorizationHeader, copyable: true })
          ] }),
          /* @__PURE__ */ jsx(
            TextAreaField,
            {
              label: "Decode existing header",
              value: headerInput,
              onChange: setHeaderInput,
              className: "input-base min-h-[180px] w-full"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsx(FieldCard, { label: "Decoded username", value: (decoded == null ? void 0 : decoded.username) || "—", emphasis: "dim", copyable: Boolean(decoded == null ? void 0 : decoded.username) }),
          /* @__PURE__ */ jsx(FieldCard, { label: "Decoded password", value: (decoded == null ? void 0 : decoded.password) || "—", emphasis: "dim", copyable: Boolean(decoded == null ? void 0 : decoded.password) })
        ] })
      ] })
    }
  );
}
export {
  BasicAuthHeader as default
};
