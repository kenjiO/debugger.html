/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow
declare var describe: (name: string, func: () => void) => void;
declare var it: (desc: string, func: () => void) => void;
declare var expect: (value: any) => any;

import {
  getBreakpointsForSource,
  initialBreakpointsState
} from "../breakpoints";
import * as I from "immutable";

function initializeStateWith(data) {
  /// const mappedData = I.Map(data);
  const state = initialBreakpointsState();
  /// return state.set("breakpoints", mappedData);
  state.breakpoints = data;
  return state;
}

describe("Breakpoints Selectors", () => {
  it("it gets a breakpoint for an original source", () => {
    const sourceId = "server1.conn1.child1/source1/originalSource";
   ///const matchingBreakpoints = { id1: { location: { sourceId } } };
    const matchingBreakpoints = { id1: {
      id: "id1",
      location: {
        sourceId: sourceId,
        line: 1
      },
      generatedLocation: {
        sourceId: sourceId,
        line: 1
      },
      astLocation: {
        name: sourceId,
        offset: {
          line: 1
        }
      },
      loading: false,
      disabled: false,
      hidden: false,
      text: "string",
      originalText: "string",
      condition: null
    }};

    /// const otherBreakpoints = {
    ///  id2: { location: { sourceId: "not-this-source" } }
    /// };
    const otherBreakpoints = { id2: {
      id: "id2",
      location: {
        sourceId: "not-this-source",
        line: 2
      },
      generatedLocation: {
        sourceId: "not-this-source",
        line: 2
      },
      astLocation: {
        name: "not-this-source",
        offset: {
          line: 2
        }
      },
      loading: false,
      disabled: false,
      hidden: false,
      text: "",
      originalText: "",
      condition: null
    }};

    const data = {
      ...matchingBreakpoints,
      ...otherBreakpoints
    };

    const breakpoints = initializeStateWith(data);

    expect(getBreakpointsForSource({ breakpoints }, sourceId)).toEqual(
      I.Map(matchingBreakpoints)
    );
  });

  it("it gets a breakpoint for a generated source", () => {
    const generatedSourceId = "random-source";
    /// const matchingBreakpoints = {
    ///   id1: {
    ///     location: { sourceId: "original-source-id-1" },
    ///     generatedLocation: { sourceId: generatedSourceId }
    ///   }
    /// };
    const matchingBreakpoints = { id1: {
      id: "id1",
      location: {
        sourceId: "original-source-id-1",
        line: 1
      },
      generatedLocation: {
        sourceId: generatedSourceId,
        line: 1
      },
      astLocation: {
        name: "original-source-id-1",
        offset: {
          line: 1
        }
      },
      loading: false,
      disabled: false,
      hidden: false,
      text: "string",
      originalText: "string",
      condition: null
    }};

    /// const otherBreakpoints = {
    ///   id2: {
    ///     location: { sourceId: "original-source-id-2" },
    ///     generatedLocation: { sourceId: "not-this-source" }
    ///   }
    /// };
    const otherBreakpoints = { id2: {
      id: "id2",
      location: {
        sourceId: "original-source-id-2",
        line: 1
      },
      generatedLocation: {
        sourceId: "not-this-source",
        line: 1
      },
      astLocation: {
        name: "original-source-id-2",
        offset: {
          line: 1
        }
      },
      loading: false,
      disabled: false,
      hidden: false,
      text: "string",
      originalText: "string",
      condition: null
    }};

    const data = {
      ...matchingBreakpoints,
      ...otherBreakpoints
    };

    const breakpoints = initializeStateWith(data);

    expect(getBreakpointsForSource({ breakpoints }, generatedSourceId)).toEqual(
      I.Map(matchingBreakpoints)
    );
  });
});
