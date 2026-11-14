import { jsx, jsxs } from "react/jsx-runtime";
import { useState, useEffect, useMemo } from "react";
import { T as ToolLayout } from "./ToolLayout-CZQXENmQ.js";
import { t as tools } from "../main.mjs";
import { Sparkles, Gift, Compass, Heart, Globe, Award, Check } from "lucide-react";
import { C as CopyButton } from "./CopyButton-BRH0SK_m.js";
import "vite-react-ssg";
import "react-router-dom";
import "lz-string";
const ZODIAC_SIGNS = [
  { name: "Capricorn", start: [1, 1], end: [1, 19] },
  { name: "Aquarius", start: [1, 20], end: [2, 18] },
  { name: "Pisces", start: [2, 19], end: [3, 20] },
  { name: "Aries", start: [3, 21], end: [4, 19] },
  { name: "Taurus", start: [4, 20], end: [5, 20] },
  { name: "Gemini", start: [5, 21], end: [6, 20] },
  { name: "Cancer", start: [6, 21], end: [7, 22] },
  { name: "Leo", start: [7, 23], end: [8, 22] },
  { name: "Virgo", start: [8, 23], end: [9, 22] },
  { name: "Libra", start: [9, 23], end: [10, 22] },
  { name: "Scorpio", start: [10, 23], end: [11, 21] },
  { name: "Sagittarius", start: [11, 22], end: [12, 21] },
  { name: "Capricorn", start: [12, 22], end: [12, 31] }
];
const CHINESE_ZODIAC = [
  "Rat",
  "Ox",
  "Tiger",
  "Rabbit",
  "Dragon",
  "Snake",
  "Horse",
  "Goat",
  "Monkey",
  "Rooster",
  "Dog",
  "Pig"
];
const PLANETS = [
  { planet: "Mercury", periodDays: 87.97 },
  { planet: "Venus", periodDays: 224.7 },
  { planet: "Mars", periodDays: 686.98 },
  { planet: "Jupiter", periodDays: 4332.59 },
  { planet: "Saturn", periodDays: 10759.22 }
];
function getZodiac(month, day) {
  for (const sign of ZODIAC_SIGNS) {
    const [sm, sd] = sign.start;
    const [em, ed] = sign.end;
    if (month === sm && day >= sd || month === em && day <= ed) {
      return sign.name;
    }
  }
  return "Capricorn";
}
function calculateAgeDetails(birthDateStr, birthTimeStr, compareDate) {
  if (!birthDateStr) return null;
  const [year, month, day] = birthDateStr.split("-").map(Number);
  const [hour = 0, minute = 0] = (birthTimeStr || "00:00").split(":").map(Number);
  const birth = new Date(year, month - 1, day, hour, minute, 0, 0);
  if (isNaN(birth.getTime())) return null;
  const now = compareDate;
  const diffMs = now.getTime() - birth.getTime();
  if (diffMs < 0) return null;
  let years = now.getFullYear() - birth.getFullYear();
  let months = now.getMonth() - birth.getMonth();
  let days = now.getDate() - birth.getDate();
  let hours = now.getHours() - birth.getHours();
  let minutes = now.getMinutes() - birth.getMinutes();
  let seconds = now.getSeconds() - birth.getSeconds();
  if (seconds < 0) {
    seconds += 60;
    minutes--;
  }
  if (minutes < 0) {
    minutes += 60;
    hours--;
  }
  if (hours < 0) {
    hours += 24;
    days--;
  }
  if (days < 0) {
    const prevMonthLastDay = new Date(now.getFullYear(), now.getMonth(), 0).getDate();
    days += prevMonthLastDay;
    months--;
  }
  if (months < 0) {
    months += 12;
    years--;
  }
  const totalDays = Math.floor(diffMs / (1e3 * 60 * 60 * 24));
  const totalWeeks = Math.floor(totalDays / 7);
  const totalHours = Math.floor(diffMs / (1e3 * 60 * 60));
  const totalMinutes = Math.floor(diffMs / (1e3 * 60));
  const totalSeconds = Math.floor(diffMs / 1e3);
  let nextBday = new Date(now.getFullYear(), birth.getMonth(), birth.getDate(), birth.getHours(), birth.getMinutes(), 0);
  if (nextBday.getTime() <= now.getTime()) {
    nextBday = new Date(now.getFullYear() + 1, birth.getMonth(), birth.getDate(), birth.getHours(), birth.getMinutes(), 0);
  }
  const nextBdayDiff = nextBday.getTime() - now.getTime();
  const nextBirthdayDays = Math.floor(nextBdayDiff / (1e3 * 60 * 60 * 24));
  const nextBirthdayHours = Math.floor(nextBdayDiff / (1e3 * 60 * 60) % 24);
  const nextBirthdayMinutes = Math.floor(nextBdayDiff / (1e3 * 60) % 60);
  const nextBirthdaySeconds = Math.floor(nextBdayDiff / 1e3 % 60);
  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const nextBirthdayDayOfWeek = daysOfWeek[nextBday.getDay()];
  const dayOfWeekBorn = daysOfWeek[birth.getDay()];
  const nextAge = nextBday.getFullYear() - birth.getFullYear();
  const zodiacSign = getZodiac(birth.getMonth() + 1, birth.getDate());
  const chineseIndex = (birth.getFullYear() - 4) % 12;
  const chineseZodiac = CHINESE_ZODIAC[(chineseIndex + 12) % 12];
  const heartbeats = Math.floor(totalMinutes * 75);
  const breaths = Math.floor(totalMinutes * 16);
  const sleepHours = Math.floor(totalDays * 8);
  const lifespanPercentage = Math.min(100, parseFloat((totalDays / (80 * 365.25) * 100).toFixed(2)));
  const planetaryAges = PLANETS.map((p) => ({
    planet: p.planet,
    age: parseFloat((totalDays / p.periodDays).toFixed(2)),
    periodDays: p.periodDays
  }));
  const milestonesList = [
    { name: "10,000 Days", targetDays: 1e4 },
    { name: "15,000 Days", targetDays: 15e3 },
    { name: "20,000 Days", targetDays: 2e4 },
    { name: "25,000 Days", targetDays: 25e3 },
    { name: "500 Million Seconds", targetSeconds: 5e8 },
    { name: "1 Billion Seconds", targetSeconds: 1e9 },
    { name: "2 Billion Seconds", targetSeconds: 2e9 }
  ];
  const milestones = milestonesList.map((m) => {
    let targetDate;
    if (m.targetDays) {
      targetDate = new Date(birth.getTime() + m.targetDays * 24 * 60 * 60 * 1e3);
    } else {
      targetDate = new Date(birth.getTime() + (m.targetSeconds || 0) * 1e3);
    }
    const passed = targetDate.getTime() <= now.getTime();
    const remainingDays = Math.ceil((targetDate.getTime() - now.getTime()) / (1e3 * 60 * 60 * 24));
    return {
      name: m.name,
      date: targetDate,
      passed,
      remainingDays
    };
  });
  return {
    years,
    months,
    days,
    hours,
    minutes,
    seconds,
    totalDays,
    totalWeeks,
    totalHours,
    totalMinutes,
    totalSeconds,
    totalMilliseconds: diffMs,
    nextBirthdayDays,
    nextBirthdayHours,
    nextBirthdayMinutes,
    nextBirthdaySeconds,
    nextBirthdayDayOfWeek,
    nextAge,
    dayOfWeekBorn,
    zodiacSign,
    chineseZodiac,
    heartbeats,
    breaths,
    sleepHours,
    lifespanPercentage,
    planetaryAges,
    milestones
  };
}
const PRESETS = [
  { label: "Gen Z (2000-01-01)", date: "2000-01-01", time: "00:00" },
  { label: "Millennial (1990-05-15)", date: "1990-05-15", time: "08:30" },
  { label: "Unix Epoch (1970-01-01)", date: "1970-01-01", time: "00:00" },
  { label: "Moon Landing (1969-07-20)", date: "1969-07-20", time: "20:17" }
];
function AgeCalculator() {
  const [birthDate, setBirthDate] = useState("1995-06-15");
  const [birthTime, setBirthTime] = useState("09:30");
  const [liveTicker, setLiveTicker] = useState(true);
  const [currentNow, setCurrentNow] = useState(/* @__PURE__ */ new Date());
  const [customCompareDate, setCustomCompareDate] = useState("");
  const [useCustomCompare, setUseCustomCompare] = useState(false);
  const meta = tools.find((t) => t.slug === "age-calculator");
  useEffect(() => {
    if (!liveTicker || useCustomCompare) return;
    const timer = setInterval(() => {
      setCurrentNow(/* @__PURE__ */ new Date());
    }, 1e3);
    return () => clearInterval(timer);
  }, [liveTicker, useCustomCompare]);
  const targetDate = useMemo(() => {
    if (useCustomCompare && customCompareDate) {
      const d = new Date(customCompareDate);
      return isNaN(d.getTime()) ? currentNow : d;
    }
    return currentNow;
  }, [useCustomCompare, customCompareDate, currentNow]);
  const stats = useMemo(() => {
    return calculateAgeDetails(birthDate, birthTime, targetDate);
  }, [birthDate, birthTime, targetDate]);
  const summaryText = stats ? `Age: ${stats.years} years, ${stats.months} months, ${stats.days} days, ${stats.hours} hours, ${stats.minutes} minutes, and ${stats.seconds} seconds. (${stats.totalDays.toLocaleString()} total days lived)` : "";
  return /* @__PURE__ */ jsx(
    ToolLayout,
    {
      title: (meta == null ? void 0 : meta.name) || "Age & Lifetime Milestone Calculator",
      description: (meta == null ? void 0 : meta.description) || "Calculate your exact age in years, months, days, hours, minutes, and seconds with live ticking updates, planetary ages, and milestone countdowns.",
      tag: "AGE",
      children: /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-2 p-3 bg-surface border border-border rounded-xl", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 text-xs font-mono text-dim mr-2", children: [
            /* @__PURE__ */ jsx(Sparkles, { size: 14, className: "text-accent" }),
            /* @__PURE__ */ jsx("span", { children: "Presets:" })
          ] }),
          PRESETS.map((preset) => /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: () => {
                setBirthDate(preset.date);
                setBirthTime(preset.time);
              },
              className: "px-2.5 py-1 rounded-md text-xs font-mono bg-muted/40 hover:bg-muted text-bright border border-border/50 transition-colors",
              children: preset.label
            },
            preset.label
          ))
        ] }),
        /* @__PURE__ */ jsx("div", { className: "p-4 bg-surface border border-border rounded-xl space-y-4 shadow-sm", children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-xs font-mono text-dim mb-1 font-medium", children: "Date of Birth (DOB)" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "date",
                value: birthDate,
                onChange: (e) => setBirthDate(e.target.value),
                className: "w-full px-3 py-2 text-sm font-mono bg-bg border border-border rounded-lg text-bright focus:outline-none focus:border-accent"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-xs font-mono text-dim mb-1 font-medium", children: "Time of Birth (Optional)" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "time",
                value: birthTime,
                onChange: (e) => setBirthTime(e.target.value),
                className: "w-full px-3 py-2 text-sm font-mono bg-bg border border-border rounded-lg text-bright focus:outline-none focus:border-accent"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-xs font-mono text-dim mb-1 font-medium", children: "Compare Against" }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 h-9.5", children: [
              /* @__PURE__ */ jsx(
                "button",
                {
                  type: "button",
                  onClick: () => setUseCustomCompare(false),
                  className: `flex-1 py-1.5 px-2 text-xs font-mono rounded-lg border transition-colors ${!useCustomCompare ? "bg-accent/15 border-accent text-accent font-semibold" : "bg-bg border-border text-dim hover:text-bright"}`,
                  children: "Today (Live)"
                }
              ),
              /* @__PURE__ */ jsx(
                "button",
                {
                  type: "button",
                  onClick: () => setUseCustomCompare(true),
                  className: `flex-1 py-1.5 px-2 text-xs font-mono rounded-lg border transition-colors ${useCustomCompare ? "bg-accent/15 border-accent text-accent font-semibold" : "bg-bg border-border text-dim hover:text-bright"}`,
                  children: "Custom Date"
                }
              )
            ] })
          ] }),
          useCustomCompare ? /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-xs font-mono text-dim mb-1 font-medium", children: "Custom Target Date" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "date",
                value: customCompareDate,
                onChange: (e) => setCustomCompareDate(e.target.value),
                className: "w-full px-3 py-2 text-sm font-mono bg-bg border border-border rounded-lg text-bright focus:outline-none focus:border-accent"
              }
            )
          ] }) : /* @__PURE__ */ jsx("div", { className: "flex items-end pb-1", children: /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-2 cursor-pointer text-xs font-mono text-dim hover:text-bright select-none", children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "checkbox",
                checked: liveTicker,
                onChange: (e) => setLiveTicker(e.target.checked),
                className: "rounded border-border bg-bg text-accent focus:ring-0"
              }
            ),
            /* @__PURE__ */ jsx("span", { children: "Live running seconds ticker" })
          ] }) })
        ] }) }),
        stats ? /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
          /* @__PURE__ */ jsxs("div", { className: "p-6 bg-surface border border-accent/30 rounded-2xl shadow-md relative overflow-hidden", children: [
            /* @__PURE__ */ jsx("span", { "aria-hidden": "true", className: "absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl pointer-events-none" }),
            /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center justify-between gap-4 mb-4", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("span", { className: "eyebrow block mb-1 text-accent", children: "EXACT AGE BREAKDOWN" }),
                /* @__PURE__ */ jsxs("h3", { className: "text-xl sm:text-2xl font-mono font-bold text-bright tracking-tight", children: [
                  stats.years,
                  " Years, ",
                  stats.months,
                  " Months, ",
                  stats.days,
                  " Days"
                ] })
              ] }),
              /* @__PURE__ */ jsx("div", { className: "flex items-center gap-2", children: /* @__PURE__ */ jsx(CopyButton, { text: summaryText }) })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-3 sm:grid-cols-6 gap-3 pt-2", children: [
              /* @__PURE__ */ jsxs("div", { className: "p-3 bg-bg/80 border border-border/80 rounded-xl text-center", children: [
                /* @__PURE__ */ jsx("span", { className: "text-2xl sm:text-3xl font-mono font-bold text-indigo-400 block", children: stats.years }),
                /* @__PURE__ */ jsx("span", { className: "text-[11px] font-mono text-dim", children: "Years" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "p-3 bg-bg/80 border border-border/80 rounded-xl text-center", children: [
                /* @__PURE__ */ jsx("span", { className: "text-2xl sm:text-3xl font-mono font-bold text-emerald-400 block", children: stats.months }),
                /* @__PURE__ */ jsx("span", { className: "text-[11px] font-mono text-dim", children: "Months" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "p-3 bg-bg/80 border border-border/80 rounded-xl text-center", children: [
                /* @__PURE__ */ jsx("span", { className: "text-2xl sm:text-3xl font-mono font-bold text-amber-400 block", children: stats.days }),
                /* @__PURE__ */ jsx("span", { className: "text-[11px] font-mono text-dim", children: "Days" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "p-3 bg-bg/80 border border-border/80 rounded-xl text-center", children: [
                /* @__PURE__ */ jsx("span", { className: "text-2xl sm:text-3xl font-mono font-bold text-cyan-400 block", children: stats.hours }),
                /* @__PURE__ */ jsx("span", { className: "text-[11px] font-mono text-dim", children: "Hours" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "p-3 bg-bg/80 border border-border/80 rounded-xl text-center", children: [
                /* @__PURE__ */ jsx("span", { className: "text-2xl sm:text-3xl font-mono font-bold text-purple-400 block", children: stats.minutes }),
                /* @__PURE__ */ jsx("span", { className: "text-[11px] font-mono text-dim", children: "Minutes" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "p-3 bg-bg/80 border border-accent/40 rounded-xl text-center bg-accent/5", children: [
                /* @__PURE__ */ jsx("span", { className: "text-2xl sm:text-3xl font-mono font-bold text-accent block animate-pulse", children: stats.seconds.toString().padStart(2, "0") }),
                /* @__PURE__ */ jsx("span", { className: "text-[11px] font-mono text-accent", children: "Seconds" })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "p-5 bg-surface border border-border rounded-xl space-y-3", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-amber-400", children: [
                /* @__PURE__ */ jsx(Gift, { size: 18 }),
                /* @__PURE__ */ jsx("h4", { className: "text-sm font-mono font-bold text-bright", children: "Next Birthday Countdown" })
              ] }),
              /* @__PURE__ */ jsxs("p", { className: "text-xs text-dim", children: [
                "Turning ",
                /* @__PURE__ */ jsx("strong", { className: "text-bright font-mono", children: stats.nextAge }),
                " on a ",
                /* @__PURE__ */ jsx("strong", { className: "text-bright font-mono", children: stats.nextBirthdayDayOfWeek })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-4 gap-2 text-center pt-1 font-mono", children: [
                /* @__PURE__ */ jsxs("div", { className: "p-2 bg-bg border border-border/70 rounded-lg", children: [
                  /* @__PURE__ */ jsx("span", { className: "text-lg font-bold text-bright block", children: stats.nextBirthdayDays }),
                  /* @__PURE__ */ jsx("span", { className: "text-[10px] text-dim", children: "Days" })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "p-2 bg-bg border border-border/70 rounded-lg", children: [
                  /* @__PURE__ */ jsx("span", { className: "text-lg font-bold text-bright block", children: stats.nextBirthdayHours }),
                  /* @__PURE__ */ jsx("span", { className: "text-[10px] text-dim", children: "Hours" })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "p-2 bg-bg border border-border/70 rounded-lg", children: [
                  /* @__PURE__ */ jsx("span", { className: "text-lg font-bold text-bright block", children: stats.nextBirthdayMinutes }),
                  /* @__PURE__ */ jsx("span", { className: "text-[10px] text-dim", children: "Mins" })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "p-2 bg-bg border border-border/70 rounded-lg", children: [
                  /* @__PURE__ */ jsx("span", { className: "text-lg font-bold text-bright block", children: stats.nextBirthdaySeconds }),
                  /* @__PURE__ */ jsx("span", { className: "text-[10px] text-dim", children: "Secs" })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "p-5 bg-surface border border-border rounded-xl space-y-3", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-indigo-400", children: [
                /* @__PURE__ */ jsx(Compass, { size: 18 }),
                /* @__PURE__ */ jsx("h4", { className: "text-sm font-mono font-bold text-bright", children: "Birth Astrological Profile" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-3 gap-2 pt-1 font-mono text-center", children: [
                /* @__PURE__ */ jsxs("div", { className: "p-2.5 bg-bg border border-border/70 rounded-lg", children: [
                  /* @__PURE__ */ jsx("span", { className: "text-[10px] text-dim block mb-1", children: "Day Born" }),
                  /* @__PURE__ */ jsx("span", { className: "text-xs font-bold text-cyan-400", children: stats.dayOfWeekBorn })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "p-2.5 bg-bg border border-border/70 rounded-lg", children: [
                  /* @__PURE__ */ jsx("span", { className: "text-[10px] text-dim block mb-1", children: "Western Zodiac" }),
                  /* @__PURE__ */ jsx("span", { className: "text-xs font-bold text-purple-400", children: stats.zodiacSign })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "p-2.5 bg-bg border border-border/70 rounded-lg", children: [
                  /* @__PURE__ */ jsx("span", { className: "text-[10px] text-dim block mb-1", children: "Chinese Zodiac" }),
                  /* @__PURE__ */ jsx("span", { className: "text-xs font-bold text-emerald-400", children: stats.chineseZodiac })
                ] })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "p-5 bg-surface border border-border rounded-xl space-y-4", children: [
            /* @__PURE__ */ jsx("div", { className: "flex items-center justify-between", children: /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("h4", { className: "text-sm font-mono font-bold text-bright", children: "Total Lifetime Units Breakdown" }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-dim", children: "Your complete existence represented in individual time increments" })
            ] }) }),
            /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 font-mono text-xs", children: [
              /* @__PURE__ */ jsxs("div", { className: "p-3 bg-bg border border-border/70 rounded-lg", children: [
                /* @__PURE__ */ jsx("span", { className: "text-dim block text-[11px]", children: "Total Days Lived" }),
                /* @__PURE__ */ jsx("span", { className: "text-base font-bold text-emerald-400", children: stats.totalDays.toLocaleString() })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "p-3 bg-bg border border-border/70 rounded-lg", children: [
                /* @__PURE__ */ jsx("span", { className: "text-dim block text-[11px]", children: "Total Weeks" }),
                /* @__PURE__ */ jsx("span", { className: "text-base font-bold text-indigo-400", children: stats.totalWeeks.toLocaleString() })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "p-3 bg-bg border border-border/70 rounded-lg", children: [
                /* @__PURE__ */ jsx("span", { className: "text-dim block text-[11px]", children: "Total Hours" }),
                /* @__PURE__ */ jsx("span", { className: "text-base font-bold text-amber-400", children: stats.totalHours.toLocaleString() })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "p-3 bg-bg border border-border/70 rounded-lg", children: [
                /* @__PURE__ */ jsx("span", { className: "text-dim block text-[11px]", children: "Total Minutes" }),
                /* @__PURE__ */ jsx("span", { className: "text-base font-bold text-cyan-400", children: stats.totalMinutes.toLocaleString() })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "p-3 bg-bg border border-border/70 rounded-lg sm:col-span-2", children: [
                /* @__PURE__ */ jsx("span", { className: "text-dim block text-[11px]", children: "Total Seconds" }),
                /* @__PURE__ */ jsx("span", { className: "text-base font-bold text-purple-400", children: stats.totalSeconds.toLocaleString() })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "p-3 bg-bg border border-border/70 rounded-lg sm:col-span-2", children: [
                /* @__PURE__ */ jsx("span", { className: "text-dim block text-[11px]", children: "Total Milliseconds" }),
                /* @__PURE__ */ jsx("span", { className: "text-base font-bold text-rose-400", children: stats.totalMilliseconds.toLocaleString() })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-5", children: [
            /* @__PURE__ */ jsxs("div", { className: "p-5 bg-surface border border-border rounded-xl space-y-4", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-rose-400", children: [
                /* @__PURE__ */ jsx(Heart, { size: 18 }),
                /* @__PURE__ */ jsx("h4", { className: "text-sm font-mono font-bold text-bright", children: "Estimated Biological Milestones" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-3 font-mono text-xs", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between p-2.5 bg-bg border border-border/70 rounded-lg", children: [
                  /* @__PURE__ */ jsx("span", { className: "text-dim", children: "Estimated Heartbeats (~75 bpm):" }),
                  /* @__PURE__ */ jsx("span", { className: "font-bold text-rose-400", children: stats.heartbeats.toLocaleString() })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between p-2.5 bg-bg border border-border/70 rounded-lg", children: [
                  /* @__PURE__ */ jsx("span", { className: "text-dim", children: "Estimated Breaths Taken (~16/min):" }),
                  /* @__PURE__ */ jsx("span", { className: "font-bold text-cyan-400", children: stats.breaths.toLocaleString() })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between p-2.5 bg-bg border border-border/70 rounded-lg", children: [
                  /* @__PURE__ */ jsx("span", { className: "text-dim", children: "Estimated Sleep Time (~8 hrs/day):" }),
                  /* @__PURE__ */ jsxs("span", { className: "font-bold text-indigo-400", children: [
                    stats.sleepHours.toLocaleString(),
                    " hours"
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "p-2.5 bg-bg border border-border/70 rounded-lg space-y-1.5", children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-dim", children: [
                    /* @__PURE__ */ jsx("span", { children: "Lifespan (relative to 80-year baseline):" }),
                    /* @__PURE__ */ jsxs("span", { className: "font-bold text-bright", children: [
                      stats.lifespanPercentage,
                      "%"
                    ] })
                  ] }),
                  /* @__PURE__ */ jsx("div", { className: "w-full bg-surface h-2 rounded-full overflow-hidden", children: /* @__PURE__ */ jsx(
                    "div",
                    {
                      className: "bg-accent h-full transition-all duration-500",
                      style: { width: `${stats.lifespanPercentage}%` }
                    }
                  ) })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "p-5 bg-surface border border-border rounded-xl space-y-4", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-cyan-400", children: [
                /* @__PURE__ */ jsx(Globe, { size: 18 }),
                /* @__PURE__ */ jsx("h4", { className: "text-sm font-mono font-bold text-bright", children: "Age on Other Solar Planets" })
              ] }),
              /* @__PURE__ */ jsx("div", { className: "space-y-2 font-mono text-xs", children: stats.planetaryAges.map((p) => /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between p-2 bg-bg border border-border/70 rounded-lg", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsx("span", { className: "w-2 h-2 rounded-full bg-cyan-400" }),
                  /* @__PURE__ */ jsx("span", { className: "text-bright font-medium", children: p.planet }),
                  /* @__PURE__ */ jsxs("span", { className: "text-[10px] text-dim", children: [
                    "(",
                    p.periodDays,
                    " Earth days / orbit)"
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("span", { className: "font-bold text-cyan-400", children: [
                  p.age,
                  " years"
                ] })
              ] }, p.planet)) })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "p-5 bg-surface border border-border rounded-xl space-y-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-amber-400", children: [
              /* @__PURE__ */ jsx(Award, { size: 18 }),
              /* @__PURE__ */ jsx("h4", { className: "text-sm font-mono font-bold text-bright", children: "Next Major Lifetime Milestones" })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 font-mono text-xs", children: stats.milestones.map((m) => /* @__PURE__ */ jsxs(
              "div",
              {
                className: `p-3 rounded-lg border ${m.passed ? "bg-emerald-500/10 border-emerald-500/30" : "bg-bg border-border/80"}`,
                children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-1", children: [
                    /* @__PURE__ */ jsx("span", { className: "font-bold text-bright", children: m.name }),
                    m.passed ? /* @__PURE__ */ jsxs("span", { className: "text-[10px] text-emerald-400 flex items-center gap-1 font-semibold", children: [
                      /* @__PURE__ */ jsx(Check, { size: 12 }),
                      " Achieved"
                    ] }) : /* @__PURE__ */ jsxs("span", { className: "text-[10px] text-amber-400 font-semibold", children: [
                      "In ",
                      m.remainingDays.toLocaleString(),
                      " days"
                    ] })
                  ] }),
                  /* @__PURE__ */ jsx("span", { className: "text-[11px] text-dim block", children: m.date.toLocaleDateString(void 0, { year: "numeric", month: "short", day: "numeric" }) })
                ]
              },
              m.name
            )) })
          ] })
        ] }) : /* @__PURE__ */ jsx("div", { className: "p-6 bg-surface border border-border rounded-xl text-center text-dim font-mono text-xs", children: "Please enter a valid date of birth earlier than the comparison date." })
      ] })
    }
  );
}
export {
  AgeCalculator as default
};
