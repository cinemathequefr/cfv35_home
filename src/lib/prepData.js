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
  let dataPonc = data[0] || [];
  let dataReg = data[1] || [];
  let dataPin = null;
  let isPinned = false;
  let zoneA = {};
  let zoneC = [];
  let zoneD = [];

  options = _({})
    .assign(
      {
        lookAheadPonc: 0,
        lookAheadReg: 0,
        surcycles: []
      },
      options
    )
    .value();

  if (dataPonc.length === 0 && dataReg.length === 0) return null;

  // Etape 1 : Cycles ponctuels : Ajout ou mise au format de propriétés calculées
  dataPonc = _(dataPonc)
    .map(a =>
      _(a)
        .thru(b => {
          let dateFrom = dayjs(b.dateFrom).startOf("day");
          let dateTo = dayjs(b.dateTo).startOf("day");
          let startsIn = dayjs(b.dateFrom)
            .startOf("day")
            .diff(curDate, "days");
          let progress =
            dateTo === null
              ? 0
              : Math.round(
                  (dateFrom.diff(curDate, "days") /
                    dateFrom.diff(dateTo, "days")) *
                    100,
                  1
                );
          let progressPositive = progress > 0 ? progress : 0;
          return _({})
            .assign(a, {
              id: b.idCycleSite,
              dateFrom: dateFrom,
              dateTo: dateTo,
              startsIn: startsIn,
              progress: progress,
              progressPositive: progressPositive
            })
            .value();
        })
        .value()
    )
    .value();

  // Etape 2 : Cycles ponctuels : retire les cycles terminés ou non publiés
  dataPonc = _(dataPonc)
    .reject(d => {
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
        .map(c =>
          _(c)
            .assign({
              dateFrom: c.dateFrom
                ? dayjs(c.dateFrom).startOf("day")
                : undefined,
              dateTo: c.dateTo ? dayjs(c.dateTo).startOf("day") : undefined,
              dates: _(c.dates)
                .sort()
                .map(d => dayjs(d).startOf("day"))
                .filter(d => !pubDate(d).isAfter(curDate)) // (pour prototype seulement) Séances non encore publiées
                .filter(d => !d.isBefore(curDate)) // Séances passées
                .value(),
              surcycle: k
            })
            .value()
        )
        .filter(c => c.dates.length > 0) // Retire les cycles sans date à venir
        .map(c =>
          _(c)
            .assign({ date: c.dates[0] })
            .value()
        )
        .value()
    )
    .pickBy(d => d.length > 0) // Retire les surcycles sans cycle (NB : les surcycles vides seront rajoutés plus loin)
    .value();

  // Etape 4 : Recherche de données valides à épingler en zone A
  // Si c'est un cycle, il est retiré de `dataReg` ou `dataPonc`
  if (pin && !_.isUndefined(pin.type) && !_.isUndefined(pin.id)) {
    // Cycles ponctuels
    if (pin.type === "cycle") {
      dataPonc = _.partition(dataPonc, d => d.id !== parseInt(pin.id, 10));
      dataPin = dataPonc[1][0];
      dataPonc = dataPonc[0];
      // Cycles réguliers
      if (!dataPin) {
        dataReg = _(dataReg)
          .mapValues(d => _.partition(d, e => e.id !== parseInt(pin.id, 10)))
          .mapValues(d => {
            dataPin = dataPin || d[1][0];
            return d[0];
          })
          .value();
      }
      // TODO: autres types d'items

      // if (!!dataPin) {
      //   dataPin = _(dataPin)
      //     .assign({ type: pin.type })
      //     .value();
      // }
      isPinned = !!dataPin;
    }
  }

  // Etape 5 : Filtrage et tri des cycles ponctuels
  dataPonc = _(dataPonc)
    .filter(b => b.dateFrom.diff(curDate, "days") <= options.lookAheadPonc)
    .orderBy(b => Math.abs(b.progress))
    .value();

  // Etape 6 : Filtrage des cycles réguliers + ajout des surcycles vides + transformation en tableau + tri
  dataReg = _(dataReg)
    .mapValues(d =>
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
            surcycle: k
          };
        })
        .value(),
      dataReg
    )
    .map()
    .flatten()
    .orderBy(d => d.date)
    .value();

  // Etape 7 : Si aucun item n'est épinglé, placement du premier cycle (ponctuel ou, à défaut, régulier)
  if (isPinned === false) {
    if (dataPonc.length > 0) {
      dataPin = _.head(dataPonc);
      dataPonc = _.tail(dataPonc);
    } else if (dataReg.length > 0) {
      dataPin = _.head(dataReg);
      dataReg = _.tail(dataReg);
    }
  }

  zoneA = dataPin;
  zoneC = dataPonc;
  zoneD = dataReg;

  return {
    isPinned,
    zoneA,
    zoneC,
    zoneD
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
