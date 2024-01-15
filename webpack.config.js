const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');


module.exports = {
    module: {
        rules: [
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
                exclude: /node_modules/
            },
            {
                test: /\.ttf$/,
                use: ['file-loader'],
            }
        ]
    },
    plugins: [new MonacoWebpackPlugin()]
};
