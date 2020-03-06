<script>
  import { createEventDispatcher } from "svelte";

  import { beforeAfterStr as ba, concatDates, nbsp } from "../lib/format.js";
  import _ from "lodash";
  export let dataDisplay;
  const dispatch = createEventDispatcher();
  let pinned;
  $: pinned = dataDisplay.isPinned;
</script>

<!--
<pre>
  <code>{JSON.stringify(dataDisplay, null, 2)}</code>
</pre>
-->
{#if dataDisplay}
  <section style="margin-top: 96px;">
    <div class="container">
      <ul class="grid">
        {#if dataDisplay.zoneA.title}
          <li
            class="zone a"
            title="{JSON.stringify(dataDisplay.zoneA, null, 2)}]">
            <a href="javascript: void 0;">
              <div
                class="thumb"
                style="background-image:url({dataDisplay.zoneA.img})" />
              <div class="mask" />
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
                  {#if dataDisplay.zoneA.date}
                    {dataDisplay.zoneA.date.format('ddd D MMMM')}
                  {:else}
                    {concatDates(dataDisplay.zoneA.dateFrom.format('D MMMM'), dataDisplay.zoneA.dateTo.format('D MMMM'), ' ', 'Du ', ' au ')}
                  {/if}
                </div>
              </div>
            </a>
          </li>
        {:else if dataDisplay.zoneA.surcycle}
          <li
            class="zone a"
            title="{JSON.stringify(dataDisplay.zoneA, null, 2)}]">
            <a href="javascript: void 0;">
              <div
                class="thumb"
                style="background-image:url({dataDisplay.zoneA.img})" />
              <div class="mask" />
              <div class="text">
                <div class="title">{dataDisplay.zoneA.surcycle}</div>
              </div>
            </a>
          </li>
        {/if}
        <li class="zone b">
          <a href="javascript: void 0;">
            <div class="thumb" style="background-image:url(img/expo_ldf.jpg)" />
          </a>
        </li>
        {#if dataDisplay.zoneC.length === 0}
          <li class="zone c ghost" />
        {:else}
          {#each dataDisplay.zoneC as cycle, i}
            <li class="zone c" title="{JSON.stringify(cycle, null, 2)}]">
              <a href="javascript: void 0;">
                <div class="thumb" style="background-image:url({cycle.img})">
                  <div
                    class="pin icon-pin"
                    data-type="cycle"
                    data-id={cycle.id}
                    on:click={e => {
                      console.log();
                      dispatch('updatePin', {
                        type: 'cycle',
                        id: e.target.dataset.id
                      });
                    }} />
                </div>
                <div class="text">
                  <div class="label">{cycle.label}</div>
                  <div class="title">
                    {@html nbsp(cycle.title)}
                  </div>
                  <div class="dates">
                    {concatDates(cycle.dateFrom.format('D MMMM'), cycle.dateTo.format('D MMMM'), ' ', 'Du ', ' au ')}
                  </div>
                </div>
              </a>
            </li>
          {/each}
        {/if}
      </ul>
      <div class="moreContainer">
        <a class="btn-right" href="javascript: void 0;">
          Voir tous les cycles à venir
        </a>
      </div>
      <ul class="grid">
        {#each dataDisplay.zoneD as cycle, i}
          <li class="zone d" title="{JSON.stringify(cycle, null, 2)}]">
            {#if cycle.dates}
              <a class="surcycle" href="javascript: void 0;">
                {cycle.surcycle}
              </a>
              <a class="main" href="javascript: void 0;">
                <div
                  class="pin icon-pin"
                  data-type="cycle"
                  data-id={cycle.id}
                  on:click={e => {
                    console.log(e.target.dataset.id);
                    dispatch('updatePin', {
                      type: 'cycle',
                      id: e.target.dataset.id
                    });
                  }} />
                {#if cycle.id}
                  <div class="text">
                    <div class="title">
                      {@html nbsp(cycle.title)}
                    </div>
                    <div class="dates">
                      {_.capitalize(concatDates(cycle.date.format('ddd D MMMM'), cycle.date.format('ddd D MMMM'), ' ', 'Du ', ' au '))}
                    </div>
                  </div>
                {/if}
              </a>
            {:else}
              <a
                class="main"
                style="margin-top: 20px;"
                href="javascript: void 0;">
                <div class="text">
                  <div class="title">
                    {@html nbsp(cycle.surcycle)}
                  </div>
                </div>
              </a>
            {/if}
          </li>
        {/each}
      </ul>
    </div>
  </section>
{/if}
