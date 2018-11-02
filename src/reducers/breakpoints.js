/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

/**
 * Breakpoints reducer
 * @module reducers/breakpoints
 */

import * as I from "immutable";
import makeRecord from "../utils/makeRecord";

import { isGeneratedId } from "devtools-source-map";
import { makeLocationId } from "../utils/breakpoint";

import type { XHRBreakpoint, Breakpoint, Location } from "../types";
import type { Action, DonePromiseAction } from "../actions/types";
import type { Record } from "../utils/makeRecord";

///export type BreakpointsMap = I.Map<string, Breakpoint>;
export type BreakpointsMap = { [string]: Breakpoint };
export type XHRBreakpointsList = I.List<XHRBreakpoint>;

export type BreakpointsState = {
  breakpoints: BreakpointsMap,
  xhrBreakpoints: XHRBreakpointsList
};

///function initialBreakpointsState(xhrBreakpoints?: any[] = []
/// ): Record<BreakpointsState> {
///   return makeRecord(
///     ({
///       breakpoints: I.Map(),
///       xhrBreakpoints: I.List(xhrBreakpoints),
///       breakpointsDisabled: false
///     }: BreakpointsState)
///   )();
/// }

export function initialBreakpointsState(
  xhrBreakpoints?: any[] = []
): BreakpointsState {
  return {
    breakpoints: {},
    xhrBreakpoints: I.List(xhrBreakpoints),
    breakpointsDisabled: false
  };
}

function update(
  ///state: Record<BreakpointsState> = initialBreakpointsState(),
  state: BreakpointsState = initialBreakpointsState(),
  action: Action
): BreakpointsState {
  switch (action.type) {
    case "ADD_BREAKPOINT": {
      return addBreakpoint(state, action);
    }

    case "SYNC_BREAKPOINT": {
      return syncBreakpoint(state, action);
    }

    case "ENABLE_BREAKPOINT": {
      return addBreakpoint(state, action);
    }

    case "DISABLE_BREAKPOINT": {
      return updateBreakpoint(state, action);
    }

    case "DISABLE_ALL_BREAKPOINTS": {
      return updateAllBreakpoints(state, action);
    }

    case "ENABLE_ALL_BREAKPOINTS": {
      return updateAllBreakpoints(state, action);
    }

    case "SET_BREAKPOINT_CONDITION": {
      return updateBreakpoint(state, action);
    }

    case "REMOVE_BREAKPOINT": {
      return removeBreakpoint(state, action);
    }

    case "REMAP_BREAKPOINTS": {
      return remapBreakpoints(state, action);
    }

    case "NAVIGATE": {
      return initialBreakpointsState();
    }

    case "SET_XHR_BREAKPOINT": {
      return addXHRBreakpoint(state, action);
    }

    case "REMOVE_XHR_BREAKPOINT": {
      return removeXHRBreakpoint(state, action);
    }

    case "UPDATE_XHR_BREAKPOINT": {
      return updateXHRBreakpoint(state, action);
    }

    case "ENABLE_XHR_BREAKPOINT": {
      return updateXHRBreakpoint(state, action);
    }

    case "DISABLE_XHR_BREAKPOINT": {
      return updateXHRBreakpoint(state, action);
    }
  }

  return state;
}

function addXHRBreakpoint(state, action) {
  const { xhrBreakpoints } = state;
  const { breakpoint } = action;
  const { path, method } = breakpoint;

  const existingBreakpointIndex = state.xhrBreakpoints.findIndex(
    bp => bp.path === path && bp.method === method
  );

  if (existingBreakpointIndex === -1) {
    ///return state.set("xhrBreakpoints", xhrBreakpoints.push(breakpoint));
    //TODO make this immutable?
    state.xhrBreakpoints = xhrBreakpoints.push(breakpoint);
    return state.xhrBreakpoints;
  } else if (xhrBreakpoints.get(existingBreakpointIndex) !== breakpoint) {
    /// return state.set(
    ///   "xhrBreakpoints",
    ///   xhrBreakpoints.set(existingBreakpointIndex, breakpoint)
    /// );
    //TODO make this immutable?
    state.xhrBreakpoints = xhrBreakpoints.set(existingBreakpointIndex, breakpoint);
    return state.xhrBreakpoints;
  }

  return state;
}

