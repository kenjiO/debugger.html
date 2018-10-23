/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

 // @flow

 import type { Breakpoint } from "../../types";
 import type { BreakpointsMap } from "../../selectors";

 export default function remapLocations(breakpoints: Breakpoint[], sourceId: string, sourceMaps: Object) {
  const sourceBreakpoints:BreakpointsMap = breakpoints.map(async breakpoint => {
    if (breakpoint.location.sourceId !== sourceId) {
      return breakpoint;
    }
    const location = await sourceMaps.getOriginalLocation(breakpoint.location);
    return { ...breakpoint, location };
  });

  return Promise.all(sourceBreakpoints.valueSeq());
}
