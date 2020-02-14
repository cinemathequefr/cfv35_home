<script>
  import dayjs from "dayjs";
  dayjs.locale("fr");
  import "../lib/dayjs_custom_locale_fr.js";
  import { beforeAfterStr as ba, concatDates } from "../lib/format.js";
  export let dataDisplay;
</script>

<style>

</style>

<section>
  <div class="container">
    <ul class="grid">
      <li class="zone a">
        {@html ba("<div class='title'>", '</div>', dataDisplay.zoneA.title)}
      </li>
      <li class="zone b">
        <div class="title">Exposition Louis de Funès</div>
      </li>

      {#if dataDisplay.zoneC.length === 0}
        <li class="zone c ghost" />
      {:else}
        {#each dataDisplay.zoneC as cycle, i}
          <li class="zone c">
            <div class="thumb" />
            <div class="text">
              <div class="label">Rétrospective</div>
              <div class="title">{cycle.title}</div>
              <div class="dates">
                {concatDates(dayjs(cycle.dateFrom).format('D MMMM YYYY'), dayjs(cycle.dateTo).format('D MMMM YYYY'), ' ', 'Du ', ' au ')}
              </div>
            </div>
          </li>
        {/each}
      {/if}

    </ul>
  </div>
</section>
