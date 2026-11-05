import type { NextConfig } from "next";
import path from "path";
import fs from "fs";

const additionalRoots: Record<string, { path: string }> = {};
try {
  const nodeModulesPath = path.join(process.cwd(), "node_modules");
  if (fs.existsSync(nodeModulesPath)) {
    const realPath = fs.realpathSync(nodeModulesPath);
    if (!realPath.startsWith(process.cwd())) {
      additionalRoots["externalNodeModules"] = { path: path.dirname(realPath) };
    }
  }
} catch {
  // Ignore resolution errors
}

const nextConfig: NextConfig = {
  experimental: {
    turbopackAdditionalRoots: additionalRoots,
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
