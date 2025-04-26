// jest.config.js
// module.exports = {
// preset: 'ts-jest',
// testEnvironment: 'jsdom',
// moduleNameMapper: {
//   '^axios$': '<rootDir>/src/__mocks__/axios.ts',
// },
// setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
// };

module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/src/setupTests.ts"],
  moduleNameMapper: {
    "^axios$": "<rootDir>/src/__mocks__/axios.ts",
    "\\.(css|less|scss)$": "identity-obj-proxy",
    "^react-router-dom$": "<rootDir>/node_modules/react-router-dom",
  },
  transformIgnorePatterns: [
    'node_modules/(?!react-router-dom)/'
  ],
  transform: {
    "^.+\\.(t|j)sx?$": [
      "@swc/jest",
      {
        jsc: {
          parser: {
            syntax: "typescript",
            tsx: true,
          },
          transform: {
            react: {
              runtime: "automatic",
            },
          },
        },
      },
    ],
  },
};
