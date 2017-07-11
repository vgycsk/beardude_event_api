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
    aws: {
      key: '',
      secret: '',
      region: 'ap-northeast-1',
      bucket: ''
    },
    mysql: {
      adapter: 'sails-mysql',
      host: 'azai.synology.me',
      port: 33306,
      user: 'engine',
      password: 'BeardudeEngineZhuandao1022',
      database: 'emrv_api'
    }
  },
  log: {
    level: 'silent'
  },
  models: {
    connection: 'mysql',
    migrate: 'safe'
  },
  port: 80
}