function removeXHRBreakpoint(state, action) {
  const {
    breakpoint: { path, method }
  } = action;
  const { xhrBreakpoints } = state;

  const index = xhrBreakpoints.findIndex(
    bp => bp.path === path && bp.method === method
  );

  ///return state.set("xhrBreakpoints", xhrBreakpoints.delete(index));
  //TODO make this immutable?
  state.xhrBreakpoints = xhrBreakpoints.delete(index);
  return state.xhrBreakpoints;
}

function updateXHRBreakpoint(state, action) {
  const { breakpoint, index } = action;
  const { xhrBreakpoints } = state;
  ///return state.set("xhrBreakpoints", xhrBreakpoints.set(index, breakpoint));
  //TODO make this immutable?
  state.xhrBreakpoints = xhrBreakpoints.set(index, breakpoint);
  return state.xhrBreakpoints;
}

function setBreakpoint(state, locationId, breakpoint) {
  const newState = {
    ...state,
    breakpoints: { ...state.breakpoints, [locationId]: breakpoint }
  };
  return newState;
}

function unsetBreakpoint(state, locationId) {
  const newBreakpoints = {...state.breakpoints};
  delete newBreakpoints[locationId];
  const newState = {
    ...state,
    breakpoints: { ...newBreakpoints }
  };
  return newState;
}

function addBreakpoint(state, action): BreakpointsState {
  if (action.status === "start" && action.breakpoint) {
    const { breakpoint } = action;
    const locationId = makeLocationId(breakpoint.location);
    /// return state.setIn(["breakpoints", locationId], breakpoint);
    return setBreakpoint(state, locationId, breakpoint);
  }

  // when the action completes, we can commit the breakpoint
  if (action.status === "done") {
    const { value } = ((action: any): DonePromiseAction);
    return syncBreakpoint(state, value);
  }

  // Remove the optimistic update
  if (action.status === "error" && action.breakpoint) {
    const locationId = makeLocationId(action.breakpoint.location);
    /// return state.deleteIn(["breakpoints", locationId]);
    return unsetBreakpoint(state, locationId);
  }

  return state;
}

function syncBreakpoint(state, data): BreakpointsState {
  const { breakpoint, previousLocation } = data;

  if (previousLocation) {
    ///state = state.deleteIn(["breakpoints", makeLocationId(previousLocation)]);
    state = { ...state };
    state.breakpoints = { ...state.breakpoints };
    delete state.breakpoints[makeLocationId(previousLocation)];
  }

  if (!breakpoint) {
    return state;
  }

  const locationId = makeLocationId(breakpoint.location);
  ///return state.setIn(["breakpoints", locationId], breakpoint);
  return setBreakpoint(state, locationId, breakpoint);
}

function updateBreakpoint(state, action): BreakpointsState {
  const { breakpoint } = action;
  const locationId = makeLocationId(breakpoint.location);
  ///return state.setIn(["breakpoints", locationId], breakpoint);
  return setBreakpoint(state, locationId, breakpoint);
}

function updateAllBreakpoints(state, action): BreakpointsState {
  const { breakpoints } = action;
  state = {
    ...state,
    breakpoints: { ...state.breakpoints }
  };
  breakpoints.forEach(breakpoint => {
    const locationId = makeLocationId(breakpoint.location);
    ///state = state.setIn(["breakpoints", locationId], breakpoint);
    state.breakpoints[locationId] = breakpoint;
  });
  return state;
}

