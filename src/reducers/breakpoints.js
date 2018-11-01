/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

/**
 * Breakpoints reducer
 * @module reducers/breakpoints
 */

import * as I from "immutable";
// / import makeRecord from "../utils/makeRecord";

import { isGeneratedId } from "devtools-source-map";
import { makeLocationId } from "../utils/breakpoint";

import type { XHRBreakpoint, Breakpoint, Location } from "../types";
import type { Action, DonePromiseAction } from "../actions/types";
// / import type { Record } from "../utils/makeRecord";

// / export type BreakpointsMap = I.Map<string, Breakpoint>;
export type BreakpointsMap = { [string]: Breakpoint };

export type XHRBreakpointsList = I.List<XHRBreakpoint>;
// export type XHRBreakpointsList = XHRBreakpoint[];

export type BreakpointsState = {
  breakpoints: BreakpointsMap,
  xhrBreakpoints: XHRBreakpointsList
};

// /function initialBreakpointsState(xhrBreakpoints?: any[] = []
// / ): Record<BreakpointsState> {
// /   return makeRecord(
// /     ({
// /       breakpoints: I.Map(),
// /       xhrBreakpoints: I.List(xhrBreakpoints),
// /       breakpointsDisabled: false
// /     }: BreakpointsState)
// /   )();
// / }

export function initialBreakpointsState(
  xhrBreakpoints?: any[] = []
): BreakpointsState {
  return {
    breakpoints: {},
    xhrBreakpoints: I.List(xhrBreakpoints),
    breakpointsDisabled: false
  };
}

