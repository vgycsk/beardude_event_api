/* global fetch */

// types
const ACTION_ERR = 'event/ACTION_ERR'
const DELETE_EVENT = 'event/DELETE_EVENT'
const DELETE_GROUP = 'event/DELETE_GROUP'
const DELETE_RACE = 'event/DELETE_RACE'
const DELETE_REG = 'event/DELETE_REG'
const EVENT_ERR = 'event/EVENT_ERR'
const GET_EVENT = 'event/GET_EVENT'
const GET_EVENTS = 'event/GET_EVENTS'
const GET_GROUP = 'event/GET_GROUP'
const GET_RACE = 'event/GET_RACE'
const CONTROL_RACE = 'event/CONTROL_RACE'
const SUBMIT_EVENT = 'event/SUBMIT_EVENT'
const SUBMIT_GROUP = 'event/SUBMIT_GROUP'
const SUBMIT_RACE = 'event/SUBMIT_RACE'
const SUBMIT_REG = 'event/SUBMIT_REG'

const returnPostHeader = (obj) => ({ method: 'post', credentials: 'same-origin', headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }, body: JSON.stringify(obj) })
// actions
export const actionCreators = {
  delete: (state, successCallback) => async (dispatch) => {
    const types = { event: DELETE_EVENT, group: DELETE_GROUP, race: DELETE_RACE, reg: DELETE_REG }
    try {
      const response = await fetch(`/api/${state.model}/delete/${state.original.id}`, {credentials: 'same-origin'})
      const res = await response.json()
      if (response.status === 200) {
        dispatch({type: types[state.model], payload: {...res, state: state}})
        if (state.model !== 'event') { successCallback() }
      }
      throw res.message
    } catch (e) {
      dispatch({type: ACTION_ERR, payload: {error: e}})
    }
  },
  getEvents: () => async (dispatch) => {
    try {
      const response = await fetch('/api/event/getEvents', {credentials: 'same-origin'})
      const res = await response.json()
      if (response.status === 200) {
        return dispatch({type: GET_EVENTS, payload: res})
      }
      throw res.message
    } catch (e) {
      dispatch({type: EVENT_ERR, payload: {error: '取得活動失敗'}})
    }
  },
  getEvent: (id, successCallback) => async (dispatch) => {
    if (id === 'new') {
      dispatch({type: GET_EVENT, payload: { event: { groups: [] } }})
      return successCallback()
    }
    try {
      const response = await fetch(`/api/event/mgmtInfo/${id}`, {credentials: 'same-origin'})
      const res = await response.json()
      if (response.status === 200) {
        dispatch({type: GET_EVENT, payload: {...res}})
        if (successCallback !== undefined) {
          successCallback()
        }
        return
      }
      throw res.message
    } catch (e) {
      dispatch({type: EVENT_ERR, payload: {error: '取得活動內容失敗'}})
    }
  },
  getRace: (id) => async (dispatch) => {
    try {
      const response = await fetch(`/api/race/mgmtInfo/${id}`, {credentials: 'same-origin'})
      const res = await response.json()
      if (response.status === 200) {
        return dispatch({type: GET_RACE, payload: {...res}})
      }
      throw res.message
    } catch (e) {
      dispatch({type: EVENT_ERR, payload: {error: '取得比賽內容失敗'}})
    }
  },
  controlRace: (action, object, successCallback) => async (dispatch) => {
    try {
      let response = await fetch(`/api/race/${action}`, returnPostHeader(object))
      let res = await response.json()
      if (response.status === 200) {
        response = await fetch(`/api/race/mgmtInfo/${object.id}`, {credentials: 'same-origin'})
        res = await response.json()
        dispatch({type: CONTROL_RACE, payload: {...res, raceId: object.id, action: action}})
        if (successCallback !== undefined) {
          successCallback()
        }
        return
      }
      throw res.message
    } catch (e) {
      dispatch({type: EVENT_ERR, payload: {error: '開始比賽失敗: ' + e}})
    }
  },
  submit: (state, successCallback) => async (dispatch) => {
    const types = { event: SUBMIT_EVENT, group: SUBMIT_GROUP, race: SUBMIT_RACE, reg: SUBMIT_REG }
    const pathname = (state.original.id) ? 'update' : 'create'
    try {
      const response = await fetch(`/api/${state.model}/${pathname}`, returnPostHeader({...state.modified, id: state.original.id}))
      const res = await response.json()
      if (response.status === 200) {
        dispatch({type: types[state.model], payload: {...res, state: state}})
        return successCallback()
      }
      throw res.message
    } catch (e) {
      dispatch({type: ACTION_ERR, payload: {error: e}})
    }
  },
  submitRaceResult: (raceObj, successCallback) => async (dispatch) => {
    // {races: [{id: ID, toAdd: [ID, ID, ID], toRemove: ID, ID, ID}, {}, {}]}
    const returnRegsToRaces = (race) => race.advancingRules.map(rule => {
      let obj = { id: rule.toRace, toAdd: [], toRemove: [] }
      race.result.map(V => obj[(V.advanceTo === rule.toRace) ? 'toAdd' : 'toRemove'].push(V.registration))
      return obj
    })
    try {
      let response = await fetch('/api/race/submitResult', returnPostHeader({ id: raceObj.id, result: raceObj.result, advance: returnRegsToRaces(raceObj) }))
      let res = await response.json()
      if (response.status === 200) {
        response = await fetch('/api/group/mgmtInfo/' + raceObj.group, {credentials: 'same-origin'})
        res = await response.json()
        dispatch({type: GET_GROUP, payload: {...res, id: raceObj.group}})
        return successCallback()
      }
      throw res.message
    } catch (e) {
      dispatch({type: EVENT_ERR, payload: {error: '送出比賽結果失敗: ' + e}})
    }
  },
  submitAdvancingRules: (state, successCallback) => async (dispatch) => {
    try {
      const response = await fetch('/api/race/update', returnPostHeader({id: state.raceId, advancingRules: state.modified}))
      const res = await response.json()
      if (response.status === 200) {
        dispatch({type: GET_RACE, payload: {...res, state: state}})
        return successCallback()
      }
      throw res.message
    } catch (e) {
      dispatch({type: ACTION_ERR, payload: {error: e}})
    }
  },
  submitRegsToRaces: (groupId, groupIndex, obj, successCallback) => async (dispatch, getState) => {
    try {
      let response = await fetch('/api/race/assignRegsToRaces', returnPostHeader({races: obj}))
      let res = await response.json()
      if (response.status === 200) {
        response = await fetch(`/api/group/mgmtInfo/${groupId}`, {credentials: 'same-origin'})
        res = await response.json()
        if (response.status === 200) {
          dispatch({type: GET_GROUP, payload: {...res, index: groupIndex}})
          return successCallback(res.group)
        }
      }
      throw res.message
    } catch (e) {
      dispatch({type: ACTION_ERR, payload: {error: e}})
    }
  }
}

