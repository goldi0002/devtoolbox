import { jsxs, jsx } from "react/jsx-runtime";
import { useState, useMemo } from "react";
import { C as CopyButton } from "./CopyButton-BRH0SK_m.js";
import { Cpu } from "lucide-react";
import "../main.mjs";
import "vite-react-ssg";
import "react-router-dom";
import "lz-string";
function formatBinary(bin, groupSize = 4) {
  if (!bin) return "";
  const clean = bin.replace(/\s+/g, "");
  const remainder = clean.length % groupSize;
  const padded = remainder === 0 ? clean : "0".repeat(groupSize - remainder) + clean;
  const groups = [];
  for (let i = 0; i < padded.length; i += groupSize) {
    groups.push(padded.slice(i, i + groupSize));
  }
  return groups.join(" ");
}
function convertNumberBase(inputValue, fromBase, customTargetBase = 36) {
  const clean = inputValue.trim();
  if (!clean) {
    return {
      decimal: "",
      binary: "",
      binaryFormatted: "",
      hex: "",
      octal: "",
      customBase: "",
      customBaseValue: customTargetBase,
      ascii: "",
      bitsRequired: 0,
      twoComplement8: "",
      twoComplement16: "",
      twoComplement32: ""
    };
  }
  let bigVal;
  try {
    if (fromBase === 10) {
      bigVal = BigInt(clean);
    } else if (fromBase === 16) {
      const hexClean = clean.startsWith("0x") || clean.startsWith("0X") || clean.startsWith("#") ? clean.replace(/^(0x|0X|#)/, "") : clean;
      bigVal = BigInt(`0x${hexClean}`);
    } else if (fromBase === 2) {
      const binClean = clean.replace(/\s+/g, "");
      bigVal = BigInt(`0b${binClean}`);
    } else if (fromBase === 8) {
      bigVal = BigInt(`0o${clean}`);
    } else {
      const chars = "0123456789abcdefghijklmnopqrstuvwxyz";
      let acc = 0n;
      const lower = clean.toLowerCase();
      for (const char of lower) {
        const digit = chars.indexOf(char);
        if (digit === -1 || digit >= fromBase) {
          throw new Error(`Invalid digit '${char}' for base ${fromBase}`);
        }
        acc = acc * BigInt(fromBase) + BigInt(digit);
      }
      bigVal = acc;
    }
  } catch (err) {
    throw new Error((err == null ? void 0 : err.message) || `Invalid number for base ${fromBase}`);
  }
  const isNegative = bigVal < 0n;
  const absBigVal = isNegative ? -bigVal : bigVal;
  const decStr = bigVal.toString(10);
  const binStr = (isNegative ? "-" : "") + absBigVal.toString(2);
  const hexStr = (isNegative ? "-" : "") + absBigVal.toString(16).toUpperCase();
  const octStr = (isNegative ? "-" : "") + absBigVal.toString(8);
  let customStr = "";
  if (customTargetBase >= 2 && customTargetBase <= 36) {
    customStr = (isNegative ? "-" : "") + absBigVal.toString(customTargetBase).toUpperCase();
  }
  let asciiChar = "";
  if (bigVal >= 32n && bigVal <= 126n) {
    asciiChar = String.fromCharCode(Number(bigVal));
  }
  const bitLength = absBigVal === 0n ? 1 : absBigVal.toString(2).length;
  Number(BigInt.asIntN(32, bigVal));
  const tc8 = Number(BigInt.asUintN(8, bigVal)).toString(2).padStart(8, "0");
  const tc16 = Number(BigInt.asUintN(16, bigVal)).toString(2).padStart(16, "0");
  const tc32 = Number(BigInt.asUintN(32, bigVal)).toString(2).padStart(32, "0");
  return {
    decimal: decStr,
    binary: binStr,
    binaryFormatted: formatBinary(binStr.replace("-", "")),
    hex: hexStr,
    octal: octStr,
    customBase: customStr,
    customBaseValue: customTargetBase,
    ascii: asciiChar ? `'${asciiChar}'` : "N/A",
    bitsRequired: bitLength,
    twoComplement8: formatBinary(tc8, 4),
    twoComplement16: formatBinary(tc16, 4),
    twoComplement32: formatBinary(tc32, 4)
  };
}
function BaseConverter() {
  const [val, setVal] = useState("255");
  const [sourceBase, setSourceBase] = useState(10);
  const [customBase, setCustomBase] = useState(36);
  const { result, error } = useMemo(() => {
    try {
      if (!val.trim()) return { result: null, error: null };
      const res = convertNumberBase(val, sourceBase, customBase);
      return { result: res, error: null };
    } catch (err) {
      return { result: null, error: (err == null ? void 0 : err.message) || "Invalid number format" };
    }
  }, [val, sourceBase, customBase]);
  const setFrom = (newVal, base) => {
    setVal(newVal);
    setSourceBase(base);
  };
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "card p-6 bg-surface border border-border rounded-xl space-y-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row gap-4 items-stretch sm:items-end", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "base-input", className: "block text-xs font-mono text-subtle mb-2 font-medium", children: "Input Value" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              id: "base-input",
              type: "text",
              value: val,
              onChange: (e) => setVal(e.target.value),
              placeholder: "e.g. 255, 0xFF, 11111111",
              className: "w-full px-4 py-3 bg-muted/40 border border-border rounded-lg font-mono text-sm text-bright focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "w-full sm:w-48", children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "source-base", className: "block text-xs font-mono text-subtle mb-2 font-medium", children: "Source Base" }),
          /* @__PURE__ */ jsxs(
            "select",
            {
              id: "source-base",
              value: sourceBase,
              onChange: (e) => setSourceBase(Number(e.target.value)),
              className: "w-full px-3 py-3 bg-muted/40 border border-border rounded-lg font-mono text-xs text-bright focus:outline-none focus:border-indigo-500",
              children: [
                /* @__PURE__ */ jsx("option", { value: 10, children: "Decimal (Base 10)" }),
                /* @__PURE__ */ jsx("option", { value: 16, children: "Hexadecimal (Base 16)" }),
                /* @__PURE__ */ jsx("option", { value: 2, children: "Binary (Base 2)" }),
                /* @__PURE__ */ jsx("option", { value: 8, children: "Octal (Base 8)" })
              ]
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-2 pt-2 border-t border-border/50", children: [
        /* @__PURE__ */ jsx("span", { className: "text-[11px] font-mono text-muted", children: "Presets:" }),
        [
          { label: "255 (0xFF)", val: "255", base: 10 },
          { label: "1024 (0x400)", val: "1024", base: 10 },
          { label: "65535 (16-bit max)", val: "65535", base: 10 },
          { label: "0xDEADBEEF", val: "DEADBEEF", base: 16 },
          { label: "0b10101010", val: "10101010", base: 2 }
        ].map((p) => /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: () => setFrom(p.val, p.base),
            className: "px-2.5 py-1 text-xs font-mono rounded-md bg-muted/30 text-dim border border-border/60 hover:bg-muted/60 hover:text-bright transition-colors",
            children: p.label
          },
          p.label
        ))
      ] })
    ] }),
    error && /* @__PURE__ */ jsxs("div", { className: "p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-mono", children: [
      "⚠ ",
      error
    ] }),
    result && /* @__PURE__ */ jsxs("div", { className: "space-y-4 animate-fade-in", children: [
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "card p-4 bg-surface border border-border rounded-xl flex items-center justify-between", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("span", { className: "text-[10px] font-mono text-subtle uppercase block mb-1", children: "Decimal (Base 10)" }),
            /* @__PURE__ */ jsx("span", { className: "text-base font-mono font-bold text-bright select-all", children: result.decimal || "0" })
          ] }),
          /* @__PURE__ */ jsx(CopyButton, { text: result.decimal })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "card p-4 bg-surface border border-border rounded-xl flex items-center justify-between", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("span", { className: "text-[10px] font-mono text-subtle uppercase block mb-1", children: "Hexadecimal (Base 16)" }),
            /* @__PURE__ */ jsxs("span", { className: "text-base font-mono font-bold text-indigo-400 select-all", children: [
              "0x",
              result.hex || "0"
            ] })
          ] }),
          /* @__PURE__ */ jsx(CopyButton, { text: `0x${result.hex}` })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "card p-4 bg-surface border border-border rounded-xl flex items-center justify-between col-span-1 md:col-span-2", children: [
          /* @__PURE__ */ jsxs("div", { className: "overflow-x-auto pr-2", children: [
            /* @__PURE__ */ jsx("span", { className: "text-[10px] font-mono text-subtle uppercase block mb-1", children: "Binary (Base 2 - 4-bit nibbles)" }),
            /* @__PURE__ */ jsx("span", { className: "text-sm font-mono font-bold text-emerald-400 tracking-wider select-all", children: result.binaryFormatted || "0" })
          ] }),
          /* @__PURE__ */ jsx(CopyButton, { text: result.binary })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "card p-4 bg-surface border border-border rounded-xl flex items-center justify-between", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("span", { className: "text-[10px] font-mono text-subtle uppercase block mb-1", children: "Octal (Base 8)" }),
            /* @__PURE__ */ jsxs("span", { className: "text-base font-mono font-bold text-amber-400 select-all", children: [
              "0o",
              result.octal || "0"
            ] })
          ] }),
          /* @__PURE__ */ jsx(CopyButton, { text: `0o${result.octal}` })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "card p-4 bg-surface border border-border rounded-xl flex items-center justify-between", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
              /* @__PURE__ */ jsx("span", { className: "text-[10px] font-mono text-subtle uppercase", children: "Custom Base:" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "number",
                  min: 2,
                  max: 36,
                  value: customBase,
                  onChange: (e) => setCustomBase(Math.max(2, Math.min(36, Number(e.target.value)))),
                  className: "w-12 px-1 py-0.5 text-[11px] font-mono bg-muted border border-border rounded text-center text-bright"
                }
              )
            ] }),
            /* @__PURE__ */ jsx("span", { className: "text-base font-mono font-bold text-pink-400 select-all", children: result.customBase || "0" })
          ] }),
          /* @__PURE__ */ jsx(CopyButton, { text: result.customBase })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "card p-5 bg-surface border border-border rounded-xl space-y-3", children: [
        /* @__PURE__ */ jsxs("h3", { className: "text-xs font-mono font-semibold text-bright uppercase tracking-wider flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(Cpu, { size: 14, className: "text-indigo-400" }),
          "Low-Level Binary & Two's Complement"
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono", children: [
          /* @__PURE__ */ jsxs("div", { className: "p-3 rounded-lg bg-muted/20 border border-border/40", children: [
            /* @__PURE__ */ jsx("span", { className: "text-subtle text-[10px] block mb-1", children: "8-Bit Representation" }),
            /* @__PURE__ */ jsx("span", { className: "text-indigo-300 select-all", children: result.twoComplement8 })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "p-3 rounded-lg bg-muted/20 border border-border/40", children: [
            /* @__PURE__ */ jsx("span", { className: "text-subtle text-[10px] block mb-1", children: "16-Bit Representation" }),
            /* @__PURE__ */ jsx("span", { className: "text-indigo-300 select-all", children: result.twoComplement16 })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "p-3 rounded-lg bg-muted/20 border border-border/40", children: [
            /* @__PURE__ */ jsx("span", { className: "text-subtle text-[10px] block mb-1", children: "32-Bit Representation" }),
            /* @__PURE__ */ jsx("span", { className: "text-indigo-300 select-all", children: result.twoComplement32 })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between text-xs font-mono text-dim pt-2 border-t border-border/40", children: [
          /* @__PURE__ */ jsxs("span", { children: [
            "Minimum Bits Required: ",
            /* @__PURE__ */ jsxs("strong", { className: "text-bright", children: [
              result.bitsRequired,
              " bits"
            ] })
          ] }),
          /* @__PURE__ */ jsxs("span", { children: [
            "ASCII Character: ",
            /* @__PURE__ */ jsx("strong", { className: "text-bright", children: result.ascii })
          ] })
        ] })
      ] })
    ] })
  ] });
}
export {
  BaseConverter as default
};