function update(state: any = initialBreakpointsState(), action: Action) {
  let r;
  switch (action.type) {
    case "ADD_BREAKPOINT": {
      // debugger;
      r = addBreakpoint(state, action);
      // rs = r.toJS();
      return r;
    }

    case "SYNC_BREAKPOINT": {
      // debugger;
      r = syncBreakpoint(state, action);
      // rs = r.toJS();
      return r;
    }

    case "ENABLE_BREAKPOINT": {
      // debugger;
      r = addBreakpoint(state, action);
      // rs = r.toJS();
      return r;
    }

    case "DISABLE_BREAKPOINT": {
      // debugger;
      r = updateBreakpoint(state, action);
      // rs = r.toJS();
      return r;
    }

    case "DISABLE_ALL_BREAKPOINTS": {
      // debugger;
      r = updateAllBreakpoints(state, action);
      // rs = r.toJS();
      return r;
    }

    case "ENABLE_ALL_BREAKPOINTS": {
      // debugger;
      r = updateAllBreakpoints(state, action);
      // rs = r.toJS();
      return r;
    }

    case "SET_BREAKPOINT_CONDITION": {
      // debugger;
      r = updateBreakpoint(state, action);
      // rs = r.toJS();
      return r;
    }

    case "REMOVE_BREAKPOINT": {
      // debugger;
      r = removeBreakpoint(state, action);
      // rs = r.toJS();
      return r;
    }

    case "REMAP_BREAKPOINTS": {
      // debugger;
      r = remapBreakpoints(state, action);
      // rs = r.toJS();
      return r;
    }

    case "NAVIGATE": {
      // debugger;
      r = initialBreakpointsState();
      // rs = r.toJS();
      return r;
    }

    case "SET_XHR_BREAKPOINT": {
      // debugger;
      r = addXHRBreakpoint(state, action);
      // rs = r.toJS();
      return r;
    }

    case "REMOVE_XHR_BREAKPOINT": {
      // debugger;
      r = removeXHRBreakpoint(state, action);
      // rs = r.toJS();
      return r;
    }

    case "UPDATE_XHR_BREAKPOINT": {
      // debugger;
      r = updateXHRBreakpoint(state, action);
      // rs = r.toJS();
      return r;
    }

    case "ENABLE_XHR_BREAKPOINT": {
      r = updateXHRBreakpoint(state, action);
      // rs = r.toJS();
      return r;
    }

    case "DISABLE_XHR_BREAKPOINT": {
      r = updateXHRBreakpoint(state, action);
      // rs = r.toJS();
      return r;
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
    return state.set("xhrBreakpoints", xhrBreakpoints.push(breakpoint));
  } else if (xhrBreakpoints.get(existingBreakpointIndex) !== breakpoint) {
    return state.set(
      "xhrBreakpoints",
      xhrBreakpoints.set(existingBreakpointIndex, breakpoint)
    );
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

  return state.set("xhrBreakpoints", xhrBreakpoints.delete(index));
}

function updateXHRBreakpoint(state, action) {
  const { breakpoint, index } = action;
  const { xhrBreakpoints } = state;
  return state.set("xhrBreakpoints", xhrBreakpoints.set(index, breakpoint));
}

function setBreakpoint(state, locationId, breakpoint) {
  const r = {
    ...state,
    breakpoints: { ...state.breakpoints, [locationId]: breakpoint }
  };
  return r;
}

function addBreakpoint(state, action) {
  let r;
  if (action.status === "start" && action.breakpoint) {
    const { breakpoint } = action;
    const locationId = makeLocationId(breakpoint.location);
    // / return state.setIn(["breakpoints", locationId], breakpoint);
    r = setBreakpoint(state, locationId, breakpoint);
    return r;
  }

  // when the action completes, we can commit the breakpoint
  if (action.status === "done") {
    const { value } = ((action: any): DonePromiseAction);
    r = syncBreakpoint(state, value);
    return r;
  }

  // Remove the optimistic update
  if (action.status === "error" && action.breakpoint) {
    const locationId = makeLocationId(action.breakpoint.location);
    // / return state.deleteIn(["breakpoints", locationId]);
    r = { ...state };
    delete r[locationId];
    return r;
  }

  return state;
}

function syncBreakpoint(currentState, data) {
  const state = { ...currentState };
  const { breakpoint, previousLocation } = data;

  if (previousLocation) {
    // / state =
    // / state.deleteIn(["breakpoints", makeLocationId(previousLocation)]);
    delete state[makeLocationId(previousLocation)];
  }

  if (!breakpoint) {
    return state;
  }

  const locationId = makeLocationId(breakpoint.location);
  // / return state.setIn(["breakpoints", locationId], breakpoint);
  const r = setBreakpoint(state, locationId, breakpoint);
  return r;
}

function updateBreakpoint(state, action) {
  const { breakpoint } = action;
  const locationId = makeLocationId(breakpoint.location);
  // / return state.setIn(["breakpoints", locationId], breakpoint);
  const r = setBreakpoint(state, locationId, breakpoint);
  return r;
}

function updateAllBreakpoints(state, action) {
  const { breakpoints } = action;
  const newState = { ...state };

  breakpoints.forEach(breakpoint => {
    const locationId = makeLocationId(breakpoint.location);
    // / return state.setIn(["breakpoints", locationId], breakpoint);
    newState[locationId] = breakpoint;
  });
  return newState;
}

function remapBreakpoints(state, action) {
  const breakpoints = action.breakpoints.reduce(
    (updatedBreakpoints, breakpoint) => {
      const locationId = makeLocationId(breakpoint.location);
      return { ...updatedBreakpoints, [locationId]: breakpoint };
    },
    {}
  );

  // / return state.set("breakpoints", I.Map(breakpoints));
  const r = { ...state, breakpoints: breakpoints };
  return r;
}

function removeBreakpoint(state, action) {
  const { breakpoint } = action;
  const id = makeLocationId(breakpoint.location);
  // // const return state.deleteIn(["breakpoints", id]);
  const r = { ...state, breakpoints: { ...state.breakpoints } };
  delete r.breakpoints[id];
  return r;
}

// Selectors
// TODO: these functions should be moved out of the reducer

// // type OuterState = { breakpoints: Record<BreakpointsState> };
type OuterState = { breakpoints: any };

export function getBreakpoints(state: OuterState) {
  return { ...state.breakpoints.breakpoints };
}

export function getBreakpoint(
  state: OuterState,
  location: Location
): ?Breakpoint {
  // / const breakpoints = getBreakpoints(state);
  // / return breakpoints.get(makeLocationId(location));
  const locationId = makeLocationId(location);
  const breakpoint = state.breakpoints.breakpoints[locationId];
  if (breakpoint) {
    return { ...breakpoint };
  }
}

export function getBreakpointsDisabled(state: OuterState): boolean {
  // / return state.breakpoints.breakpoints.every(x => x.disabled);
  const breakpoints = [];
  Object.keys(state.breakpoints.breakpoints).forEach(function(key: string) {
    breakpoints.push(state.breakpoints.breakpoints[key]);
  });
  // const breakpoints = Object.values(state.breakpoints.breakpoints);
  return breakpoints.every(breakpoint => breakpoint.disabled);
}

export function getBreakpointsLoading(state: OuterState) {
  // const breakpoints = getBreakpoints(state);
  // / const isLoading = !!breakpoints
  // /   .valueSeq()
  // /   .filter(bp => bp.loading)
  // /   .first();
  // / return breakpoints.size > 0 && isLoading;

  // const breakpoints = Object.values(state.breakpoints.breakpoints);
  const breakpoints = [];
  Object.keys(state.breakpoints.breakpoints).forEach(function(key: string) {
    breakpoints.push(state.breakpoints.breakpoints[key]);
  });
  return breakpoints.some(breakpoint => breakpoint.loading);
}

export function getBreakpointsForSource(state: OuterState, sourceId: string) : Breakpoint[] {
  if (!sourceId) {
    // /return I.Map();
    return [];
  }

  const isGeneratedSource = isGeneratedId(sourceId);
  // /const breakpoints = getBreakpoints(state);
  // / return breakpoints.filter(bp => {
  // /   const location = isGeneratedSource
  // /     ? bp.generatedLocation || bp.location
  // /     : bp.location;
  // /   return location.sourceId === sourceId;
  // / });

  //const breakpoints = Object.values(state.breakpoints.breakpoints);
  const breakpoints = [];
  Object.keys(state.breakpoints.breakpoints).forEach(function(key: string) {
    breakpoints.push(state.breakpoints.breakpoints[key]);
  });

  return breakpoints.slice().filter(bp => {
    const location = isGeneratedSource
      ? bp.generatedLocation || bp.location
      : bp.location;
    return location.sourceId === sourceId;
  });
}

export function getBreakpointForLine(
  state: OuterState,
  sourceId: string,
  line: number | null
): ?Breakpoint {
  if (!sourceId) {
    // /return I.Map();
    return undefined;
  }
  const breakpoints = getBreakpointsForSource(state, sourceId);
  // / return breakpoints.find(breakpoint => breakpoint.location.line === line);
  const match = breakpoints.find(
    bp => bp.location.line === line
  );
  if (match) {
    return { ...match };
  }
}

export function getHiddenBreakpoint(state: OuterState) {
  // / return getBreakpoints(state)
  // /   .valueSeq()
  // /   .filter(breakpoint => breakpoint.hidden)
  // /   .first();

  //const breakpoints = state.breakpoints.breakpoints;
  const breakpoints = [];
  Object.keys(state.breakpoints.breakpoints).forEach(function(key: string) {
    breakpoints.push(state.breakpoints.breakpoints[key]);
  });

  const match = breakpoints.find(bp => bp.hidden);
  if (match) {
    return { ...match };
  }
}

export function getHiddenBreakpointLocation(state: OuterState) {
  const hiddenBreakpoint = getHiddenBreakpoint(state);
  if (!hiddenBreakpoint) {
    return null;
  }
  return hiddenBreakpoint.location;
}

export default update;
