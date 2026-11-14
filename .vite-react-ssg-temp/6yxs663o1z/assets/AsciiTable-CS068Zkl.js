import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { useState, useMemo } from "react";
import { T as ToolLayout } from "./ToolLayout-CZQXENmQ.js";
import { D as DataTable } from "./DataTable-CWspjU4O.js";
import { T as TextInputField } from "./TextInputField-ds4hNHlD.js";
import { m as matchesQuery } from "./text-BYmj3d4c.js";
import "./CopyButton-BRH0SK_m.js";
import "lucide-react";
import "../main.mjs";
import "vite-react-ssg";
import "react-router-dom";
import "lz-string";
const ASCII_ROWS = Array.from({ length: 128 }, (_, code) => {
  const controlNames = {
    0: "NUL",
    1: "SOH",
    2: "STX",
    3: "ETX",
    4: "EOT",
    5: "ENQ",
    6: "ACK",
    7: "BEL",
    8: "BS",
    9: "TAB",
    10: "LF",
    11: "VT",
    12: "FF",
    13: "CR",
    14: "SO",
    15: "SI",
    16: "DLE",
    17: "DC1",
    18: "DC2",
    19: "DC3",
    20: "DC4",
    21: "NAK",
    22: "SYN",
    23: "ETB",
    24: "CAN",
    25: "EM",
    26: "SUB",
    27: "ESC",
    28: "FS",
    29: "GS",
    30: "RS",
    31: "US",
    127: "DEL"
  };
  if (controlNames[code]) {
    return { code, char: "·", label: controlNames[code] };
  }
  if (code === 32) {
    return { code, char: "␠", label: "SPACE" };
  }
  return { code, char: String.fromCharCode(code), label: String.fromCharCode(code) };
});
function AsciiTable() {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return ASCII_ROWS;
    return ASCII_ROWS.filter((row) => {
      const hex = row.code.toString(16).padStart(2, "0");
      const binary = row.code.toString(2).padStart(8, "0");
      return matchesQuery(normalized, [row.label, row.char, row.code, binary]) || hex.includes(normalized.replace(/^0x/, ""));
    });
  }, [query]);
  return /* @__PURE__ */ jsx(
    ToolLayout,
    {
      title: "ASCII Table",
      description: "Browse ASCII character codes in decimal, hex, and binary with quick search and copy actions",
      tag: "data",
      children: /* @__PURE__ */ jsxs("div", { className: "space-y-5", children: [
        /* @__PURE__ */ jsx(
          TextInputField,
          {
            label: "Search by character, label, decimal, hex, or binary",
            value: query,
            onChange: setQuery,
            placeholder: "Examples: A, space, 65, 0x41, 01000001"
          }
        ),
        /* @__PURE__ */ jsx(
          DataTable,
          {
            gridClass: "grid-cols-[70px_70px_100px_120px_1fr_auto]",
            columns: [
              { label: "Dec" },
              { label: "Hex" },
              { label: "Binary" },
              { label: "Char" },
              { label: "Label" },
              { label: "Copy", align: "right" }
            ],
            rows: filtered,
            rowKey: (row) => String(row.code),
            copyText: (row) => String(row.code),
            emptyMessage: "No matching ASCII characters found.",
            align: "center",
            bodyClass: "max-h-[540px] overflow-auto divide-y divide-border",
            renderRow: (row) => /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx("span", { className: "text-sm font-mono text-bright", children: row.code }),
              /* @__PURE__ */ jsxs("span", { className: "text-xs font-mono text-dim", children: [
                "0x",
                row.code.toString(16).padStart(2, "0").toUpperCase()
              ] }),
              /* @__PURE__ */ jsx("span", { className: "text-xs font-mono text-subtle", children: row.code.toString(2).padStart(8, "0") }),
              /* @__PURE__ */ jsx("span", { className: "text-lg font-mono text-bright", children: row.char }),
              /* @__PURE__ */ jsx("span", { className: "text-sm font-sans text-dim", children: row.label })
            ] })
          }
        )
      ] })
    }
  );
}
export {
  AsciiTable as default
};
