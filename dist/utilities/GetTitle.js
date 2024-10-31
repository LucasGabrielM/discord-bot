export function getTitle(client, track) {
    if (client.config.player.AVOID_SUSPEND)
        return track && track.title ? track.title : 'Unknown';
    return track && track.title ? `[${track.title}](${track.uri})` : `[Unknown](https://what.com)`;
}
