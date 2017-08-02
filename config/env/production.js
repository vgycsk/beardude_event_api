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
    mysql: {
      adapter: 'sails-mysql',
      host: process.env.MYSQL_URL,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
      port: process.env.MYSQL_PORT
    }
  },
  log: {
    level: 'info'
  },
  models: {
    connection: 'mysql',
    migrate: 'alter'
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
