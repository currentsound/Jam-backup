<script lang="ts">
import Room from './Room.svelte';
import {importRoomIdentity} from '../jam-core';
import StartFromURL from './StartFromURL.svelte';

  export let roomId; // truthy
  export let newRoom;
  export let roomIdentity;
  export let roomIdentityKeys;
  export let onError;
  export let autoCreate;
  export let uxConfig;

  isLoading = isLoading || _roomId === null;

  // import room identity
  // this has to be done BEFORE creating new room so that we can be moderator
  let importIdentityPromise = useMemo(() => {
    if (roomIdentity || roomIdentityKeys) {
      return importRoomIdentity(roomId, {
        ...roomIdentityKeys,
        info: roomIdentity,
      });
    }
  }, [roomId, roomIdentity, roomIdentityKeys]);

  // if room does not exist && autoCreate is on, try to create new one
  let shouldCreate = !hasRoom && autoCreate && !isLoading;
  let [autoCreateLoading, autoCreateError] = useCreateRoom({
    roomId,
    newRoom,
    shouldCreate,
    promiseToAwait: importIdentityPromise,
    onSuccess: () => enterRoom(roomId),
  });

  if (isLoading) return null;

  if (shouldCreate && autoCreateLoading) return null;

  if (roomId.length < 4 || (shouldCreate && autoCreateError)) {
    return typeof onError === 'function'
      ? createElement(onError, {roomId, error: {createRoom: true}})
      : onError || <Error />;
  }

</script>
{#if hasRoom}
    <Room key={roomId} {...{room, roomId, uxConfig}} />
{:else}
    <StartFromURL {...{roomId, newRoom}} />;
{/if}

function useCreateRoom({
  roomId,
  shouldCreate,
  newRoom,
  promiseToAwait,
  onSuccess,
}) {
  const [, {createRoom}] = useJam();
  let [isError, setError] = useState(false);
  let [isLoading, setLoading] = useState(true);
  useEffect(() => {
    if (roomId && shouldCreate) {
      (async () => {
        await promiseToAwait;
        let ok = await createRoom(roomId, newRoom);
        setLoading(false);
        if (ok) onSuccess?.();
        else setError(true);
      })();
    }
  }, [roomId, shouldCreate]);
  return [isLoading, isError];
}
