<script>
  import dayjs from "dayjs";
  dayjs.locale("fr");
  import "../lib/dayjs_custom_locale_fr.js";
  import { beforeAfterStr as ba, concatDates } from "../lib/format.js";
  import _ from "lodash";
  export let dataDisplay;
</script>

<!-- 
<pre>
  <code>{JSON.stringify(dataDisplay, null, 2)}</code>
</pre>
-->

<section style="margin-top: 96px;">
  <div class="container">
    <ul class="grid">
      {#if dataDisplay.zoneA.title}
        <li class="zone a">
          <a href="javascript: void 0;">
            <div
              class="thumb"
              style="background-image:url({dataDisplay.zoneA.img})" />
            <div class="mask" />
            <div class="text">
              <div class="label">{dataDisplay.zoneA.label}</div>
              <div class="title">{dataDisplay.zoneA.title}</div>
              <div class="dates">
                {concatDates(dayjs(dataDisplay.zoneA.dateFrom).format('D MMMM YYYY'), dayjs(dataDisplay.zoneA.dateTo).format('D MMMM YYYY'), ' ', 'Du ', ' au ')}
              </div>
            </div>
          </a>
        </li>
      {/if}
      <li class="zone b">
        <div class="title">Exposition Louis de Funès</div>
      </li>
      {#if dataDisplay.zoneC.length === 0}
        <li class="zone c ghost" />
      {:else}
        {#each dataDisplay.zoneC as cycle, i}
          <li class="zone c">
            <a href="javascript: void 0;">
              <div class="thumb" style="background-image:url({cycle.img})" />
              <div class="text">
                <div class="label">{cycle.label}</div>
                <div class="title">{cycle.title}</div>
                <div class="dates">
                  {concatDates(dayjs(cycle.dateFrom).format('D MMMM YYYY'), dayjs(cycle.dateTo).format('D MMMM YYYY'), ' ', 'Du ', ' au ')}
                </div>
              </div>
            </a>
          </li>
        {/each}
      {/if}
    </ul>
    <ul class="grid">
      {#each dataDisplay.zoneD as cycle, i}
        <li class="zone d">
          <a class="surcycle" href="javascript: void 0;">{cycle.surcycle}</a>
          <a class="main" href="javascript: void 0;">
            {#if cycle.id}
              <div class="text">
                <div class="title">{cycle.title}</div>
                <div class="dates">
                  {_.capitalize(concatDates(dayjs(cycle.date).format('dddd D MMMM YYYY'), dayjs(cycle.date).format('dddd D MMMM YYYY'), ' ', 'Du ', ' au '))}
                </div>
              </div>
            {/if}
          </a>
        </li>
      {/each}
    </ul>
  </div>
</section>