// reducers
const initialState = {
  event: undefined,
  events: []
}
export const reducer = (state = initialState, action) => {
  const {type, payload} = action

  switch (type) {
    case ACTION_ERR: {
      return {...state, error: payload.error}
    }
    case DELETE_EVENT: {
      return {...state, event: -1}
    }
    case DELETE_GROUP: {
      let nextState = {...state}
      nextState.event.groups.splice(payload.state.groupSelected, 1)
      return nextState
    }
    case DELETE_RACE: {
      let nextState = {...state}
      nextState.event.groups[payload.state.groupSelected].races.splice(payload.state.raceSelected, 1)
      return nextState
    }
    case DELETE_REG: {
      let nextState = {...state}
      nextState.event.groups[payload.state.groupSelected].registrations.splice(payload.state.regSelected, 1)
      return nextState
    }
    case GET_EVENTS: {
      return {...state, events: payload.events}
    }
    case GET_EVENT: {
      return {...state, event: payload.event}
    }
    case GET_RACE: {
      let nextState = {...state}
      nextState.event.groups.map((group, gIndex) => {
        group.races.map((race, rIndex) => {
          if (race.id === payload.race.id) {
            nextState.event.groups[gIndex].races[rIndex] = {...payload.race}
          }
        })
      })
      return nextState
    }
    case GET_GROUP: {
      let nextState = {...state}
      if (payload.index) {
        nextState.event.groups[payload.index] = payload.group
      } else if (payload.id) {
        nextState.event.groups.map((V, I) => {
          if (V.id === payload.id) { nextState.event.groups[I] = payload.group }
        })
      }
      return nextState
    }
    case CONTROL_RACE: {
      let nextState = {...state}
      nextState.event.groups.map((group, gIndex) => {
        group.races.map((race, rIndex) => {
          if (race.id === payload.raceId) {
            nextState.event.groups[gIndex].races[rIndex] = {...payload.race}
          }
        })
      })
      if (payload.action === 'start') {
        nextState.event.ongoingRace = payload.raceId
      } else if (payload.action === 'reset') {
        nextState.event.ongoingRace = -1
      }
      return nextState
    }
    case SUBMIT_EVENT: {
      return {...state, event: {...payload.event, groups: [...state.event.groups]}}
    }
    case SUBMIT_GROUP: {
      let nextState = {...state}
      const group = state.event.groups[payload.state.groupSelected] || {...payload.group, races: [], registrations: []}
      if (state.event.groups.length === payload.state.groupSelected) {
        nextState.event.groups.push(group)
      } else {
        nextState.event.groups[payload.state.groupSelected] = {...payload.group, races: group.races, registrations: group.registrations}
      }
      return nextState
    }
    case SUBMIT_RACE: {
      let nextState = {...state}
      if (state.event.groups[payload.state.groupSelected].races.length === payload.state.raceSelected) {
        nextState.event.groups[payload.state.groupSelected].races.push({...payload.race, registrations: []})
      } else {
        nextState.event.groups[payload.state.groupSelected].races[payload.state.raceSelected] = payload.race
      }
      return nextState
    }
    case SUBMIT_REG: {
      let nextState = {...state}

      // group's reg
      if (state.event.groups[payload.state.groupSelected].registrations.length === payload.state.regSelected) {
        nextState.event.groups[payload.state.groupSelected].registrations.push({...payload.registration})
      } else {
        nextState.event.groups[payload.state.groupSelected].registrations[payload.state.regSelected] = payload.registration
      }
      return nextState
    }
    case EVENT_ERR: {
      return {...state, event: -1}
    }
  }
  return state
}

export default reducer
