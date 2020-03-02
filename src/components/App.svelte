<script>
  import { onMount } from "svelte";
  import dayjs from "dayjs";
  import _ from "lodash";
  dayjs.locale("fr");
  import "../lib/dayjs_custom_locale_fr.js";
  import Cycles from "./Cycles.svelte";
  import { prepData } from "../lib/prepData.js";

  let customCss = "1_1";
  let curDate = dayjs().startOf("day");
  let lookAheadPonc = 21;
  let lookAheadReg = 13;
  let dataCycles = [];
  let dataDisplay;
  let idPinned;

  onMount(async () => {
    let dataCyclesPonctuels = await (await fetch(
      "https://gist.githubusercontent.com/nltesown/e0992fae1cd70e5c2a764fb369ea6515/raw/cycles.json"
    )).json();

    let dataCyclesReguliers = await (await fetch(
      "https://gist.githubusercontent.com/nltesown/a310518cfa88cd52b13a55f3e737d75f/raw/cycles-ext-2.json"
    )).json();

    let dataImg = await (await fetch(
      "https://gist.githubusercontent.com/nltesown/3da425f30589064cebc6ce13ed2f7d10/raw/cycles-img.json"
    )).json();

    // NOTICE: je retire manuellement l'item Fellini/Picasso (= exposition)
    dataCyclesPonctuels = _(dataCyclesPonctuels)
      .filter(d => d.idCycle !== 442)
      .value();

    // Associe l'URL de l'illustration de cycle ponctuel (Attention : son chemin est `img.img`).
    dataCyclesPonctuels = _(
      _.merge(
        _(dataCyclesPonctuels)
          .groupBy("idCycleSite")
          .mapValues(e => e[0])
          .value(),
        _(dataImg)
          .groupBy("idCycleSite")
          .mapValues(e => e[0])
          .value()
      )
    )
      .map()
      .value();

    dataCycles = [dataCyclesPonctuels, dataCyclesReguliers];
  });

  $: curDate;
  $: dataDisplay = prepData(dataCycles, curDate, idPinned, {
    lookAheadPonc: lookAheadPonc,
    lookAheadReg: lookAheadReg
  });

  /**
   * incrOrDecrDate
   * Incrémente ou décrémente d'1 jour la date `date`. Utiliser pour gérer l'événement wheel.
   * @param {Object} date dayjs date
   * @param {integer} amount
   * @return {Object} dayjs date
   */
  function incrOrDecrDate(date, amount = 0) {
    if (amount === 0) return date;
    return dayjs(date).add(amount < 0 ? -1 : 1, "days");
  }
</script>

<style>
  .tools {
    position: fixed;
    right: 0;
    bottom: 0;
    margin: 0;
    padding: 4px;
    display: inline-block;
    background-color: #222;
    color: #eee;
    cursor: row-resize;
  }

  .tools > select {
    font-size: 0.875rem !important;
    margin: 4px !important;
  }

  .tools > select > option {
    font-size: 0.875rem !important;
  }
</style>

<svelte:head>
  <title>{curDate.format('dddd D MMMM YYYY')}</title>
  {#if customCss !== ''}
    <link rel="stylesheet" href="css/custom/{customCss}.css" />
  {/if}
</svelte:head>

<Cycles {dataDisplay} />

<!-- Tools -->
<div
  class="tools"
  on:click={() => {
    curDate = dayjs();
  }}
  on:DOMMouseScroll={e => {
    curDate = incrOrDecrDate(curDate, e.deltaY);
    e.preventDefault();
  }}
  on:wheel={e => {
    curDate = incrOrDecrDate(curDate, e.deltaY);
    e.preventDefault();
  }}>
  {curDate.format('YYYY-MM-DD')}
  <select bind:value={customCss}>
    <option value="1_0">1.0</option>
    <option value="1_1">1.1</option>
  </select>
</div>
