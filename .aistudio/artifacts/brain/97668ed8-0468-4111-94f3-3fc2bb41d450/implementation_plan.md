# Delimited File Data Validator (CSV / TSV / TXT)

A high-performance, 100% client-side tabular file validation utility for ToolBox4Devs. It allows developers, data engineers, and analysts to verify CSV, TSV, and delimited TXT files against custom user-defined validation rules (data types, required fields, regex patterns, numerical/date ranges, enum values, and unique constraints) with instant row-level error reporting and exportable audit summaries.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following user preferences were confirmed during Phase 1 interactive clarification:
> - **Supported Formats**: CSV, TSV, and customizable delimited TXT files (comma, tab, pipe, semicolon, custom separator).
> - **Rule Configuration Method**: Interactive visual rule builder with preset constraints (data types, required/not-null, regex patterns, min/max values/lengths, allowed options, uniqueness).
> - **Validation Report & Error Output**: Interactive error table with direct row/cell error highlighting, category filtering, error search, and CSV export of invalid or flagged rows.

- **Client-Side Processing Guarantee**: All file parsing, rule evaluation, and report generation execute 100% in browser memory with zero network requests or third-party telemetry, preserving strict data privacy.
- **Rule Presets & Templates**: Includes pre-configured rule sets (e.g., Email, URL, UUID, ISO Date, Phone, Non-negative Number) and allows one-click export/import of rulesets as JSON for reproducible team workflows.

---

## 1. Overview & Core Concept

### What It Does
The **Delimited File Data Validator** parses structured tabular text files (CSV, TSV, TXT with headers) and validates each row and column against user-defined schema rules. Users can either upload a file or paste sample text, auto-detect column headers and data types, adjust validation constraints via an intuitive visual rule builder, run instantaneous validation, and inspect all violations highlighted down to the exact row, column, and reason.

### Target Audience / Persona
- **Data Engineers & Analysts**: Verifying bulk ETL inputs, CSV database dumps, or warehouse export files before loading them into databases.
- **Frontend & Full-Stack Developers**: Testing mock data, validating user import formats, and troubleshooting API ingestion schemas.
- **Operations & QA Teams**: Auditing partner data feeds, user lists, and inventory spreadsheets for missing values or malformed formats.

### Key Value
Eliminates tedious manual spreadsheet checking and fragile custom validation scripts. Users get immediate, secure, zero-installation file validation directly in the browser with actionable error diagnostics and export capabilities.

---

## 2. User Experience & Visual Design

### Key User Flows

1. **File Input & Auto-Inspection**:
   - The user drags and drops a CSV/TSV/TXT file or pastes raw delimited data into an input editor.
   - The tool auto-detects delimiter (comma, pipe `|`, tab `\t`, semicolon `;`) and parses the first 10 rows to detect headers and infer likely column types (string, number, boolean, date, email, uuid).
   - Instant statistics show total rows detected, column count, delimiter, and sample preview.

2. **Visual Rule Configuration**:
   - Each column card shows its detected name and type with customizable validation constraints:
     - **Required / Non-empty**: Rejects null, blank, or whitespace-only cells.
     - **Type Check**: String, Integer, Float/Number, Boolean, Date (ISO/custom), Email, UUID.
     - **Range / Length Constraints**: Min/max value for numbers, min/max character length for text.
     - **Regex Pattern**: Custom regex pattern with live regex validation (e.g. `^[A-Z]{3}-\d{4}$`).
     - **Allowed Values (Enum)**: Comma-separated list of permitted values.
     - **Uniqueness Check**: Flags duplicate values within the column.
   - Quick actions: "Load Sample File & Rules", "Auto-Generate Rules from Data", "Reset Rules", "Export Rules JSON", "Import Rules JSON".

3. **Validation Run & Health Summary**:
   - Clicking "Validate File" runs the memory-efficient validation engine across all rows.
   - A summary dashboard displays overall file status (Valid / Errors Found), total rows checked, valid row count, violation count, and error distribution by column and error type.

4. **Error Exploration & Export**:
   - An interactive paginated error table displays violated rows with cell error callouts, exact row numbers, column names, offending values, and human-readable violation descriptions.
   - Filter errors by column or rule type, and search for specific text.
   - Quick export buttons: "Export Error Report (CSV)", "Export Invalid Rows Only (CSV)", and "Export Validated Clean Rows (CSV)".

