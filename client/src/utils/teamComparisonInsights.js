import { TEAM_COMPARISON_STYLE_METRICS } from './teamComparisonProfile';
import { toNumber } from './playerMetrics';

function getWinner(leftValue, rightValue, threshold = 1.5) {
  const delta = toNumber(leftValue) - toNumber(rightValue);

  if (Math.abs(delta) < threshold) {
    return {
      winner: null,
      delta
    };
  }

  return {
    winner: delta > 0 ? 'left' : 'right',
    delta
  };
}

function describeMetricEdge(left, right, label, sentenceBuilder, threshold = 3) {
  const result = getWinner(left.value, right.value, threshold);

  if (!result.winner) {
    return `${left.name} and ${right.name} are close on ${label.toLowerCase()}.`;
  }

  const winner = result.winner === 'left' ? left : right;
  const loser = result.winner === 'left' ? right : left;
  return sentenceBuilder(winner, loser, Math.abs(Math.round(result.delta)));
}

function buildHeadlineInsights(leftProfile, rightProfile) {
  const left = leftProfile.identity.name;
  const right = rightProfile.identity.name;
  const metrics = [
    {
      delta: toNumber(leftProfile.strength.lineRatings.midfield) - toNumber(rightProfile.strength.lineRatings.midfield),
      build: (winner, loser) => `${winner} hold the stronger midfield platform in the current XI.`
    },
    {
      delta: toNumber(leftProfile.strength.depthScore) - toNumber(rightProfile.strength.depthScore),
      build: (winner, loser) => `${winner} carry the better squad depth and bench stability right now.`
    },
    {
      delta: toNumber(leftProfile.style.creativity) - toNumber(rightProfile.style.creativity),
      build: (winner, loser) => `${winner} bring the sharper creation profile between the lines.`
    },
    {
      delta: toNumber(leftProfile.style.possessionControl) - toNumber(rightProfile.style.possessionControl),
      build: (winner, loser) => `${winner} project more buildup control and retention.`
    },
    {
      delta: toNumber(leftProfile.style.directness) - toNumber(rightProfile.style.directness),
      build: (winner, loser) => `${winner} look more vertical and direct in how the attack is built.`
    },
    {
      delta: toNumber(leftProfile.style.defensiveStability) - toNumber(rightProfile.style.defensiveStability),
      build: (winner, loser) => `${winner} have the firmer defensive base and structure.`
    }
  ]
    .filter((metric) => Math.abs(metric.delta) >= 3)
    .sort((leftMetric, rightMetric) => Math.abs(rightMetric.delta) - Math.abs(leftMetric.delta))
    .slice(0, 3)
    .map((metric) => metric.build(metric.delta > 0 ? left : right, metric.delta > 0 ? right : left));

  if (metrics.length) {
    return metrics;
  }

  return [`${left} and ${right} project closely overall, with the clearest differences showing up in specific tactical and depth details.`];
}

function buildOverviewInsights(leftProfile, rightProfile) {
  return [
    describeMetricEdge(
      {
        name: leftProfile.identity.name,
        value: leftProfile.strength.teamRating
      },
      {
        name: rightProfile.identity.name,
        value: rightProfile.strength.teamRating
      },
      'team rating',
      (winner, loser) => `${winner.name} rate higher overall in the current best-XI team model than ${loser.name}.`
    ),
    describeMetricEdge(
      {
        name: leftProfile.identity.name,
        value: leftProfile.strength.bestXIRating
      },
      {
        name: rightProfile.identity.name,
        value: rightProfile.strength.bestXIRating
      },
      'best XI rating',
      (winner, loser) => `${winner.name} show the stronger current XI once the formation fit model is applied.`
    ),
    describeMetricEdge(
      {
        name: leftProfile.identity.name,
        value: leftProfile.strength.depthScore
      },
      {
        name: rightProfile.identity.name,
        value: rightProfile.strength.depthScore
      },
      'depth',
      (winner, loser) => `${winner.name} look better insulated by the bench and supporting depth than ${loser.name}.`
    )
  ];
}

