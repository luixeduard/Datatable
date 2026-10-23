import type { Preview } from '@storybook/react';
import { themes } from '@storybook/theming';
import { withThemeByClassName } from '@storybook/addon-themes';
import '../src/index.css';

const preview: Preview = {
    parameters: {
        docs: {
            theme: themes.dark,
        },
        backgrounds: {
            default: 'dark',
            values: [
                { name: 'dark', value: '#0b0f19' },
                { name: 'slate', value: '#0f172a' },
                { name: 'light', value: '#ffffff' },
            ],
        },
        controls: {
            matchers: {
                color: /(background|color)$/i,
                date: /Date$/i,
            },
        },
    },
    decorators: [
        withThemeByClassName({
            themes: {
                light: 'light',
                dark: 'dark',
            },
            defaultTheme: 'dark',
            parentSelector: 'html',
        }),
    ],
};

export default preview;