/**
 * Development environment settings
 *
 * This file can include shared settings for a development team,
 * such as API keys or remote database passwords.  If you're using
 * a version control solution for your Sails app, this file will
 * be committed to your repository unless you add it to your .gitignore
 * file.  If your repository will be publicly viewable, don't add
 * any private information to this file!
 *
 */

module.exports = {
  connections: {
    mongoDb: {
      adapter: 'sails-mongo',
      host: '192.168.0.196',
      port: 27017,
      database: 'beardude_event_stage'
    }
  },
  cors: {
    allRoutes: true,
    origin: '*',
    credentials: true,
    methods: 'GET, POST, PUT, DELETE, OPTIONS, HEAD',
    headers: 'content-type'
  },
  log: {
    level: 'info'
  },
  models: {
    connection: 'mongoDb',
    migrate: 'alter'
  }
}
