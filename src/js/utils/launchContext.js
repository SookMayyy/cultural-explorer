// js/utils/launchContext.js — where a mini-game was opened from.

// The four mini-games (activity, scramble, guess, quiz) are each reachable from
// three places, and the `?from=` tag decides where their back button and
// completion CTA lead:
//   • from=mission     — a Mission Flow step; finish back into its Reward stage
//   • from=activities  — a replay from the Activities Hub; finish back at the hub
//   • neither          — the linear journey; the page picks its own next screen
//
// Only the mission hrefs are shared: each page builds its own activities/journey
// href (they differ — e.g. guess drops the ?state=).
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
