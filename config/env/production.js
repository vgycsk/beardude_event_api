/**
 * Production environment settings
 *
 * This file can include shared settings for a production environment,
 * such as API keys or remote database passwords.  If you're using
 * a version control solution for your Sails app, this file will
 * be committed to your repository unless you add it to your .gitignore
 * file.  If your repository will be publicly viewable, don't add
 * any private information to this file!
 *
 */

module.exports = {
  blueprints: {
    shortcuts: false
  },
  connections: {
    mongoDb: {
      adapter: 'sails-mongo',
      host: 'localhost',
      port: 27017
    }
  },
  log: {
    level: 'info'
  },
  models: {
    connection: 'mongoDb',
    migrate: 'safe'
  },
  port: 80,
  session: {
//    secret: '0ef4078c715212419592935512d5dc0d',
    adapter: 'redis',
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  // ttl: <redis session TTL in seconds>,
    db: 0,
    pass: '',
    prefix: 'sess:'
  }
}
