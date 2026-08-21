// vite.config.ts
import { defineConfig, loadEnv } from "file:///home/project/node_modules/vite/dist/node/index.js";
import react from "file:///home/project/node_modules/@vitejs/plugin-react/dist/index.js";
import sitemap from "file:///home/project/node_modules/vite-plugin-sitemap/dist/index.js";

// src/tools/registry-node.ts
var toolMeta = [
  { slug: "json-formatter", category: "json-tools" },
  { slug: "json-model", category: "json-tools" },
  { slug: "json-to-zod", category: "json-tools" },
  { slug: "json-to-sql", category: "data-tools" },
  { slug: "age-calculator", category: "data-tools" },
  { slug: "wcag-contrast-checker", category: "web-tools" },
  { slug: "semver-calculator", category: "data-tools" },
  { slug: "yaml-json-converter", category: "data-tools" },
  { slug: "curl-converter", category: "web-tools" },
  { slug: "sql-formatter", category: "data-tools" },
  { slug: "graphql-formatter", category: "web-tools" },
  { slug: "hmac-generator", category: "crypto-tools" },
  { slug: "cidr-calculator", category: "data-tools" },
  { slug: "string-escaper", category: "encode-tools" },
  { slug: "base-converter", category: "data-tools" },
  { slug: "css-unit-converter", category: "web-tools" },
  { slug: "json-to-csv", category: "data-tools" },
  { slug: "bcrypt-generator", category: "crypto-tools" },
  { slug: "keycode-inspector", category: "web-tools" },
  { slug: "dockerfile-generator", category: "generate-tools" },
  { slug: "base64", category: "encode-tools" },
  { slug: "url-encoder", category: "encode-tools" },
  { slug: "html-entity", category: "encode-tools" },
  { slug: "text-diff", category: "text-tools" },
  { slug: "uuid", category: "generate-tools" },
  { slug: "jwt", category: "auth-tools" },
  { slug: "html-formatter", category: "web-tools" },
  { slug: "password-generator", category: "generate-tools" },
  { slug: "lorem-ipsum-generator", category: "generate-tools" },
  { slug: "regex", category: "text-tools" },
  { slug: "case-converter", category: "text-tools" },
  { slug: "slug-generator", category: "text-tools" },
  { slug: "markdown-preview", category: "web-tools" },
  { slug: "sha256", category: "crypto-tools" },
  { slug: "word-counter", category: "analyze-tools" },
  { slug: "timestamp-converter", category: "data-tools" },
  { slug: "cron-parser", category: "data-tools" },
  { slug: "query-string-parser", category: "web-tools" },
  { slug: "color-converter", category: "web-tools" },
  { slug: "http-status-lookup", category: "web-tools" },
  { slug: "mime-type-lookup", category: "web-tools" },
  { slug: "user-agent-parser", category: "web-tools" },
  { slug: "ascii-table", category: "data-tools" },
  { slug: "hash-comparator", category: "encode-tools" },
  { slug: "http-header-parser", category: "web-tools" },
  { slug: "basic-auth-header", category: "auth-tools" },
  { slug: "unix-permissions-calculator", category: "data-tools" },
  { slug: "local-ai-text-assistant", category: "analyze-tools" },
  { slug: "csv-to-markdown", category: "text-tools" },
  { slug: "hex-converter", category: "encode-tools" },
  { slug: "mac-address-generator", category: "generate-tools" },
  { slug: "rsa-key-generator", category: "crypto-tools" },
  { slug: "svg-placeholder-generator", category: "generate-tools" },
  { slug: "url-parser", category: "web-tools" },
  { slug: "xml-formatter", category: "web-tools" },
  { slug: "line-sorter", category: "text-tools" },
  { slug: "number-to-words", category: "data-tools" }
];
function getAllAvailableTools() {
  return toolMeta;
}
function getToolCategories() {
  const seen = /* @__PURE__ */ new Set();
  return toolMeta.filter((t) => {
    if (seen.has(t.category)) return false;
    seen.add(t.category);
    return true;
  }).map((t) => ({ category: t.category }));
}

