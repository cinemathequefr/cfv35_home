<script>
  import { createEventDispatcher } from "svelte";
  import { beforeAfterStr as ba, concatDates, nbsp } from "../lib/format.js";
  import _ from "lodash";

  export let dataDisplay, showData;
  const dispatch = createEventDispatcher();

  let pinned;
  // $: dataDisplay;
  $: pinned = dataDisplay.isPinned;
</script>

{#if dataDisplay}
  <section>
    <div class="container">

      {#if showData}
        <pre>
          <code>{JSON.stringify(dataDisplay, null, 2)}</code>
        </pre>
      {:else}
        <ul class="grid">
          {#if dataDisplay.zoneA.type === 'cycle'}
            <!-- {#if dataDisplay.zoneA.title} -->
            <li class="zone a">
              <a href="javascript: void 0;">
                <div
                  class="thumb"
                  style="background-image:url({dataDisplay.zoneA.img})" />
                <div class="mask" />
                <div class="hovermask" />
                <div
                  data-type="cycle"
                  data-id={dataDisplay.zoneA.id}
                  class="pin icon-pin"
                  class:pinned
                  on:click={e => {
                    dispatch('updatePin', pinned ? null : { type: 'cycle', id: e.target.dataset.id });
                  }} />
                <div class="text">
                  {#if dataDisplay.zoneA.surcycle}
                    <a href="javascript: void 0;" class="surcycle">
                      {dataDisplay.zoneA.surcycle}
                    </a>
                  {/if}
                  {#if dataDisplay.zoneA.label}
                    <div class="label">{dataDisplay.zoneA.label}</div>
                  {/if}
                  <div class="title">
                    {@html nbsp(dataDisplay.zoneA.title)}
                  </div>
                  <div class="dates">
                    {#if dataDisplay.zoneA.dateFrom && dataDisplay.zoneA.dateTo}
                      {concatDates(dataDisplay.zoneA.dateFrom.format('D MMMM'), dataDisplay.zoneA.dateTo.format('D MMMM'), ' ', 'Du ', ' au ')}
                    {:else}{dataDisplay.zoneA.date.format('ddd D MMMM')}{/if}
                  </div>
                </div>
              </a>
            </li>
          {:else if dataDisplay.zoneA.type === 'message'}
            <li class="zone a message">
              <a href="javascript: void 0;">
                <div
                  class="thumb"
                  style="background-image:url({dataDisplay.zoneA.img})" />
                <div class="mask" />
                <div class="hovermask" />
                <div
                  class="pin icon-pin"
                  class:pinned
                  on:click={e => {
                    dispatch('updatePin', null);
                  }} />
                <div class="text">
                  <div class="title">
                    {@html nbsp(dataDisplay.zoneA.title)}
                  </div>
                  {@html nbsp(dataDisplay.zoneA.msg)}
                </div>
              </a>
            </li>
          {:else}
            <li class="zone a" />
          {/if}
          <li class="zone b">
            <a href="javascript: void 0;">
              <div
                class="thumb"
                style="background-image:url(img/expo_ldf.jpg)" />
            </a>
          </li>
          {#if dataDisplay.zoneC.length === 0}
            <li class="zone c ghost" />
          {:else}
            {#each dataDisplay.zoneC as cycle, i}
              <li class="zone c">
                <a href="javascript: void 0;">
                  <div
                    class="thumb"
                    style="background-image:url({cycle.img})" />
                  <div class="text">
                    <div class="label">{cycle.label}</div>
                    <div class="title">
                      {@html nbsp(cycle.title)}
                    </div>
                    <div class="dates">
                      {_.capitalize(concatDates(cycle.dateFrom.format('D MMMM'), cycle.dateTo.format('D MMMM'), ' ', 'Du ', ' au '))}
                    </div>
                  </div>
                  <div
                    class="pin icon-pin"
                    data-type="cycle"
                    data-id={cycle.id}
                    on:click={e => {
                      dispatch('updatePin', {
                        type: 'cycle',
                        id: e.target.dataset.id
                      });
                    }} />
                </a>
              </li>
            {/each}
          {/if}
        </ul>
        <div class="moreContainer">
          <a class="btn-right" href="javascript: void 0;">
            Tous les cycles à venir
          </a>
        </div>
        <ul class="grid">
          {#each dataDisplay.zoneD as cycle, i}
            {#if cycle.dates}
              <li class="zone d">
                <a href="javascript: void 0;">
                  <div
                    class="thumb"
                    style="background-image:url({cycle.img})" />
                  <div class="text">
                    <div class="title">
                      {@html cycle.title}
                    </div>
                    <div class="dates">
                      {#if cycle.dateFrom && cycle.dateTo}
                        {_.capitalize(concatDates(cycle.dateFrom.format('D MMMM'), cycle.dateTo.format('D MMMM'), ' ', 'Du ', ' au '))}
                      {:else}
                        {_.capitalize(concatDates(cycle.date.format('ddd D MMMM'), cycle.date.format('ddd D MMMM')))}
                      {/if}
                    </div>
                  </div>
                  <div
                    class="pin icon-pin"
                    data-type="cycle"
                    data-id={cycle.id}
                    on:click={e => {
                      dispatch('updatePin', {
                        type: 'cycle',
                        id: e.target.dataset.id
                      });
                    }} />
                </a>
                <a class="surcycle" href="javascript: void 0;">
                  {cycle.surcycle}
                </a>
              </li>
            {:else}
              <li class="zone d surcycle-container">
                <a href="javascript: void 0;">
                  <div class="thumb" />
                  <div class="text">
                    <div class="title">
                      {@html cycle.surcycle}
                    </div>
                  </div>
                </a>
              </li>
            {/if}
          {/each}
        </ul>
      {/if}
    </div>
  </section>
{/if}
