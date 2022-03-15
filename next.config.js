/* global module */

// https://nextjs.org/docs/api-reference/next.config.js/introduction
// https://docs.sentry.io/platforms/javascript/guides/nextjs/
const { withSentryConfig } = require('@sentry/nextjs')
const glob = require('glob')
const { dirname, basename } = require('path')

const SentryWebpackPluginOptions = {
  // https://github.com/getsentry/sentry-webpack-plugin#options
  debug: process.env.NODE_ENV === 'development',
  dryRun: process.env.NODE_ENV === 'development',
  release: process.env.GIT_COMMIT_SHA,
  silent: false,
}

const LANG_DIR = './public/static/lang/'
const DEFAULT_LOCALE = 'en'

function getSupportedLanguages() {
  const supportedLanguages = new Set()
  supportedLanguages.add(DEFAULT_LOCALE) // at least 1 supported language
  glob.sync(`${LANG_DIR}/**/*.json`).forEach((f) =>
    supportedLanguages.add(basename(f, '.json'))
  )
  return [...supportedLanguages]
}

module.exports = withSentryConfig({
  i18n: {
    locales: getSupportedLanguages(),
    defaultLocale: DEFAULT_LOCALE,
  },
  webpack: (config, options) => {
    config.plugins.push(
      new options.webpack.DefinePlugin({
        'process.env.GIT_COMMIT_SHA_SHORT': JSON.stringify(process.env.GIT_COMMIT_SHA_SHORT),
        'process.env.GIT_COMMIT_SHA': JSON.stringify(process.env.GIT_COMMIT_SHA),
        'process.env.GIT_COMMIT_REF': JSON.stringify(process.env.GIT_COMMIT_REF),
        'process.env.GIT_COMMIT_TAGS': JSON.stringify(process.env.GIT_COMMIT_TAGS),
        'process.env.DEFAULT_LOCALE': DEFAULT_LOCALE,
        'process.env.WDYR': JSON.stringify(process.env.WDYR),
      })
    )
    return config
  },
  productionBrowserSourceMaps: true,
  // disable the webpack plugins for client and server until the
  // release mechanism is clear. At this point, there no need to
  // upload sourcemaps for every single `next build` that happens
  // e.g during E2E testing and vercel preview deployments.
  sentry: {
    disableClientWebpackPlugin: true,
    disableServerWebpackPlugin: true
  }
}, SentryWebpackPluginOptions)