function remapBreakpoints(state, action): BreakpointsState {
  const breakpoints = action.breakpoints.reduce(
    (updatedBreakpoints, breakpoint) => {
      const locationId = makeLocationId(breakpoint.location);
      return { ...updatedBreakpoints, [locationId]: breakpoint };
    },
    {}
  );

  ///return state.set("breakpoints", I.Map(breakpoints));
  return { ...state, breakpoints: breakpoints };
}

function removeBreakpoint(state, action): BreakpointsState {
  const { breakpoint } = action;
  const id = makeLocationId(breakpoint.location);
  ///return state.deleteIn(["breakpoints", id]);
  return unsetBreakpoint(state, id);
}

// Selectors
// TODO: these functions should be moved out of the reducer

///type OuterState = { breakpoints: Record<BreakpointsState> };
type OuterState = { breakpoints: BreakpointsState };

export function getBreakpoints(state: OuterState) {
  //TODO make this immutable?
  return state.breakpoints.breakpoints;
}

export function getBreakpoint(
  state: OuterState,
  location: Location
): ?Breakpoint {
  const breakpoints = getBreakpoints(state);
  ///return breakpoints.get(makeLocationId(location));
  ///TODO make the following unmutable?
  return breakpoints[makeLocationId(location)];
}

export function getBreakpointsDisabled(state: OuterState): boolean {
  ///return state.breakpoints.breakpoints.every(x => x.disabled);
  const breakpoints = (Object.values(state.breakpoints.breakpoints): any);
  return breakpoints.every(breakpoint => breakpoint.disabled);
}

export function getBreakpointsLoading(state: OuterState): boolean {
  ///const breakpoints = getBreakpoints(state);
  ///const isLoading = !!breakpoints
  ///  .valueSeq()
  ///  .filter(bp => bp.loading)
  ///  .first();
  const breakpoints = (Object.values(state.breakpoints.breakpoints): any);
  const isLoading = breakpoints.some(breakpoint => breakpoint.loading);
  return breakpoints.size > 0 && isLoading;
}

export function getBreakpointsForSource(state: OuterState, sourceId: string): BreakpointsMap {
  if (!sourceId) {
    ///return I.Map();
    return {};
  }

  const isGeneratedSource = isGeneratedId(sourceId);
  const breakpoints = getBreakpoints(state);

  ///return breakpoints.filter(bp => {
  ///  const location = isGeneratedSource
  ///    ? bp.generatedLocation || bp.location
  ///    : bp.location;
  ///  return location.sourceId === sourceId;
  ///});

  const breakpointsForSource = {};
  const keys = Object.keys(breakpoints);
  keys.forEach(key => {
    const bp = breakpoints[key];
    const location = isGeneratedSource
    ? bp.generatedLocation || bp.location
    : bp.location;
    if (location.sourceId === sourceId) {
      breakpointsForSource[key] = { ...bp };
    }
  });
  return breakpointsForSource;
}

export function getBreakpointForLine(
  state: OuterState,
  sourceId: string,
  line: number | null
): ?Breakpoint {
  if (!sourceId) {
    ///return I.Map();
    return undefined;
  }
  const breakpointsMap = getBreakpointsForSource(state, sourceId);
  const breakpoints = (Object.values(breakpointsMap): any);
  return breakpoints.find(breakpoint => breakpoint.location.line === line);
}

export function getHiddenBreakpoint(state: OuterState): ?Breakpoint {
  // return getBreakpoints(state)
  //   .valueSeq()
  //   .filter(breakpoint => breakpoint.hidden)
  //   .first();

  const breakpoints = (Object.values(state.breakpoints.breakpoints): any);
  return breakpoints.find(bp => bp.hidden);
}

export function getHiddenBreakpointLocation(state: OuterState): ?Location {
  const hiddenBreakpoint = getHiddenBreakpoint(state);
  if (!hiddenBreakpoint) {
    return null;
  }
  return hiddenBreakpoint.location;
}

export default update;
