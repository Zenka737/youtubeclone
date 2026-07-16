export default [
    {
        files: ["script.js"],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: "script",
            globals: {
                window: "readonly",
                document: "readonly",
                localStorage: "readonly",
                alert: "readonly",
                console: "readonly",
                setTimeout: "readonly",
                clearTimeout: "readonly",
            },
        },
        rules: {
            // Реальные ошибки
            "no-undef": "error",
            "no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }],
            "no-unreachable": "error",
            "no-duplicate-case": "error",
            "no-empty": "warn",
            "no-extra-semi": "warn",
            "no-dupe-keys": "error",

            // Потенциальные баги
            "eqeqeq": ["error", "always"],
            "no-implicit-globals": "error",
            "no-self-assign": "error",
            "no-self-compare": "error",
            "no-constant-condition": "warn",
            "no-fallthrough": "error",
            "no-redeclare": "error",
            "use-isnan": "error",
            "valid-typeof": "error",
            "no-loss-of-precision": "error",
        },
    },
];
