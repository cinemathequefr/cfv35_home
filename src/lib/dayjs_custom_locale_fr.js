import dayjs from "dayjs";

const locale = {
  name: "fr",
  weekdays: "dimanche_lundi_mardi_mercredi_jeudi_vendredi_samedi".split("_"),
  weekdaysShort: "dim_lun_mar_mer_jeu_ven_sam".split("_"),
  weekdaysMin: "Di_Lu_Ma_Me_Je_Ve_Sa".split("_"),
  months: "janvier_février_mars_avril_mai_juin_juillet_août_septembre_octobre_novembre_décembre".split(
    "_"
  ),
  monthsShort: "jan_fév_mar_avr_mai_juin_juil_aoû_sep_oct_nov_déc".split(
    "_"
  ),
  weekStart: 1,
  formats: {
    LT: "HH:mm",
    LTS: "HH:mm:ss",
    L: "DD/MM/YYYY",
    LL: "D MMMM YYYY",
    LLL: "D MMMM YYYY HH:mm",
    LLLL: "dddd D MMMM YYYY HH:mm"
  },
  relativeTime: {
    future: "dans %s",
    past: "il y a %s",
    s: "quelques secondes",
    m: "une minute",
    mm: "%d minutes",
    h: "une heure",
    hh: "%d heures",
    d: "un jour",
    dd: "%d jours",
    M: "un mois",
    MM: "%d mois",
    y: "un an",
    yy: "%d ans"
  },
  ordinal: n => {
    const o = n === 1 ? "er" : "";
    return `${n}${o}`;
  }
};

dayjs.locale(locale, null, true);

export default locale;