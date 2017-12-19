'use strict';

module.exports.bootstrap = function(cb) {
    // Initiate first manager account
    Manager.find({})
    .then(function (managerData) {
        if (managerData.length === 0) {
          return Manager.create({
            email: 'azaitw@github.com',
            phone: '12345678',
            firstName: 'Azai',
            lastName: 'Chan',
            password: '123',
            isActive: true
          })
        }
        return false;
    })
    .then(function () {
      return System.count({})
    })
    .then(function (systemLen) {
      // 建立或重置系統狀態資料, 用來記錄目前進行中的活動/比賽, 以及基本設定
      if (systemLen === 0) { return System.create({}) }
      return System.update({ key: 0 }, { ongoingEvent: '', ongoingRace: '', slaveEpcMap: {} })
    })
    .then(function () { return cb() })
}
