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
  let showData = false;

  let surcycles = [
    "Aujourd'hui le cinéma",
    "Cinéma bis",
    "Cinéma d'avant-garde",
    "Séances spéciales",
    "Conservatoire des techniques",
    "Fenêtre sur les collections",
    "Parlons cinéma",
    "Archi Vives",
    "Ciné-club Jean Douchet"
  ];

  let pin;
  pin = {
    type: "message",
    title: "La Cinémathèque française<br>est exceptionnellement fermée",
    msg: "Revenez un autre jour !",
    img:
      "https://i2.wp.com/www.theculturemap.com/wp-content/uploads/2018/09/cinematheque-francaise-frank-gehry-paris-architecture.jpg"
  };
  // pin = {
  //   type: "cycle",
  //   id: 13005
  // };

  onMount(async () => {
    let dataPonc = await (await fetch(
      "https://gist.githubusercontent.com/nltesown/e0992fae1cd70e5c2a764fb369ea6515/raw/cycles.json"
    )).json();

    let dataReg = await (await fetch(
      "https://gist.githubusercontent.com/nltesown/a310518cfa88cd52b13a55f3e737d75f/raw/cycles-ext-2.json"
    )).json();

    let dataImg = await (await fetch(
      "https://gist.githubusercontent.com/nltesown/3da425f30589064cebc6ce13ed2f7d10/raw/cycles-img.json"
    )).json();

    // Convertit les chaînes de date en objet dayjs
    dataPonc = _(dataPonc)
      .map(d =>
        _({})
          .assign(d, {
            type: "cycle",
            dateFrom: dayjs(d.dateFrom).startOf("day"),
            dateTo: dayjs(d.dateTo).startOf("day")
          })
          .value()
      )
      .value();

    dataReg = _(dataReg)
      .mapValues(d => {
        return _(d)
          .map(e =>
            _({})
              .assign(e, {
                type: "cycle",
                dateFrom: e.dateFrom
                  ? dayjs(e.dateFrom).startOf("day")
                  : undefined,
                dateTo: e.dateTo ? dayjs(e.dateTo).startOf("day") : undefined,
                dates: _.map(e.dates, f => dayjs(f).startOf("day"))
              })
              .value()
          )
          .value();
      })
      .value();

    // Associe l'URL de l'illustration de cycle ponctuel (Attention : son chemin est `img.img`).
    dataPonc = _(
      _.merge(
        _(dataPonc)
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

    dataCycles = [dataPonc, dataReg];
  });

  $: dataDisplay = prepData(dataCycles, curDate, pin, {
    lookAheadPonc: lookAheadPonc,
    lookAheadReg: lookAheadReg,
    surcycles: surcycles
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
    font-size: 0.875rem;
  }

  .tools > .date {
    display: inline-block;
  }

  .tools > .date:hover,
  .tools > .date:hover {
    color: #9cf;
  }

  .tools > select {
    display: inline-block;
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

<section style="margin-top: 48px;">
  <div class="container">{curDate.format('dddd D MMMM YYYY')}</div>
</section>

<Cycles
  on:updatePin={e => {
    pin = e.detail;
  }}
  {dataDisplay}
  showData={!!showData} />

<!-- Tools -->
<div class="tools">
  <div
    class="date"
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
  </div>

  <select bind:value={customCss}>
    <option value="1_0n">1.0n</option>
    <option value="1_0">1.0</option>
    <option value="1_1n">1.1n</option>
    <option value="1_1">1.1</option>
  </select>
  <label>
    Voir les données
    <input type="checkbox" bind:checked={showData} />
  </label>
</div>