// vite.config.ts
var dynamicRoutes = [
  "/",
  "/tools",
  "/about",
  "/changelog",
  "/privacy",
  ...getToolCategories().map((category) => `/tools/${category.category}`),
  ...getAllAvailableTools().map((tool) => `/${tool.slug}`)
];
var vite_config_default = defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const environment = env.VITE_ENVIRONMENT ?? mode;
  let hostname = env.VITE_BASE_URL || "https://toolbox4devs.com";
  if (!hostname.startsWith("http://") && !hostname.startsWith("https://")) {
    hostname = "https://toolbox4devs.com";
  }
  return {
    server: {
      host: "0.0.0.0",
      port: 3e3,
      allowedHosts: true
    },
    define: {
      "process.env.VITE_ENVIRONMENT": JSON.stringify(environment)
    },
    plugins: [
      react(),
      sitemap({
        hostname,
        dynamicRoutes,
        generateRobotsTxt: true
      })
    ],
    ssgOptions: {
      includedRoutes() {
        return dynamicRoutes;
      }
    },
    build: {
      chunkSizeWarningLimit: 400,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes("node_modules")) {
              if (id.includes("react/") || id.includes("react-dom/") || id.includes("react-router-dom/")) {
                return "vendor-react";
              }
              if (id.includes("@codemirror") || id.includes("@uiw/react-codemirror")) {
                return "vendor-codemirror";
              }
              if (id.includes("prettier")) {
                return "vendor-prettier";
              }
              if (id.includes("yaml")) {
                return "vendor-yaml";
              }
              if (id.includes("diff")) {
                return "vendor-diff";
              }
            }
          }
        }
      }
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiLCAic3JjL3Rvb2xzL3JlZ2lzdHJ5LW5vZGUudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3Byb2plY3Qvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcsIGxvYWRFbnYgfSBmcm9tICd2aXRlJ1xuaW1wb3J0IHJlYWN0IGZyb20gJ0B2aXRlanMvcGx1Z2luLXJlYWN0J1xuaW1wb3J0IHNpdGVtYXAgZnJvbSAndml0ZS1wbHVnaW4tc2l0ZW1hcCdcbmltcG9ydCB7IGdldEFsbEF2YWlsYWJsZVRvb2xzLCBnZXRUb29sQ2F0ZWdvcmllcyB9IGZyb20gJy4vc3JjL3Rvb2xzL3JlZ2lzdHJ5LW5vZGUnXG5cbmNvbnN0IGR5bmFtaWNSb3V0ZXMgPSBbXG4gICcvJyxcbiAgJy90b29scycsXG4gICcvYWJvdXQnLFxuICAnL2NoYW5nZWxvZycsXG4gICcvcHJpdmFjeScsXG4gIC4uLmdldFRvb2xDYXRlZ29yaWVzKCkubWFwKChjYXRlZ29yeSkgPT4gYC90b29scy8ke2NhdGVnb3J5LmNhdGVnb3J5fWApLFxuICAuLi5nZXRBbGxBdmFpbGFibGVUb29scygpLm1hcCgodG9vbCkgPT4gYC8ke3Rvb2wuc2x1Z31gKSxcbl1cblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKCh7IG1vZGUgfSkgPT4ge1xuICBjb25zdCBlbnYgPSBsb2FkRW52KG1vZGUsIHByb2Nlc3MuY3dkKCksICcnKVxuICBjb25zdCBlbnZpcm9ubWVudCA9IGVudi5WSVRFX0VOVklST05NRU5UID8/IG1vZGVcbiAgbGV0IGhvc3RuYW1lID0gZW52LlZJVEVfQkFTRV9VUkwgfHwgJ2h0dHBzOi8vdG9vbGJveDRkZXZzLmNvbSdcbiAgaWYgKCFob3N0bmFtZS5zdGFydHNXaXRoKCdodHRwOi8vJykgJiYgIWhvc3RuYW1lLnN0YXJ0c1dpdGgoJ2h0dHBzOi8vJykpIHtcbiAgICBob3N0bmFtZSA9ICdodHRwczovL3Rvb2xib3g0ZGV2cy5jb20nXG4gIH1cblxuICByZXR1cm4ge1xuICAgIHNlcnZlcjoge1xuICAgICAgaG9zdDogJzAuMC4wLjAnLFxuICAgICAgcG9ydDogMzAwMCxcbiAgICAgIGFsbG93ZWRIb3N0czogdHJ1ZSxcbiAgICB9LFxuICAgIGRlZmluZToge1xuICAgICAgJ3Byb2Nlc3MuZW52LlZJVEVfRU5WSVJPTk1FTlQnOiBKU09OLnN0cmluZ2lmeShlbnZpcm9ubWVudCksXG4gICAgfSxcbiAgICBwbHVnaW5zOiBbXG4gICAgICByZWFjdCgpLFxuICAgICAgc2l0ZW1hcCh7XG4gICAgICAgIGhvc3RuYW1lLFxuICAgICAgICBkeW5hbWljUm91dGVzLFxuICAgICAgICBnZW5lcmF0ZVJvYm90c1R4dDogdHJ1ZSxcbiAgICAgIH0pLFxuICAgIF0sXG4gICAgc3NnT3B0aW9uczoge1xuICAgICAgaW5jbHVkZWRSb3V0ZXMoKSB7XG4gICAgICAgIHJldHVybiBkeW5hbWljUm91dGVzXG4gICAgICB9LFxuICAgIH0sXG4gICAgYnVpbGQ6IHtcbiAgICAgIGNodW5rU2l6ZVdhcm5pbmdMaW1pdDogNDAwLFxuICAgICAgcm9sbHVwT3B0aW9uczoge1xuICAgICAgICBvdXRwdXQ6IHtcbiAgICAgICAgICBtYW51YWxDaHVua3MoaWQpIHtcbiAgICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnbm9kZV9tb2R1bGVzJykpIHtcbiAgICAgICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdyZWFjdC8nKSB8fCBpZC5pbmNsdWRlcygncmVhY3QtZG9tLycpIHx8IGlkLmluY2x1ZGVzKCdyZWFjdC1yb3V0ZXItZG9tLycpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICd2ZW5kb3ItcmVhY3QnXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdAY29kZW1pcnJvcicpIHx8IGlkLmluY2x1ZGVzKCdAdWl3L3JlYWN0LWNvZGVtaXJyb3InKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiAndmVuZG9yLWNvZGVtaXJyb3InXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdwcmV0dGllcicpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICd2ZW5kb3ItcHJldHRpZXInXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCd5YW1sJykpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gJ3ZlbmRvci15YW1sJ1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnZGlmZicpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICd2ZW5kb3ItZGlmZidcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0sXG4gIH1cbn0pXG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9ob21lL3Byb2plY3Qvc3JjL3Rvb2xzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3NyYy90b29scy9yZWdpc3RyeS1ub2RlLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3Byb2plY3Qvc3JjL3Rvb2xzL3JlZ2lzdHJ5LW5vZGUudHNcIjsvLyBcdTI2QTBcdUZFMEYgTm8gUmVhY3QgaW1wb3J0cyBcdTIwMTQgc2FmZSBmb3Igdml0ZS5jb25maWcudHMgKE5vZGUgY29udGV4dClcbi8vIE1pcnJvcnMgcmVnaXN0cnkudHMgYnV0IHdpdGhvdXQgdG9vbENvbXBvbmVudFxuXG5jb25zdCB0b29sTWV0YSA9IFtcbiAgICB7IHNsdWc6ICdqc29uLWZvcm1hdHRlcicsICAgICAgICAgICAgICAgIGNhdGVnb3J5OiAnanNvbi10b29scycgICAgIH0sXG4gICAgeyBzbHVnOiAnanNvbi1tb2RlbCcsICAgICAgICAgICAgICAgICAgICBjYXRlZ29yeTogJ2pzb24tdG9vbHMnICAgICB9LFxuICAgIHsgc2x1ZzogJ2pzb24tdG8tem9kJywgICAgICAgICAgICAgICAgICAgY2F0ZWdvcnk6ICdqc29uLXRvb2xzJyAgICAgfSxcbiAgICB7IHNsdWc6ICdqc29uLXRvLXNxbCcsICAgICAgICAgICAgICAgICAgIGNhdGVnb3J5OiAnZGF0YS10b29scycgICAgIH0sXG4gICAgeyBzbHVnOiAnYWdlLWNhbGN1bGF0b3InLCAgICAgICAgICAgICAgICBjYXRlZ29yeTogJ2RhdGEtdG9vbHMnICAgICB9LFxuICAgIHsgc2x1ZzogJ3djYWctY29udHJhc3QtY2hlY2tlcicsICAgICAgICAgY2F0ZWdvcnk6ICd3ZWItdG9vbHMnICAgICAgfSxcbiAgICB7IHNsdWc6ICdzZW12ZXItY2FsY3VsYXRvcicsICAgICAgICAgICAgIGNhdGVnb3J5OiAnZGF0YS10b29scycgICAgIH0sXG4gICAgeyBzbHVnOiAneWFtbC1qc29uLWNvbnZlcnRlcicsICAgICAgICAgICBjYXRlZ29yeTogJ2RhdGEtdG9vbHMnICAgICB9LFxuICAgIHsgc2x1ZzogJ2N1cmwtY29udmVydGVyJywgICAgICAgICAgICAgICAgY2F0ZWdvcnk6ICd3ZWItdG9vbHMnICAgICAgfSxcbiAgICB7IHNsdWc6ICdzcWwtZm9ybWF0dGVyJywgICAgICAgICAgICAgICAgIGNhdGVnb3J5OiAnZGF0YS10b29scycgICAgIH0sXG4gICAgeyBzbHVnOiAnZ3JhcGhxbC1mb3JtYXR0ZXInLCAgICAgICAgICAgICBjYXRlZ29yeTogJ3dlYi10b29scycgICAgICB9LFxuICAgIHsgc2x1ZzogJ2htYWMtZ2VuZXJhdG9yJywgICAgICAgICAgICAgICAgY2F0ZWdvcnk6ICdjcnlwdG8tdG9vbHMnICAgfSxcbiAgICB7IHNsdWc6ICdjaWRyLWNhbGN1bGF0b3InLCAgICAgICAgICAgICAgIGNhdGVnb3J5OiAnZGF0YS10b29scycgICAgIH0sXG4gICAgeyBzbHVnOiAnc3RyaW5nLWVzY2FwZXInLCAgICAgICAgICAgICAgICBjYXRlZ29yeTogJ2VuY29kZS10b29scycgICB9LFxuICAgIHsgc2x1ZzogJ2Jhc2UtY29udmVydGVyJywgICAgICAgICAgICAgICAgY2F0ZWdvcnk6ICdkYXRhLXRvb2xzJyAgICAgfSxcbiAgICB7IHNsdWc6ICdjc3MtdW5pdC1jb252ZXJ0ZXInLCAgICAgICAgICAgIGNhdGVnb3J5OiAnd2ViLXRvb2xzJyAgICAgIH0sXG4gICAgeyBzbHVnOiAnanNvbi10by1jc3YnLCAgICAgICAgICAgICAgICAgICBjYXRlZ29yeTogJ2RhdGEtdG9vbHMnICAgICB9LFxuICAgIHsgc2x1ZzogJ2JjcnlwdC1nZW5lcmF0b3InLCAgICAgICAgICAgICAgY2F0ZWdvcnk6ICdjcnlwdG8tdG9vbHMnICAgfSxcbiAgICB7IHNsdWc6ICdrZXljb2RlLWluc3BlY3RvcicsICAgICAgICAgICAgIGNhdGVnb3J5OiAnd2ViLXRvb2xzJyAgICAgIH0sXG4gICAgeyBzbHVnOiAnZG9ja2VyZmlsZS1nZW5lcmF0b3InLCAgICAgICAgICBjYXRlZ29yeTogJ2dlbmVyYXRlLXRvb2xzJyB9LFxuICAgIHsgc2x1ZzogJ2Jhc2U2NCcsICAgICAgICAgICAgICAgICAgICAgICAgY2F0ZWdvcnk6ICdlbmNvZGUtdG9vbHMnICAgfSxcbiAgICB7IHNsdWc6ICd1cmwtZW5jb2RlcicsICAgICAgICAgICAgICAgICAgIGNhdGVnb3J5OiAnZW5jb2RlLXRvb2xzJyAgIH0sXG4gICAgeyBzbHVnOiAnaHRtbC1lbnRpdHknLCAgICAgICAgICAgICAgICAgICBjYXRlZ29yeTogJ2VuY29kZS10b29scycgICB9LFxuICAgIHsgc2x1ZzogJ3RleHQtZGlmZicsICAgICAgICAgICAgICAgICAgICAgY2F0ZWdvcnk6ICd0ZXh0LXRvb2xzJyAgICAgfSxcbiAgICB7IHNsdWc6ICd1dWlkJywgICAgICAgICAgICAgICAgICAgICAgICAgIGNhdGVnb3J5OiAnZ2VuZXJhdGUtdG9vbHMnIH0sXG4gICAgeyBzbHVnOiAnand0JywgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXRlZ29yeTogJ2F1dGgtdG9vbHMnICAgICB9LFxuICAgIHsgc2x1ZzogJ2h0bWwtZm9ybWF0dGVyJywgICAgICAgICAgICAgICAgY2F0ZWdvcnk6ICd3ZWItdG9vbHMnICAgICAgfSxcbiAgICB7IHNsdWc6ICdwYXNzd29yZC1nZW5lcmF0b3InLCAgICAgICAgICAgIGNhdGVnb3J5OiAnZ2VuZXJhdGUtdG9vbHMnIH0sXG4gICAgeyBzbHVnOiAnbG9yZW0taXBzdW0tZ2VuZXJhdG9yJywgICAgICAgICBjYXRlZ29yeTogJ2dlbmVyYXRlLXRvb2xzJyB9LFxuICAgIHsgc2x1ZzogJ3JlZ2V4JywgICAgICAgICAgICAgICAgICAgICAgICAgY2F0ZWdvcnk6ICd0ZXh0LXRvb2xzJyAgICAgfSxcbiAgICB7IHNsdWc6ICdjYXNlLWNvbnZlcnRlcicsICAgICAgICAgICAgICAgIGNhdGVnb3J5OiAndGV4dC10b29scycgICAgIH0sXG4gICAgeyBzbHVnOiAnc2x1Zy1nZW5lcmF0b3InLCAgICAgICAgICAgICAgICBjYXRlZ29yeTogJ3RleHQtdG9vbHMnICAgICB9LFxuICAgIHsgc2x1ZzogJ21hcmtkb3duLXByZXZpZXcnLCAgICAgICAgICAgICAgY2F0ZWdvcnk6ICd3ZWItdG9vbHMnICAgICAgfSxcbiAgICB7IHNsdWc6ICdzaGEyNTYnLCAgICAgICAgICAgICAgICAgICAgICAgIGNhdGVnb3J5OiAnY3J5cHRvLXRvb2xzJyAgIH0sXG4gICAgeyBzbHVnOiAnd29yZC1jb3VudGVyJywgICAgICAgICAgICAgICAgICBjYXRlZ29yeTogJ2FuYWx5emUtdG9vbHMnICB9LFxuICAgIHsgc2x1ZzogJ3RpbWVzdGFtcC1jb252ZXJ0ZXInLCAgICAgICAgICAgY2F0ZWdvcnk6ICdkYXRhLXRvb2xzJyAgICAgfSxcbiAgICB7IHNsdWc6ICdjcm9uLXBhcnNlcicsICAgICAgICAgICAgICAgICAgIGNhdGVnb3J5OiAnZGF0YS10b29scycgICAgIH0sXG4gICAgeyBzbHVnOiAncXVlcnktc3RyaW5nLXBhcnNlcicsICAgICAgICAgICAgY2F0ZWdvcnk6ICd3ZWItdG9vbHMnICAgICAgfSxcbiAgICB7IHNsdWc6ICdjb2xvci1jb252ZXJ0ZXInLCAgICAgICAgICAgICAgIGNhdGVnb3J5OiAnd2ViLXRvb2xzJyAgICAgIH0sXG4gICAgeyBzbHVnOiAnaHR0cC1zdGF0dXMtbG9va3VwJywgICAgICAgICAgICBjYXRlZ29yeTogJ3dlYi10b29scycgICAgICB9LFxuICAgIHsgc2x1ZzogJ21pbWUtdHlwZS1sb29rdXAnLCAgICAgICAgICAgICAgY2F0ZWdvcnk6ICd3ZWItdG9vbHMnICAgICAgfSxcbiAgICB7IHNsdWc6ICd1c2VyLWFnZW50LXBhcnNlcicsICAgICAgICAgICAgIGNhdGVnb3J5OiAnd2ViLXRvb2xzJyAgICAgIH0sXG4gICAgeyBzbHVnOiAnYXNjaWktdGFibGUnLCAgICAgICAgICAgICAgICAgICBjYXRlZ29yeTogJ2RhdGEtdG9vbHMnICAgICB9LFxuICAgIHsgc2x1ZzogJ2hhc2gtY29tcGFyYXRvcicsICAgICAgICAgICAgICAgY2F0ZWdvcnk6ICdlbmNvZGUtdG9vbHMnICAgfSxcbiAgICB7IHNsdWc6ICdodHRwLWhlYWRlci1wYXJzZXInLCAgICAgICAgICAgIGNhdGVnb3J5OiAnd2ViLXRvb2xzJyAgICAgIH0sXG4gICAgeyBzbHVnOiAnYmFzaWMtYXV0aC1oZWFkZXInLCAgICAgICAgICAgICBjYXRlZ29yeTogJ2F1dGgtdG9vbHMnICAgICB9LFxuICAgIHsgc2x1ZzogJ3VuaXgtcGVybWlzc2lvbnMtY2FsY3VsYXRvcicsICAgY2F0ZWdvcnk6ICdkYXRhLXRvb2xzJyAgICAgfSxcbiAgICB7IHNsdWc6ICdsb2NhbC1haS10ZXh0LWFzc2lzdGFudCcsICAgICAgIGNhdGVnb3J5OiAnYW5hbHl6ZS10b29scycgIH0sXG4gICAgeyBzbHVnOiAnY3N2LXRvLW1hcmtkb3duJywgICAgICAgICAgICAgICBjYXRlZ29yeTogJ3RleHQtdG9vbHMnICAgICB9LFxuICAgIHsgc2x1ZzogJ2hleC1jb252ZXJ0ZXInLCAgICAgICAgICAgICAgICAgY2F0ZWdvcnk6ICdlbmNvZGUtdG9vbHMnICAgfSxcbiAgICB7IHNsdWc6ICdtYWMtYWRkcmVzcy1nZW5lcmF0b3InLCAgICAgICAgIGNhdGVnb3J5OiAnZ2VuZXJhdGUtdG9vbHMnIH0sXG4gICAgeyBzbHVnOiAncnNhLWtleS1nZW5lcmF0b3InLCAgICAgICAgICAgICBjYXRlZ29yeTogJ2NyeXB0by10b29scycgICB9LFxuICAgIHsgc2x1ZzogJ3N2Zy1wbGFjZWhvbGRlci1nZW5lcmF0b3InLCAgICAgY2F0ZWdvcnk6ICdnZW5lcmF0ZS10b29scycgfSxcbiAgICB7IHNsdWc6ICd1cmwtcGFyc2VyJywgICAgICAgICAgICAgICAgICAgIGNhdGVnb3J5OiAnd2ViLXRvb2xzJyAgICAgIH0sXG4gICAgeyBzbHVnOiAneG1sLWZvcm1hdHRlcicsICAgICAgICAgICAgICAgICBjYXRlZ29yeTogJ3dlYi10b29scycgICAgICB9LFxuICAgIHsgc2x1ZzogJ2xpbmUtc29ydGVyJywgICAgICAgICAgICAgICAgICAgY2F0ZWdvcnk6ICd0ZXh0LXRvb2xzJyAgICAgfSxcbiAgICB7IHNsdWc6ICdudW1iZXItdG8td29yZHMnLCAgICAgICAgICAgICAgIGNhdGVnb3J5OiAnZGF0YS10b29scycgICAgIH0sXG4gIF0gYXMgY29uc3RcbiAgXG4gIGV4cG9ydCBmdW5jdGlvbiBnZXRBbGxBdmFpbGFibGVUb29scygpIHtcbiAgICByZXR1cm4gdG9vbE1ldGFcbiAgfVxuICBcbiAgZXhwb3J0IGZ1bmN0aW9uIGdldFRvb2xDYXRlZ29yaWVzKCkge1xuICAgIGNvbnN0IHNlZW4gPSBuZXcgU2V0PHN0cmluZz4oKVxuICAgIHJldHVybiB0b29sTWV0YVxuICAgICAgLmZpbHRlcih0ID0+IHtcbiAgICAgICAgaWYgKHNlZW4uaGFzKHQuY2F0ZWdvcnkpKSByZXR1cm4gZmFsc2VcbiAgICAgICAgc2Vlbi5hZGQodC5jYXRlZ29yeSlcbiAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgIH0pXG4gICAgICAubWFwKHQgPT4gKHsgY2F0ZWdvcnk6IHQuY2F0ZWdvcnkgfSkpXG4gIH0iXSwKICAibWFwcGluZ3MiOiAiO0FBQXlOLFNBQVMsY0FBYyxlQUFlO0FBQy9QLE9BQU8sV0FBVztBQUNsQixPQUFPLGFBQWE7OztBQ0NwQixJQUFNLFdBQVc7QUFBQSxFQUNiLEVBQUUsTUFBTSxrQkFBaUMsVUFBVSxhQUFpQjtBQUFBLEVBQ3BFLEVBQUUsTUFBTSxjQUFpQyxVQUFVLGFBQWlCO0FBQUEsRUFDcEUsRUFBRSxNQUFNLGVBQWlDLFVBQVUsYUFBaUI7QUFBQSxFQUNwRSxFQUFFLE1BQU0sZUFBaUMsVUFBVSxhQUFpQjtBQUFBLEVBQ3BFLEVBQUUsTUFBTSxrQkFBaUMsVUFBVSxhQUFpQjtBQUFBLEVBQ3BFLEVBQUUsTUFBTSx5QkFBaUMsVUFBVSxZQUFpQjtBQUFBLEVBQ3BFLEVBQUUsTUFBTSxxQkFBaUMsVUFBVSxhQUFpQjtBQUFBLEVBQ3BFLEVBQUUsTUFBTSx1QkFBaUMsVUFBVSxhQUFpQjtBQUFBLEVBQ3BFLEVBQUUsTUFBTSxrQkFBaUMsVUFBVSxZQUFpQjtBQUFBLEVBQ3BFLEVBQUUsTUFBTSxpQkFBaUMsVUFBVSxhQUFpQjtBQUFBLEVBQ3BFLEVBQUUsTUFBTSxxQkFBaUMsVUFBVSxZQUFpQjtBQUFBLEVBQ3BFLEVBQUUsTUFBTSxrQkFBaUMsVUFBVSxlQUFpQjtBQUFBLEVBQ3BFLEVBQUUsTUFBTSxtQkFBaUMs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
