import { Config } from "@jest/types";

const config: Config.InitialOptions = {
  preset: "ts-jest",
  testEnvironment: "node",

  moduleFileExtensions: ["ts", "js", "json"],
  testMatch: ["**/?(*.)+(spec|test).[tj]s"],

  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageProvider: "v8",

  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,

  rootDir: ".",
  testPathIgnorePatterns: ["/node_modules/", "/dist/"],

  moduleNameMapper: {
    "^src/(.*)$": "<rootDir>/src/$1",
  },
};

export default config;
