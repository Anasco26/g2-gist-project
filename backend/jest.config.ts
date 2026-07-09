import type { Config } from "jest";

const config: Config = {
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageProvider: "v8",
  moduleFileExtensions: ["js", "mjs", "cjs", "jsx", "ts", "mts", "cts"],
  preset: "ts-jest",
  roots: ["src/tests"],
  testEnvironment: "node",
  testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.ts?$",
  transform: {
    "^.+\\.ts?$": "ts-jest",
  },
};

export default config;
