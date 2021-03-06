import _ from "lodash";
import dayjs from "dayjs";

/**
 * prepData
 * Prend les données cycles globales,la date courante (+ indicateur d'item épinglé, options de lookAhead)
 * et renvoie les données à afficher dans les différentes zones du gabarit Cycles.
 * @param {Array} data Collection : données de cycles : [ponctuels, réguliers]
 * @param {Object} curDate Objet dayjs : date courante
 * @param {integer} pin référence à l'item épinglé : { type: cycle|film|seance|etc., id: }
 * @param {Object} options { lookAheadPonc, lookAheadReg }
 * @return {Object} { zoneA, isPinned, zoneC, zoneD }
 */
function prepData(data, curDate, pin, options) {
  data = _.cloneDeep(data);
  options = _.cloneDeep(options);

  let dataPonc = data[0] || [];
  let dataReg = data[1] || [];
  let dataPin = {};
  // let dataPin = null;
  let isPinned = false;
  let zoneA = {};
  let zoneC = [];
  let zoneD = [];

  options = _({})
    .assign(
      {
        lookAheadPonc: 0,
        lookAheadReg: 0,
        surcycles: [],
      },
      options
    )
    .value();

  // Etape 1 : Cycles ponctuels : Ajout ou mise au format de propriétés calculées
  // TODO : les opérations qui ne dépendent pas de la date courante (conversion en dayjs) doivent être faites 1 seule fois, dans App.svelte après le chargement des données
  dataPonc = _(dataPonc)
    .map((a) =>
      _(a)
        .thru((b) => {
          // let startsIn = dayjs(b.dateFrom)
          //   .startOf("day")
          //   .diff(curDate, "days");
          let progress =
            b.dateTo === null
              ? 0
              : Math.round(
                  (b.dateFrom.diff(curDate, "days") /
                    b.dateFrom.diff(b.dateTo, "days")) *
                    100,
                  1
                );
          // let progressPositive = progress > 0 ? progress : 0;
          return _({})
            .assign(a, {
              id: b.idCycleSite,
              // startsIn: startsIn,
              progress,
              //  progressPositive: progressPositive
            })
            .value();
        })
        .value()
    )
    .value();

  // Etape 2 : Cycles ponctuels : retire les cycles terminés ou non publiés
  dataPonc = _(dataPonc)
    .reject((d) => {
      if (d.date === null) return false;
      return (
        d.dateTo.isBefore(curDate, "days") ||
        pubDate(d.dateFrom).isAfter(curDate, "days")
      );
    })
    .value();

  // Etape 3 : Cycles réguliers : mise au format des dates + retire les dates des séances passées
  // Ecrit dans une propriété `date` la date de la prochaine séance
  dataReg = _(dataReg)
    .mapValues((b, k) =>
      _(b)
        .map((c) =>
          _(c)
            .assign({
              dates: _(c.dates)
                .filter((d) => !pubDate(d).isAfter(curDate)) // (pour prototype seulement) Séances non encore publiées
                .filter((d) => !d.isBefore(curDate)) // Séances passées
                .value(),
              surcycle: k,
            })
            .value()
        )
        .filter((c) => c.dates.length > 0) // Retire les cycles sans date à venir
        .map((c) =>
          _(c)
            .assign({ date: _.min(c.dates) })
            .value()
        )
        .value()
    )
    .value();

  // Etape 4 : Recherche de données valides à épingler en zone A
  // Si c'est un cycle, il est retiré de `dataReg` ou `dataPonc`
  if (pin && !_.isUndefined(pin.type)) {
    // Cycles ponctuels
    if (pin.type === "cycle" && !_.isUndefined(pin.id)) {
      dataPonc = _.partition(dataPonc, (d) => d.id !== parseInt(pin.id, 10));
      dataPin = dataPonc[1][0] || {};
      // dataPin = dataPonc[1][0] || null;
      dataPonc = dataPonc[0];
      // Cycles réguliers
      if (_.isEmpty(dataPin)) {
        // if (!dataPin) {
        dataReg = _(dataReg)
          .mapValues((d) =>
            _.partition(d, (e) => e.id !== parseInt(pin.id, 10))
          )
          .mapValues((d) => {
            dataPin = !_.isEmpty(dataPin)
              ? dataPin
              : !_.isEmpty(d[1][0])
              ? d[1][0]
              : {};
            // dataPin = dataPin || d[1][0] || {};
            // dataPin = dataPin || d[1][0] || null;
            return d[0];
          })
          .value();
      }
    }
    // TODO: autres types d'items
    if (pin.type === "message") {
      dataPin = pin;
    }
    isPinned = !_.isEmpty(dataPin);
    // isPinned = !!dataPin;
  }

  // Etape 5 : Filtrage et tri des cycles ponctuels
  dataPonc = _(dataPonc)
    .filter((b) => b.dateFrom.diff(curDate, "days") <= options.lookAheadPonc)
    .orderBy((b) => Math.abs(b.progress))
    .value();

  // Etape 6 : Filtrage des cycles réguliers + ajout des surcycles vides + transformation en tableau + tri
  dataReg = _(dataReg)
    .pickBy((d) => d.length > 0) // Retire les surcycles sans cycle (NB : les surcycles vides seront rajoutés plus loin)
    .mapValues((d) =>
      _(d)
        .reduce((acc, v, i) => {
          if (i === 0 || v.date.diff(curDate, "days") <= options.lookAheadReg) {
            return _(acc).concat(v);
          } else {
            return acc;
          }
        }, [])
        .value()
    )
    .value();

  // Cas particulier : si un cycle régulier est épinglé, on empêche l'affichage éventuel du bloc surcycle correspondant en zone D (en le retirant du tableau des surcycles).
  // (Note : mais cela n'empêche pas l'affichage éventuel en zone D d'un autre cycle régulier appartenant au même surcycle).
  if (!_.isEmpty(dataPin) && dataPin.surcycle) {
    // if (dataPin && dataPin.surcycle) {
    _.pull(options.surcycles, dataPin.surcycle);
  }

  dataReg = _({})
    .assign(
      _(
        _.zipObject(
          options.surcycles,
          _.fill(new Array(options.surcycles.length), [])
        )
      )
        .mapValues((v, k) => {
          return {
            type: "surcycle",
            surcycle: k,
          };
        })
        .value(),
      dataReg
    )
    .map()
    .flatten()
    .orderBy((d) => d.date)
    .value();

  // Etape 7 : Si aucun item n'est épinglé, placement du premier cycle (ponctuel ou, à défaut, régulier)
  if (isPinned === false) {
    if (dataPonc.length > 0) {
      dataPin = _.head(dataPonc);
      dataPonc = _.tail(dataPonc);
    } else if (dataReg.length > 0) {
      if (dataReg[0].type !== "surcycle") {
        dataPin = _.head(dataReg);
        dataReg = _.tail(dataReg);
        // } else {
        //   dataPin = {};
      }
    }
  }

  zoneA = dataPin;
  zoneC = dataPonc;
  zoneD = dataReg;

  return {
    isPinned,
    zoneA,
    zoneC,
    zoneD,
  };
}

/**
 * pubDate
 * Calcule pour une date (de séance) la date théorique de sa publication
 * (le 10 du mois précédent le premier mois du programme trimestriel : 10 mai)
 * @param {object} date Objet date dayjs.
 * @return {object} Objet date dayjs.
 */
function pubDate(date) {
  date = date.startOf("day");
  return date
    .clone()
    .year(date.year() - (date.month() < 2 ? 1 : 0))
    .month([12, 12, 3, 3, 3, 6, 6, 6, 9, 9, 9, 12][date.month()] - 2)
    .date(10)
    .startOf("day");
}

export { pubDate, prepData };
