module.exports = {
    verbose: true,
    coverageReporters: ['html', 'text', 'cobertura'],
    testEnvironment: 'jsdom',
    testMatch: ['**/__tests__/**/*.?(m)js?(x)', '**/?(*.)(spec|test).?(m)js?(x)'],
    moduleFileExtensions: ['js', 'mjs'],
    transform: {
        '^.+\\.m?js$': 'babel-jest'
    },
    fakeTimers: { enableGlobally: true },
    globals: {},
    transformIgnorePatterns: ['node_modules/(?!@arpadroid/tools)']
    // reporters: [
    //     'default',
    //     [
    //         'node_modules/@arpadroid/module/jest-junit',
    //         {
    //             // outputDirectory: "",
    //             outputName: 'junit.xml'
    //         }
    //     ]
    // ]
};