function buildTacticalInsights(leftProfile, rightProfile) {
  const left = leftProfile.identity.name;
  const right = rightProfile.identity.name;
  const output = [];
  const styleRows = [
    {
      key: 'possessionControl',
      sentence: (winner, loser) => `${winner} should hold more of the tempo through stronger possession control.`
    },
    {
      key: 'creativity',
      sentence: (winner, loser) => `${winner} have the cleaner advanced creation profile.`
    },
    {
      key: 'wideThreat',
      sentence: (winner, loser) => `${winner} offer more support and threat from the outside lanes.`
    },
    {
      key: 'centralThreat',
      sentence: (winner, loser) => `${winner} lean more heavily on central creation and striker support.`
    },
    {
      key: 'directness',
      sentence: (winner, loser) => `${winner} are set up for a more vertical attacking game.`
    },
    {
      key: 'defensiveStability',
      sentence: (winner, loser) => `${winner} carry the more stable defensive platform.`
    }
  ]
    .map((metric) => ({
      ...metric,
      delta: toNumber(leftProfile.style[metric.key]) - toNumber(rightProfile.style[metric.key])
    }))
    .filter((metric) => Math.abs(metric.delta) >= 4)
    .sort((leftMetric, rightMetric) => Math.abs(rightMetric.delta) - Math.abs(leftMetric.delta));

  styleRows.slice(0, 3).forEach((metric) => {
    output.push(metric.sentence(metric.delta > 0 ? left : right, metric.delta > 0 ? right : left));
  });

  if (leftProfile.identity.detectedFormation !== rightProfile.identity.detectedFormation) {
    output.push(
      `${left} project best in ${leftProfile.identity.detectedFormation}, while ${right} look cleaner in ${rightProfile.identity.detectedFormation}.`
    );
  }

  if (leftProfile.identity.styleTag !== rightProfile.identity.styleTag) {
    output.push(`${left} read more ${leftProfile.identity.styleTag}, whereas ${right} profile closer to a ${rightProfile.identity.styleTag} team.`);
  }

  return output.slice(0, 4);
}

function buildDepthInsights(leftProfile, rightProfile) {
  const left = leftProfile.identity.name;
  const right = rightProfile.identity.name;
  const output = [];

  if (Math.abs(toNumber(leftProfile.strength.depthScore) - toNumber(rightProfile.strength.depthScore)) >= 3) {
    output.push(
      `${toNumber(leftProfile.strength.depthScore) > toNumber(rightProfile.strength.depthScore) ? left : right} carry the stronger full-squad depth once starter-to-backup drop-offs are factored in.`
    );
  }

  const leftFragile = leftProfile.squadHealth.fragilePositions[0];
  const rightFragile = rightProfile.squadHealth.fragilePositions[0];

  if (leftFragile) {
    output.push(`${left} show their clearest fragility at ${leftFragile.position}, where the drop-off is ${leftFragile.dropoff} OVR points.`);
  }

  if (rightFragile) {
    output.push(`${right} show their clearest fragility at ${rightFragile.position}, where the drop-off is ${rightFragile.dropoff} OVR points.`);
  }

  const leftMissing = leftProfile.roleCoverage.missing[0];
  const rightMissing = rightProfile.roleCoverage.missing[0];

  if (leftMissing || rightMissing) {
    output.push(
      `${left}${leftMissing ? ` are missing ${leftMissing.label.toLowerCase()}` : ' have fuller role coverage'}, while ${right}${rightMissing ? ` are missing ${rightMissing.label.toLowerCase()}` : ' have fuller role coverage'}.`
    );
  }

  return output.slice(0, 4);
}

function buildRecruitmentInsights(leftProfile, rightProfile) {
  const left = leftProfile.identity.name;
  const right = rightProfile.identity.name;
  const leftNeed = leftProfile.recruitment.priorities[0];
  const rightNeed = rightProfile.recruitment.priorities[0];
  const output = [];

  if (leftNeed) {
    output.push(`${left} most clearly need ${leftNeed.title.toLowerCase()}.`);
  }

  if (rightNeed) {
    output.push(`${right} most clearly need ${rightNeed.title.toLowerCase()}.`);
  }

  if (leftProfile.strength.bestXIRating > rightProfile.strength.bestXIRating && leftProfile.strength.depthScore < rightProfile.strength.depthScore) {
    output.push(`${left} are closer on top-end XI quality, but ${right} are better covered across the squad.`);
  }

  if (rightProfile.strength.bestXIRating > leftProfile.strength.bestXIRating && rightProfile.strength.depthScore < leftProfile.strength.depthScore) {
    output.push(`${right} are closer on top-end XI quality, but ${left} are better covered across the squad.`);
  }

  return output.slice(0, 4);
}

export function buildTeamComparisonInsights(leftProfile, rightProfile) {
  return {
    headline: buildHeadlineInsights(leftProfile, rightProfile),
    overview: buildOverviewInsights(leftProfile, rightProfile),
    tactical: buildTacticalInsights(leftProfile, rightProfile),
    depth: buildDepthInsights(leftProfile, rightProfile),
    recruitment: buildRecruitmentInsights(leftProfile, rightProfile)
  };
}

export function getComparisonWinner(leftValue, rightValue, threshold = 1.5) {
  return getWinner(leftValue, rightValue, threshold).winner;
}

export function buildStyleComparisonRows(leftProfile, rightProfile) {
  return TEAM_COMPARISON_STYLE_METRICS.map((metric) => ({
    ...metric,
    leftValue: Math.round(toNumber(leftProfile.style[metric.key])),
    rightValue: Math.round(toNumber(rightProfile.style[metric.key])),
    winner: getWinner(leftProfile.style[metric.key], rightProfile.style[metric.key], 2.5).winner
  }));
}
