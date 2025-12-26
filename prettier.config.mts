import { type Config } from 'prettier'
import { type PluginOptions as TailwindPluginOptions } from 'prettier-plugin-tailwindcss'

export const config: Config & TailwindPluginOptions = {
  semi: false,
  singleQuote: true,
  tabWidth: 2,
  trailingComma: 'all',
  printWidth: 120,
  plugins: ['prettier-plugin-tailwindcss'],
  tailwindStylesheet: './src/styles/globals.css',
  tailwindFunctions: ['clsx', 'cn'],
}

export default config
