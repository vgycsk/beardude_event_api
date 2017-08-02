const processData = {
  returnRaces: (groups) => {
    let races = []
    groups.map(V => { races = races.concat(V.races) })
    return races
  },
  returnRacesByOrder: (races, order) => {
    let result = []
    order.map(raceId => { races.map(race => { if (race.id === raceId) { result.push(race) } }) })
    return result
  },
  returnIdNameMap: (objs) => {
    let result = {}
    objs.map(obj => { result[obj.id.toString()] = obj.nameCht })
    return result
  },
  returnOngoingRace: (ongoingRaceId, orderedRaces) => {
    for (let i = 0; i < orderedRaces.length; i += 1) {
      if (orderedRaces[i].id === ongoingRaceId) { return i }
    }
    return undefined
  },
  returnSelectedRace: (orderedRaces) => {
    for (var i = 0; i < orderedRaces.length; i += 1) {
      if (orderedRaces[i].raceStatus !== 'submitted') { return i}
    }
    return 0
  },
  returnLapLabels: (laps) => {
    let result = []
    for (var i = 0; i < laps; i += 1) { result.push(i + 1) }
    return result
  },
  returnMovedArray: (arr, old_index, new_index) => {
    while (old_index < 0) { old_index += arr.length; }
    while (new_index < 0) { new_index += arr.length; }
    if (new_index >= arr.length) {
        var k = new_index - arr.length
        while ((k--) + 1) { arr.push(undefined) }
    }
    arr.splice(new_index, 0, arr.splice(old_index, 1)[0])
   return arr
  },
  returnFormattedTime: (milS) => {
    const sec = ((milS % 60000) / 1000).toFixed(2);
    const min = Math.floor(milS / 60000);
    return min + ':' + (sec < 10 ? '0' : '') + sec
  },
  returnLapRecord: (result, laps, startTime, raceStatus) => {
    let output = []
    let lastRecord = startTime;
    let lapsLeft = laps

    // started
    if (result.length > 0) {
      for (var i = 1; i <= result.length; i += 1) {
        if (result[i]) {
          output.push(processData.returnFormattedTime(result[i] - lastRecord))
          lastRecord = result[i]
          lapsLeft -= 1
        } else if (raceStatus === 'started') {
          output.push('🕒')
          lapsLeft -= 1
        }
      }
    }
    for (var i = 0; i < lapsLeft; i += 1) {
      output.push('-')
    }
    return output
  },
  returnAdvanceToId: (index, advancingRules) => {
    for (var i = 0; i < advancingRules.length; i += 1) {
      if ( index >= advancingRules[i].rankFrom && index <= advancingRules[i].rankTo) { return advancingRules[i].toRace }
    }
    return undefined
  },
  returnRaceResult: (race) => {
    let sortTable = []
    let incomplete = []
    let notStarted = []
    const lastRecordIndex = race.laps + 1

    race.registrations.map(reg => {
      const record = race.recordsHashTable[reg.epc]
      if (record) {
        if (record[lastRecordIndex]) {
          sortTable.push([reg.epc, reg.id, reg.raceNumber, record[lastRecordIndex], record.length - 1, record])
        } else {
          incomplete.push([reg.epc, reg.id, reg.raceNumber, record[record.length - 1], record.length - 1, record])
        }
      } else {
        notStarted.push([reg.epc, reg.id, reg.raceNumber, 0, 0, [], reg.id])
      }
    })
    sortTable.sort((a, b) => a[3] - b[3]) // sort completed racer by last lap record
    incomplete.sort((a, b) => b[4] - a[4]) // sort incompleted by laps
    incomplete.sort((a, b) => (a[4] === b[4]) ? a[3] - b[3] : 0 ) // sort incompleted same-lap by time
    notStarted.sort((a, b) => a[2] - b[2]) // sort notStart by raceNumber
    sortTable = sortTable.concat(incomplete).concat(notStarted)
    // sortTable: [epc, name, raceNumber, timestamp, laps, record]
    return sortTable.map((item, index) => ({ epc: item[0], registration: item[1], sum: (item[3]) ? processData.returnFormattedTime(item[3] - race.startTime) : '-', laps: item[4], lapRecords: processData.returnLapRecord(item[5], race.laps, race.startTime, race.raceStatus), advanceTo: processData.returnAdvanceToId(index, race.advancingRules) }))
  }
}
export default processData