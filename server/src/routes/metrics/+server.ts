import {identityCount, roomCount} from "$lib/server/services/redis";
import {activeUserCount} from "$lib/server/services/livekit";



export const GET = async () => {
  const metrics = `
# TYPE jam_rooms_total counter
jam_rooms_total ${await roomCount()}
# TYPE jam_identities_total counter
jam_identities_total ${await identityCount()}
# TYPE jam_users_active gauge
jam_users_active ${await activeUserCount()}
`;


  return new Response(metrics, {headers: {
'Content-Type': 'text/plain; version=0.0.4',
    }})
}
