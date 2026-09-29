import * as Sentry from '@sentry/node'

if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV,
    includeLocalVariables: false,
    maxBreadcrumbs: 0,
    dataCollection: {
      cookies: false,
      httpHeaders: false,
      httpBodies: [],
      urlQueryParams: false,
      databaseQueryData: false,
      stackFrameVariables: false,
    },
    beforeSend(event) {
      // /channels accepts an admin secret in the URL. Never send request data to Sentry.
      delete event.request
      delete event.breadcrumbs
      return event
    },
  })
}
