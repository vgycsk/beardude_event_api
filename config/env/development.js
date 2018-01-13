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
    mongoDev: {
      adapter: 'sails-mongo',
      host: 'localhost',
      port: 27017,
      database: 'beardude_event_dev'
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
    connection: 'mongoDev',
    migrate: 'alter'
  }
}
