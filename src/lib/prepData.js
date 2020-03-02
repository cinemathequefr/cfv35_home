import _ from "lodash";
import dayjs from "dayjs";
// import moment from "moment";

/**
 * prepData
 * Prend les données cycles globales,la date courante (+ indicateur d'item épinglé, options de lookAhead)
 * et renvoie les données à afficher dans les différentes zones du gabarit Cycles.
 * @param {Array} data Collection : données de cycles
 * @param {Object} curDate Objet dayjs : date courante
 * @param {integer} idPinned id du cycle épinglé
 * @param {Object} options { lookAheadPonc, lookAheadReg }
 * @return {Object} { zoneA, isPinned, zoneC, zoneD }
 */

function prepData(data, curDate, idPinned, options) {
  options = _({})
    .assign(
      {
        lookAheadPonc: 0,
        lookAheadReg: 0,
        surcycles: [
          "Aujourd'hui le cinéma",
          "Cinéma bis",
          // "Ciné-club Jean Douchet",
          "Cinéma d'avant-garde",
          "Séances spéciales",
          "Conservatoire des techniques",
          "Fenêtre sur les collections",
          "Parlons cinéma",
          "Archi Vives"
        ]
      },
      options
    )
    .value();

  idPinned = 140;

  // Cycles ponctuels

  // On élimine les cycles non publiés ou terminés
  let dataPonc1 = _(data[0])
    .reject(b =>
      b.dateTo === null
        ? false
        : dayjs(b.dateTo)
            .startOf("day")
            .isBefore(curDate, "days") ||
          pubDate(dayjs(b.dateFrom).startOf("day")).isAfter(curDate, "days")
    )
    // Propriétés calculées
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
              id: b.idCycleProg,
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

  // console.log(options.lookAheadPonc);

  let dataPonc2 = _(dataPonc1)
    .filter(
      b =>
        dayjs(b.dateFrom)
          .startOf("day")
          .diff(curDate, "days") <= options.lookAheadPonc ||
        b.id === parseInt(idPinned, 10) // On conserve un cycle épinglé
    )
    .value();

  dataPonc2 = _(dataPonc2)
    .orderBy(b => Math.abs(b.progress))
    .value();

  // Cycles réguliers
  // On mémorise dataReg1 : dates de séances publiées et non échues
  let dataReg1 = _(data[1]) // (NB : data[1] sont les données des cycles réguliers)
    .mapValues(b =>
      _(b)
        .map(
          c =>
            _({})
              .assign(c, {
                dates: filterDates(curDate, c.dates)
              })
              .value() // On remplace le tableau des dates initial par le tableau filtré
        )
        .value()
    )
    .value();

  // - On inscrit dans `date` la date de la prochaine séance du cycle
  let dataReg2 = _(dataReg1)
    .mapValues(b =>
      _(b)
        .map(c =>
          _({})
            .assign(c, {
              date:
                _(c.dates)
                  .sort()
                  .head() || null
            })
            .value()
        )
        .filter(c => !!c.date)
        .orderBy(c => c.date)
        .value()
    )
    .pickBy(b => b.length > 0) // On élimine les propriétés dont la valeur est un tableau vide
    .mapValues((
      b // Seconde itération mapValues pour retenir le (ou les) cycles à conserver dans le surcycle
    ) =>
      _(b)
        .reduce((acc, v, i) => {
          if (
            i === 0 ||
            dayjs(v.date)
              .startOf("day")
              .diff(curDate, "days") <= options.lookAheadReg ||
            v.id === parseInt(idPinned, 10) // On conserve un cycle épinglé
          ) {
            return _(acc).concat(v);
          } else {
            return _(acc);
          }
        }, [])
        .value()
    )
    .value();

  // Rajoute les surcycles vides
  dataReg2 = _({})
    .assign(
      _.zipObject(
        options.surcycles,
        _.fill(new Array(options.surcycles.length), [])
      ),
      dataReg2
    )
    .value();

  // Transforme l'objet en tableau d'objets et nettoye les données inutiles
  dataReg2 = _(dataReg2)
    .mapValues((v, k) => {
      if (v.length > 0) {
        return _(v)
          .map(a =>
            _({})
              .assign(
                _(a)
                  .mapValues((w, m) =>
                    m === "dateFrom" || m === "dateTo" ? dayjs(w) : w
                  )
                  .value(),
                {
                  surcycle: k,
                  date: dayjs(a.date).startOf("day"),
                  startsIn: dayjs(a.date)
                    .startOf("day")
                    .diff(curDate, "days")
                }
              )
              .omit(["dates"])
              .value()
          )
          .value();
      } else {
        return {
          type: "surcycle",
          surcycle: k
        };
      }
    })
    .map()
    .flatten()
    .orderBy(a => a.date)
    .value();

  // Isole les données du cycle épinglé dans les cycles ponctuels, puis réguliers
  dataPonc2 = _.partition(dataPonc2, d => d.id !== parseInt(idPinned, 10));
  dataReg2 = _.partition(dataReg2, d => d.id !== parseInt(idPinned, 10));

  let pinned = dataPonc2[1][0] || dataReg2[1][0];
  let ponc = dataPonc2[0];
  let reg = dataReg2[0];
  let isPinned;

  if (!pinned) {
    if (ponc.length > 0) {
      pinned = ponc.shift();
    } else if (reg.length > 0) {
      pinned = reg.shift();
    }
    isPinned = false;
  } else {
    isPinned = true;
  }

  return {
    zoneA: pinned,
    isPinned: isPinned,
    zoneC: ponc,
    zoneD: reg
  };
}

/**
 *
 * @param {string} curDate Date courante
 * @param {Array:string} dates Table de chaînes ISO date
 */
function filterDates(curDate, dates) {
  return (
    _(dates)
      .filter(d => !pubDate(dayjs(d).startOf("day")).isAfter(curDate)) // Séances dont la date de publication est passée (= elles sont publiées)
      // .filter(d => pubDate(dayjs(d).startOf("day")).isSameOrBefore(curDate)) // Séances dont la date de publication est passée (= elles sont publiées)
      .filter(
        d =>
          !dayjs(d)
            .startOf("day")
            .isBefore(curDate)
        // dayjs(d)
        //   .startOf("day")
        //   .isSameOrAfter(curDate)
      ) // Séances dont la date de projection n'est pas encore passée
      .value()
  );
}
/**
 * pubDate
 * Calcule pour une date (de séance) la date théorique de sa publication
 * (le 20 du mois précédent le premier mois du programme trimestriel : 20 mai)
 * EDIT: le 10 du mois
 * @param {object} date Objet date dayjs.
 * @return {object} Objet date dayjs.
 */
function pubDate(date) {
  date = date.startOf("day");
  return (
    date
      .clone()
      .year(date.year() - (date.month() < 2 ? 1 : 0))
      .month([12, 12, 3, 3, 3, 6, 6, 6, 9, 9, 9, 12][date.month()] - 2)
      .date(10)
      // .date(20)
      .startOf("day")
  );
}

export { pubDate, prepData };