### Visual Identity & Theme
- **Aesthetic Direction**: Utilitarian, precision developer dashboard adhering to ToolBox4Devs design standards (dark slate `#0f0f11` background, crisp high-contrast neutral borders, purposeful emerald for valid states, rose/crimson for error alerts, and amber for rule warnings).
- **Typography**: Clean sans-serif headings with `font-mono tabular-nums` for row numbers, column counts, and violation tallies.
- **Zero-Pill Discipline**: Status labels and metadata use clean, unboxed typography with dot separators (`Row 14 · Column 'email' · Invalid Email Format`).
- **Layout Presence**: Full 1440px desktop width layout with collapsible rule builder panel, sticky validation action bar, and responsive data grid.

---

## 3. Key Product Decisions & Trade-Offs

### Decision 1: Client-Side Streaming & Chunked Evaluation
- **Chosen Approach**: Evaluate rows in micro-batches (chunks of 2,000–5,000 rows) with `requestAnimationFrame` / `setTimeout` yielding to keep the UI interactive even on large files (up to tens of thousands of rows).
- **Why**: Prevents browser freeze, gives live progress indicators for larger files, and avoids complex external Web Worker messaging setup while remaining 100% client-side.
- **Alternatives Considered**: Web Worker parsing (added bundling overhead and postMessage data duplication overhead for small-to-medium files).

### Decision 2: Dual Mode (Visual Rule Builder + Preset Templates)
- **Chosen Approach**: Provide an intuitive visual form with toggleable constraint chips for each column, backed by a simple JSON schema format that can be saved, copied, or loaded.
- **Why**: Offers zero-friction configuration for casual checks while empowering power users to save and reuse strict rule definitions across repeating daily data files.
- **Alternatives Considered**: JSON Schema only (too high a barrier for quick non-technical checks) or Visual only (lacks reusability across sessions).

---

## 4. Technical Architecture & Data Strategy

### Architecture & Component Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Delimited File Validator                        │
│                 (src/components/tools/data-tools/CsvValidator.tsx)     │
└────────────────────────────────────────────────────────────────────────┘
                                    │
    ┌───────────────────────────────┼───────────────────────────────┐
    ▼                               ▼                               ▼
┌──────────────────────┐  ┌──────────────────────┐  ┌──────────────────────┐
│  File & Delimiter    │  │  Visual Rule Engine  │  │  Validation Runner   │
│  Input Area          │  │  & Schema Config     │  │  & Metrics State     │
│  - Drag & Drop Drop  │  │  - Column rule cards │  │  - Row-by-row checks │
│  - Paste text area   │  │  - Type & constraints│  │  - Duplicate tracker │
│  - Delimiter detect  │  │  - JSON export/import│  │  - Violation store   │
└──────────────────────┘  └──────────────────────┘  └──────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        Results & Action Bar                            │
│  - Pass / Fail Summary Cards (Total Rows, Valid Rows, Total Errors)    │
│  - Interactive Error Data Grid with Row Filter & Search                │
│  - Export Actions (Error Audit CSV, Invalid Rows CSV, Clean Rows CSV)  │
└────────────────────────────────────────────────────────────────────────┘
```

### Data Structures & State Model

```typescript
export type ColumnDataType = 'string' | 'number' | 'integer' | 'boolean' | 'date' | 'email' | 'uuid';

export interface ColumnRule {
  columnName: string;
  dataType: ColumnDataType;
  required: boolean;
  unique: boolean;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string; // Regex string
  allowedValues?: string[]; // Enum permitted values
}

export interface ValidationError {
  id: string;
  rowIndex: number; // 1-based data row number
  columnName: string;
  cellValue: string;
  ruleType: 'required' | 'type' | 'range' | 'length' | 'pattern' | 'enum' | 'unique';
  message: string;
}

export interface ValidationSummary {
  totalRows: number;
  validRows: number;
  invalidRows: number;
  totalErrors: number;
  errorsByColumn: Record<string, number>;
  errorsByRule: Record<string, number>;
  executionTimeMs: number;
}
```

### Mandatory Registry & SEO Synchronization Checklist

In strict accordance with `AGENTS.md` and `GEMINI.md`:
1. **Tool Component**: `src/components/tools/data-tools/CsvValidator.tsx`
2. **Client Tool Metadata**: `src/tools/meta/csv-validator.ts`
3. **Client Registry**: `src/tools/registry.ts`
4. **Node / SSG Registry**: `src/tools/registry-node.ts`
5. **App Routes**: `src/routes.tsx`
6. **Tool Catalog & Counter**: `public/tools.json` (update `totalTools: 73`)
7. **Sitemap**: `public/sitemap.xml`
8. **LLM Specifications**: `public/llms.txt` and `public/llms-full.txt`
9. **Global Tool Counters**: `public/opensearch.xml`, `public/manifest.json`, `index.html`, `src/pages/Home.tsx`
10. **Test Coverage**: `src/__tests__/csvValidator.test.ts`
