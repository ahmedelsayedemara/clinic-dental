// Re-export from the JS source so TypeScript consumers get proper typing.
// colors.js is the single source of truth shared with tailwind.config.js
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { colors } = require('./colors.js') as { colors: Record<string, string> };

export { colors };
export type ColorsType = typeof colors;
