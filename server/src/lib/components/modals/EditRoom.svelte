<script lang="ts">
import Modal from './Modal.svelte';
import {rawTimeZones} from '@vvo/tzdb';
import {mqp} from "$lib/client/stores/styles";

  export let close: () => void;

  let submitUpdate = async partialRoom => {
    updateRoom(roomId, {...room, ...partialRoom});
  };

  let name = $room.name;
  let description = $room.description;
  let color= $room.color || '#4B5563';
  let logoURI = $room.logoURI;
  let buttonURI =$room.buttonURI;
  let buttonText = $room.buttonText;
  let closed = $room.closed;
  let shareUrl = $room.shareUrl;

  let schedule = $room.schedule;
  let scheduleCandidate = {
    date: `${new Date().toISOString().split('T')[0]}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  };
  let showTimezoneSelect = false;
  let showRepeatSelect = false;

  let completeSchedule = () => {
    return scheduleCandidate?.date && scheduleCandidate?.time;
  };

  let handleScheduleChange = e => {
    setScheduleCandidate({
      ...scheduleCandidate,
      [e.target.name]: e.target.value,
    });
    console.log(scheduleCandidate);
  };

  let removeSchedule = e => {
    e.preventDefault();
    setSchedule(undefined);
    let schedule = undefined;

    submitUpdate({schedule});
  };

  let submitSchedule = e => {
    e.preventDefault();
    if (scheduleCandidate) {
      let schedule = scheduleCandidate;
      setSchedule(scheduleCandidate);
      submitUpdate({schedule});
    }
  };

  let submit = async e => {
    e.preventDefault();
    await submitUpdate({
      name,
      description,
      color,
      logoURI,
      buttonURI,
      buttonText,
      closed,
      shareUrl,
    });
    close();
  };

  const showAdvanced = !!(room.logoURI || room.color);

</script>
    <Modal close={close}>
      <h1>Room Settings</h1>
      <br />
      <div>
        <form onSubmit={submit}>
          <input
            class={mqp(
              'rounded placeholder-gray-300 bg-gray-50 w-full md:w-96'
            )}
            type="text"
            placeholder="Room topic"
            name="jam-room-topic"
            autoComplete="off"
            bind:value={name}
          />
          <br />
          <div class="p-2 text-gray-500 italic">
            Pick a topic to talk about.{' '}
            <span class="text-gray-400">(optional)</span>
          </div>
          <br />
          <textarea
            class={mqp(
              'rounded -mb-1 placeholder-gray-300 bg-gray-50 w-full md:w-full'
            )}
            placeholder="Room description"
            bind:value={description}
            name="jam-room-description"
            autoComplete="off"
            rows="2"
          ></textarea>
          <div class="p-2 text-gray-500 italic">
            Describe what this room is about.{' '}
            <span class="text-gray-400">
              (optional) (supports{' '}
              <a
                class="underline"
                href="https://www.markdownguide.org/cheat-sheet/"
                target="_blank"
                rel="noreferrer"
              >
                Markdown
              </a>
              )
            </span>{' '}
          </div>

          {#if !showAdvanced }
            <div class="p-2 text-gray-500 italic">
              <span onClick={() => setShowAdvanced(!showAdvanced)}>
                <svg
                  style={{cursor: 'pointer'}}
                  class="pb-1 h-5 w-5 inline-block"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="{2}"
                    d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
                  />
                </svg>
              </span>
            </div>
          {:else}
            <div>
              <br />
              <input
                class={mqp(
                  'rounded placeholder-gray-300 bg-gray-50 w-full md:w-full'
                )}
                type="text"
                placeholder="Logo URI"
                bind:value={logoURI}
                name="jam-room-logo-uri"
                autoComplete="off"
              />
              <div class="p-2 text-gray-500 italic">
                Set the URI for your logo.{' '}
                <span class="text-gray-400">(optional)</span>
              </div>

              <br />
              <input
                class="rounded w-44 h-12"
                type="color"
                bind:value={color}
                name="jam-room-color"
                autoComplete="off"
              />
              <div class="p-2 text-gray-500 italic">
                Set primary color for your Room.{' '}
                <span class="text-gray-400">(optional)</span>
              </div>

              <br />
              <input
                class={mqp(
                  'rounded placeholder-gray-400 bg-gray-50 w-full md:w-full'
                )}
                type="text"
                placeholder="Button URI"
                bind:value={buttonURI}
                name="jam-room-button-uri"
                autoComplete="off"
              />
              <div class="p-2 text-gray-500 italic">
                Set the link for the {`'call to action'`} button.{' '}
                <span class="text-gray-400">(optional)</span>
              </div>

              <br />
              <input
                class={mqp(
                  'rounded placeholder-gray-400 bg-gray-50 w-full md:w-96'
                )}
                type="text"
                placeholder="Button Text"
                value={buttonText}
                name="jam-room-button-text"
                autoComplete="off"
                onChange={e => {
                  setButtonText(e.target.value);
                }}
              />
              <div class="p-2 text-gray-500 italic">
                Set the text for the {`'call to action'`} button.{' '}
                <span class="text-gray-400">(optional)</span>
              </div>

              <br />
              <input
                class={mqp(
                  'rounded placeholder-gray-400 bg-gray-50 w-full md:w-96'
                )}
                type="text"
                placeholder="Share URL"
                value={shareUrl}
                name="jam-room-share-url"
                autoComplete="off"
                onChange={e => {
                  setShareUrl(e.target.value);
                }}
              />
              <div class="p-2 text-gray-500 italic">
                The URL used for sharing the room.
                <span class="text-gray-400">(optional)</span>
              </div>

              <br />
              <hr />
              <br />
              <input
                class="ml-2"
                type="checkbox"
                name="jam-room-closed"
                id="jam-room-closed"
                bind:checked={closed}
              />

              <label class="pl-3 ml-0.5" for="jam-room-closed">
                Close the room (experimental){' '}
                <div class="p-2 pl-9 text-gray-500">
                  Closed rooms can only be joined by moderators.
                  <br />
                  Everyone else sees the description and the&nbsp;
                  {`'call to action'`} button.
                </div>
              </label>
            </div>
          {/if}

          <div class="flex">
            <button
              onClick={submit}
              class="flex-grow mt-5 h-12 px-6 text-lg text-white bg-gray-600 rounded-lg focus:shadow-outline active:bg-gray-600 mr-2"
            >
              Update Room
            </button>
            <button
              onClick={close}
              class="mt-5 h-12 px-6 text-lg text-black bg-gray-100 rounded-lg focus:shadow-outline active:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </form>
        <br />
        <hr />
        <br />

        <form>
          <div class="pb-1">🗓 Room Schedule (experimental)</div>
          <div class="pb-3 text-gray-500">
            Set the date and time for an upcoming event.
          </div>

          <div class={schedule ? 'hidden' : 'w-full'}>
            <div class="flex">
              <input
                type="date"
                class="flex-grow p-2 border rounded"
                name="date"
                placeholder="yyyy-mm-dd"
                min={`${
                  new Date(new Date() - 86400000).toISOString().split('T')[0]
                }`}
                value={
                  scheduleCandidate?.date ||
                  `${new Date().toISOString().split('T')[0]}`
                }
                onChange={handleScheduleChange}
              />
              <input
                type="time"
                class="flex-none ml-3 p-2 border rounded"
                name="time"
                placeholder="hh:mm"
                value={scheduleCandidate?.time || ''}
                onChange={handleScheduleChange}
              />
            </div>
            <div
              class={
                showTimezoneSelect ? 'hidden' : 'p-2 pt-4 text-gray-500'
              }
            >
              {scheduleCandidate.timezone}{' '}
              <span
                class="underline"
                onClick={() => showTimezoneSelect = true}
              >
                change
              </span>
            </div>
            <select
              name="timezone"
              bind:value={scheduleCandidate.timezone}
              on:change={handleScheduleChange}
              class={
                showTimezoneSelect ? 'w-full border mt-3 p-2 rounded' : 'hidden'
              }
            >
              {#each rawTimeZones as tz }
                <option value={tz.name}>
                  {tz.rawFormat}
                </option>
              {/each}
            </select>

            <div class={showRepeatSelect ? 'hidden' : 'p-2 text-gray-500'}>
              <span
                class="underline"
                onClick={() => showRepeatSelect = true}
              >
                repeat?
              </span>
            </div>
            <select
              name="repeat"
              on:change={handleScheduleChange}
              class={
                showRepeatSelect ? 'border mt-3 p-2 rounded' : 'hidden'
              }
            >
              {#each ['never', 'weekly', 'monthly'] as rep }
                  <option value={rep}>
                    {rep}
                  </option>
              {/each}
            </select>
          </div>

          <div
            class={schedule ? 'rounded bg-gray-50 border w-full' : 'hidden'}
          >
            <div class="text-gray-500 p-3">
              {schedule?.date} at {schedule?.time}
              <br />
              {schedule?.timezone}
              <br />
              {schedule?.repeat === 'weekly' || schedule?.repeat === 'monthly'
                ? schedule?.repeat
                : ''}
            </div>
            <div class={schedule ? 'p-3 text-gray-500' : 'hidden'}>
              <span onClick={removeSchedule} class="underline">
                Remove schedule
              </span>
            </div>
          </div>

          <div class={!schedule && completeSchedule() ? 'flex' : 'hidden'}>
            <button
              onClick={submitSchedule}
              class="flex-grow mt-5 h-12 px-6 text-lg text-white bg-gray-600 rounded-lg focus:shadow-outline active:bg-gray-600 mr-2"
            >
              Set Schedule
            </button>
          </div>
        </form>

        <br />
        <hr />
        <br />
        <input
          class="rounded bg-gray-50 text-gray-400 w-full"
          value={`<iframe src="${window.location.href}" allow="microphone *;" width="420" height="600"></iframe>`}
        />
        <div class="p-2 text-gray-500 italic">
          Embed this room using an iFrame. (
          <a
            class="underline"
            href="https://gitlab.com/jam-systems/jam"
            target="_blank"
            rel="noreferrer"
          >
            Learn more
          </a>
          )
        </div>
      </div>
    </Modal>
