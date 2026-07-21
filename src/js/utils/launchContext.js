/* launchContext.js — where a mini-game was opened from */

// `?from=` decides where a game's back button and completion CTA lead:
//   from=mission    — a Mission Flow step; finish back into its Reward stage
//   from=activities — a replay from the Activities Hub
//   neither         — the linear journey; the page picks its own next screen
export function launchContext(stateId) {
  const params = new URLSearchParams(location.search);
  const missionId = params.get('mission');

  return {
    fromActivities: params.get('from') === 'activities',
    fromMission:    params.get('from') === 'mission',
    missionId,
    missionsHref:     `missions.html?state=${stateId}`,
    // Finishing a mission returns into the Mission Flow's Reward stage, not the hub.
    missionsDoneHref: `mission.html?state=${stateId}&mission=${missionId}&stage=reward`,
  };
}
