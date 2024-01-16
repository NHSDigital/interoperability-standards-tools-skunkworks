const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');

module.exports = {
    // target should only be specified when including component in Electron app
    target: 'electron-renderer',
    module: {
        rules: [
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
            },
            {
                test: /\.ttf$/,
                use: ['file-loader'],
            },
        ],
    },
    plugins: [
        new MonacoWebpackPlugin({
            languages: ['css', 'html', 'javascript', 'sql', 'typescript'],
            features: ['contextmenu', 'clipboard', 'find'],
        }),
    ],
};
