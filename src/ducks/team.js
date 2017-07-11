/* global fetch */

import { actionCreators as racerActionCreators } from './racer'

// types
const CREATE_TEAM = 'team/CREATE_TEAM'
const CANCEL_EDIT = 'team/CANCEL_EDIT'
const GET_TEAMS = 'team/GET_TEAMS'
const EDIT_TEAM = 'team/EDIT_TEAM'
const SELECT_TEAM = 'team/SELECT_TEAM'
const SUBMIT_TEAM = 'team/SUBMIT_TEAM'
const ADD_RACER = 'team/ADD_RACER'
const REMOVE_RACER = 'team/REMOVE_RACER'
const TEAM_ERR = 'team/TEAM_ERR'

// actions
export const actionCreators = {
  addRacer: (racer) => (dispatch) => {
    dispatch({type: ADD_RACER, payload: {racer}})
  },
  removeRacer: (id, toRestore) => (dispatch) => {
    dispatch({type: REMOVE_RACER, payload: {id, toRestore}})
  },
  create: () => (dispatch) => {
    dispatch({type: CREATE_TEAM})
  },
  cancelEdit: () => (dispatch) => {
    dispatch({type: CANCEL_EDIT})
  },
  getTeams: () => async (dispatch, getState) => {
    try {
      const response = await fetch('/api/team/getTeams', {credentials: 'same-origin'})
      const res = await response.json()

      if (response.status === 200) {
        return dispatch({type: GET_TEAMS, payload: res})
      }
      throw res.message
    } catch (e) {
      dispatch({type: TEAM_ERR, payload: {error: e}})
    }
  },
  input: (field, value) => (dispatch) => {
    dispatch({type: EDIT_TEAM, payload: {field, value}})
  },
  selectTeam: (index) => async (dispatch, getState) => {
    let teamStore = getState().team

    if (teamStore.teams[index].upToDate) {
      return dispatch({type: SELECT_TEAM, payload: {selectedIndex: index}})
    }
    try {
      const response = await fetch('/api/team/getInfo/' + teamStore.teams[index].id, {credentials: 'same-origin'})
      const res = await response.json()
      if (response.status === 200) {
        return dispatch({type: SELECT_TEAM, payload: {...res, selectedIndex: index}})
      }
      throw res.message
    } catch (e) {
      dispatch({type: TEAM_ERR, payload: {error: e}})
    }
  },
  submit: () => async (dispatch, getState) => {
    const store = getState().team
    const teamId = store.teams[store.selectedIndex].id
    try {
      const response = await fetch((teamId) ? '/api/team/update' : '/api/team/create', {
        method: 'post',
        credentials: 'same-origin',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ...store.inEdit, id: teamId })
      })
      const res = await response.json()
      if (response.status === 200) {
        dispatch({type: SUBMIT_TEAM, payload: {...res, selectedIndex: store.selectedIndex}})
        return dispatch(racerActionCreators.getRacers())
      }
      throw res.message
    } catch (e) {
      dispatch({type: TEAM_ERR, payload: {error: e}})
    }
  }
}

// reducers
const initialState = {
  selectedIndex: -1,
  inEdit: undefined, // keep new and modified team info
  teams: undefined
}
const reducer = (state = initialState, action) => {
  const {type, payload} = action

  switch (type) {
    case ADD_RACER: {
      let nextState = {...state, inEdit: state.inEdit || { racers: state.teams[state.selectedIndex].racers }}
      nextState.inEdit.racers.push({...payload.racer, toAdd: true})
      return nextState
    }
    case REMOVE_RACER: {
      let nextState = {...state, inEdit: state.inEdit || { racers: state.teams[state.selectedIndex].racers }}
      nextState.inEdit.racers.forEach(function (racer, index) {
        if (racer.id === payload.id) {
          if (racer.toAdd) {
            nextState.inEdit.racers.splice(index, 1)
          } else {
            racer.toRemove = !payload.toRestore
          }
        }
      })
      return nextState
    }
    case CANCEL_EDIT: {
      let nextState = {...state, inEdit: undefined}
      if (!nextState.teams[nextState.teams.length - 1].id) {
        nextState.selectedIndex = -1
        nextState.teams.pop()
      }
      return nextState
    }
    case CREATE_TEAM: {
      let nextState = {...state, selectedIndex: state.teams.length}
      nextState.teams.push({})
      return nextState
    }
    case EDIT_TEAM: {
      let nextState = {...state, inEdit: state.inEdit || { racers: state.teams[state.selectedIndex].racers }}
      nextState.inEdit[payload.field] = payload.value
      return nextState
    }
    case GET_TEAMS: {
      return {...state, teams: payload.teams}
    }
    case SELECT_TEAM: {
      let nextState = {...state, selectedIndex: payload.selectedIndex, inEdit: undefined}
      if (payload.team) {
        nextState.teams[payload.selectedIndex] = {...payload.team, upToDate: true}
      }
      return nextState
    }
    case SUBMIT_TEAM: {
      let nextState = {...state, inEdit: undefined}
      if (payload.team) {
        nextState.teams[payload.selectedIndex] = {...payload.team, upToDate: true}
      }
      return nextState
    }
    case TEAM_ERR: {
      return {...state, error: payload.error}
    }
  }
  return state
}

export default reducer
