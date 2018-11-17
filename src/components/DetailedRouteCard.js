import React from "react";
import { DetailedListItem, Icon, DetailedRoute } from "./StyledComponents";

export default function DetailedRouteCard(props) {
  const { stations, lines, line, step } = props;
  const stopsDOM = stations ? (
    <span>
      (After {stations} {stations > 1 ? `stops` : `stop`} ) >{" "}
    </span>
  ) : null;

  return (
    <DetailedListItem>
      <Icon color={lines[line].color}>{line}</Icon>
      <DetailedRoute>
        {step.from} > {stopsDOM} {step.to}
      </DetailedRoute>
    </DetailedListItem>
  );
}
