import type { Preview } from '@storybook/react';
import { themes } from '@storybook/theming';
import { withThemeByClassName } from '@storybook/addon-themes';
import '../src/index.css';
import './storybook.css';

const preview: Preview = {
    parameters: {
        docs: {
            theme: themes.dark,
        },
        backgrounds: {
            disable: true,
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