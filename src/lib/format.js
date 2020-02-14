const _ = require("lodash");

/**
 * artTitre
 * @description Met en forme un titre (de film, etc.) à partir de son article défini et sa partie principale.
 * @param {string|null} art
 * @param {string} titre
 * @param {boolean} reject true: utiliser la forme rejetée
 */
function artTitre(art, titre, reject = false) {
  return reject
    ? !art
      ? titre
      : `${titre} (${art})`
    : !art
    ? titre
    : art === "L'"
    ? `${art}${titre}`
    : `${art} ${titre}`;
}

/**
 * beforeAfterStr
 * @description
 * Ajoute des chaînes avant et après une chaîne si celle-ci existe.
 * Fonction utilitaire pour formater un contenu variable, et ne pas formater en l'absence de contenu.
 * @param {string|function} before Chaîne à ajouter avant (ou fonction)
 * @param {string|function} after Chaîne à ajouter après (ou fonction)
 * @param {string} str  Chaîne à traîter
 * @return {string}
 */
function beforeAfterStr(before, after, str) {
  if (!str) return "";
  // if (!str) return;
  let _before = before;
  let _after = after;
  if (typeof before !== "function") before = () => _before || "";
  if (typeof after !== "function") after = () => _after || "";
  return `${before(str)}${str}${after(str)}`;
}

/**
 * concatDates
 * @description
 * Concaténation "intelligente" de dates de début / date de fin.
 * Cette fonction utilise uniquement une méthode textuelle et repose sur le fait que les deux dates sont construites sur le même modèle.
 * Les éléments constituant les dates doivent aller du plus court au plus long (jour, mois, année).
 * Elle ne garantit aucunement la validité, en particulier que la seconde date est postérieure à la première.
 * Si les deux dates sont identiques, on renvoie la date seule.
 * @example
 * ("1 jan 2016", "31 déc 2016", " ", "", "-") => "1 jan-31 déc 2016"
 * ("16 février 2019", "18 février 2019", " ", "Du", "au") => "Du 16 au 18 février 2019"
 * ("16 février 2019", "18 février 2019", " ", "Du", "au") => "Du 16 au 18 février 2019"
 * @param {string} date1 Chaîne de la première date.
 * @param {string} date2 Chaîne de la seconde date (postérieure à la première)
 * @param {string} separator Séparateur utilisé par la chaîne de dates (p. ex. " ").
 * @param {string} prefix1 Préfixe à ajouter devant le premier élément de date en sortie (p. ex. "Du ").
 * @param {string} prefix2 Préfixe à ajouter devant le second élément de date en sortie (p. ex. " au ").
 * @param {string} prefix3 Préfixe à ajouter devant la date en sortie quand elle est seule (p. ex. "Le ").
 * @returns {string} Chaîne des deux dates concaténées.
 */
function concatDates(
  date1,
  date2,
  separator = " ",
  prefix1 = "",
  prefix2 = "-",
  prefix3 = ""
) {
  let o = _([date1.split(separator), date2.split(separator)])
    .unzip()
    .thru(d => {
      let doStop = false;
      return _(d).reduceRight(
        (acc, v) => {
          if (!(v[0] === v[1] && doStop === false)) {
            doStop = true;
            acc[0].unshift(v[0]);
          }
          acc[1].unshift(v[1]);
          return acc;
        },
        [[], []]
      );
    })
    .value();

  if (o[0].length === 0) return `${prefix3}${o[1].join(separator)}`;
  return `${prefix1}${o[0].join(separator)}${prefix2}${o[1].join(separator)}`;
}

/**
 * formatName
 * @description
 * Formate un  nom à partir des paramètres passés en les séparant par une espace, puis retire les espaces après apostrophe.
 * Cette version ne présuppose pas un nombre d'arguments défini.
 * On peut également passer les éléments du nom sous forme d'un array.
 * Cas d'utilisation :
 * - Formater un nom propre à partir de prénom, particule, nom
 * - Format un titre de film à partir d'article, reste du titre
 * @example
 * formatName("Albert", ["de", "Monaco"]) => "Albert de Monaco"
 * @requires lodash
 * @param {arguments} - Eléments séparés compasant le nom (strings ou tableaux (de tableaux) de strings)
 * @return {string}
 */
function formatName() {
  return _(Array.from(arguments))
    .flattenDeep()
    .value()
    .join(" ")
    .replace(/\'\s/gi, "'")
    .replace(/\s+/gi, " ")
    .trim();
}

/**
 * joinLast
 * @description
 * Fonction équivalent à la méthode `Array.join` mais permettant de spécifier un séparateur particulier pour la dernière position.
 * A la différence de `.join` natif, gère correctement le cas où `arr` est `undefined`.
 * Cas évident : la conjonction "et" en fin de liste.
 * @param {string} separator Séparateur d'items
 * @param {string} lastSeparator Séparateur d'items pour la dernière position (entre l'avant-dernier et le dernier item)
 * @param {array} arr Tableau des items de liste à joindre
 * @returns {string}
 */
function joinLast(separator, lastSeparator, arr) {
  separator = separator || "";
  lastSeparator = lastSeparator || separator;

  arr = _(arr)
    .filter(i => !!i)
    .value(); // Elimine les items falsy

  function j(a) {
    a = a || [];
    if (a.length < 2) return a.join("");
    var last = a.pop();
    return `${a.join(separator)}${lastSeparator}${last}`;
    // return a.join(separator) + lastSeparator + last;
  }
  return j(arr);
}

/**
 * join
 * Helper lorsqu'on n'utilise qu'un seul séparateur
 * L'utiliser de préférence à `.join` natif.
 * @param {string} separator Séparateur d'items
 * @param {array} arr Tableau des items de liste à joindre
 * @returns {string}
 */
function join(separator, arr) {
  return joinLast(separator, separator, arr);
}

/**
 * normalizeTitle
 * @description
 * Normalise des valeurs de champs composant un titre de film.
 * Si le titre Vo est identique au title Fr, il n'est pas renvoyé.
 * Traitement supplémentaire : on retire les crochets droits, qui identifient dans Cinédoc les titres forgés.
 * @param {string|null} titleVo Titre original (sans article).
 * @param {string|null} artVo Article du titre original.
 * @param {string|null} titleFr Titre français (sans article).
 * @param {string|null} artFr Article du titre français.
 * @param {string|null} titleFrMod Titre français modifié (sans article), devant surcharger le titre français.
 * @param {string|null} artFrMod Article du titre français modifié, devant surcharger l'article du titre français.
 * @returns {Object} Objet de la forme { title: "", art: "", titleVo: "", artVo: "" }. Les champs null ne sont pas renvoyés.
 */
function normalizeTitle(titleVo, artVo, titleFr, artFr, titleFrMod, artFrMod) {
  let titleFieldName = "titre";
  let artFieldName = "art";
  let titleVoFieldName = "titreVo";
  let artVoFieldName = "artVo";
  let output = {};
  let art = "";
  let title = "";

  if (!!titleFrMod) {
    title = titleFrMod;
    art = artFrMod;
  } else if (!!titleFr) {
    title = titleFr;
    art = artFr;
  } else {
    title = titleVo;
    art = artVo;
  }

  // Cas où les titres sont strictement différents mais équivalents : le titreVo est le titre de référence
  if (
    _.kebabCase(title) === _.kebabCase(titleVo) &&
    _.kebabCase(art) === _.kebabCase(artVo)
  ) {
    title = titleVo;
    art = artVo;
    titleVo = artVo = "";
  }

  output[titleFieldName] = title;
  if (!!art) output[artFieldName] = art;

  if (title !== titleVo) {
    // Si le titreVo est différent de titre, on l'inclut
    output[titleVoFieldName] = titleVo;
    if (!!artVo) output[artVoFieldName] = artVo;
  }

  output = _(output)
    .mapValues(v => v.replace(/[\[\]]/g, "")) // Retire les crochets des titres (indiquant les titres forgés)
    .value();

  return output;
}

/**
 * de
 * @description
 * Renvoie "de " ou "d'" selon la chaîne passée en paramètre
 * @param {string} str
 * @returns {string}
 */
function de(str) {
  if (!str) return "";
  // if (!str) return;
  return _.indexOf("AEIOU", _.upperCase(_.deburr(str)).charAt(0)) > -1
    ? "d'"
    : "de ";
}

/**
 * expandCountries(codes)
 * Transforme une chaîne avec une liste de codes pays (ex. "ESP;FRA;ITA") par une chaîne avec les noms complets ("Espagne, France, Italie")
 * La liste des pays se trouve dans le tableau `config.countries`
 * @param codes {string}
 * @output {array}
 */
// function expandCountries(codes) {
//   return _(codes.split(";"))
//     .map(code => _.find(config.countries, f => f[0] === code)[1] || code)
//     .value()
// }

/**
 * precedeSuivi
 * @description
 * Formate des titres de la forme :
 * "Film précéde de...", "Film suivi de...", "Film précédé de... et suivi de..."
 * @param {Array} avant Tableau d'objets { idFilm, titre, art, realisateurs }
 * @param {Array} apres Tableau d'objets { idFilm, titre, art, realisateurs }
 * @returns {String} Chaîne formatée
 */
function precedeSuivi(avant, apres) {
  avant = joinLast(
    ", ",
    ", ",
    _(avant).map(function(d) {
      return `_${artTitre(
        d.art,
        d.titre
      )}_${beforeAfterStr(` ${(de(d.realisateurs), "", d.realisateurs)}`)}`;
      //return "_" + artTitre(d.art, d.titre) + "_" + beforeAfterStr(" " + de(d.realisateurs), "", d.realisateurs);
      // return "_" + artTitre(d.art, d.titre) + "_" + beforeAfterStr(" (", ")", d.realisateurs);
    })
  );
  apres = joinLast(
    ", ",
    ", ",
    _(apres).map(function(d) {
      return `_${artTitre(
        d.art,
        d.titre
      )}_${beforeAfterStr(` ${(de(d.realisateurs), "", d.realisateurs)}`)}`;
      // return "_" + artTitre(d.art, d.titre) + "_" + beforeAfterStr(" " + de(d.realisateurs), "", d.realisateurs);
      // return "_" + artTitre(d.art, d.titre) + "_" + beforeAfterStr(" (", ")", d.realisateurs);
    })
  );
  if (avant !== "" && apres != "") {
    return `Film précédé ${de(avant) + avant} et suivi de ${de(apres) + apres}`;
  } else if (avant !== "") {
    return `Film précédé ${de(avant) + avant}`;
  } else if (apres !== "") {
    return `Film suivi ${de(apres) + apres}`;
  } else {
    return "";
  }
}

/**
 * stripInvalidFilenameChars
 * Retire d'une chaîne les caractères non valides dans un nom de fichier (Windows).
 * @param {string} str
 * @returns {string}
 */
function stripInvalidFilenameChars(str) {
  try {
    return str.replace(/[\\/:*?"<>|]/gi, "");
  } catch (e) {
    console.error(e);
    return;
  }
}

/**
 * stripNewLines
 * Retire les sauts de ligne d'un texte (brut ou Markdown) en les remplaçant par un espace.
 * @param {string} str
 * @returns {string}
 */
function stripNewLines(str) {
  try {
    return str.replace(/\s*\n+/g, " ");
  } catch (e) {
    console.error(e);
    return;
  }
}

/**
 * nbsp
 * Remplace les espaces en position d'insécable (cas usuels) par un insécable
 * NB : temporairement (?) traité à part de cudm.
 * @param {string} str
 * @param {string} rep Chaîne à utiliser pour exprimer l'espace insécable (par défaut "&nbsp;")
 * @return {string}
 */
function nbsp(str, rep) {
  if (!str) return;
  if (!rep) rep = "&nbsp;";
  let o = str;
  o = o.replace(/(\x20)([\?:!;\xBB])/gi, `${rep}$2`); // Remplace un espace par un espace insécable dans les cas usuels
  o = o.replace(/(\xAB)(\x20)/gi, `$1${rep}`); // Remplace un espace par un espace insécable après un guillemet français ouvrant
  o = o.replace(/(\s–)/gi, `${rep}–`); // Demi-cadratins
  o = o.replace(/(–\s)/gi, `–${rep}`); // Demi-cadratins
  return o;
}

module.exports = {
  artTitre: artTitre,
  beforeAfterStr: beforeAfterStr,
  concatDates: concatDates,
  // cudm: require("./cudm.js"),
  // expandCountries: expandCountries,
  formatName: formatName,
  join: join,
  joinLast: joinLast,
  de: de,
  nbsp: nbsp,
  normalizeTitle: normalizeTitle,
  stripNewLines: stripNewLines,
  stripInvalidFilenameChars: stripInvalidFilenameChars,
  precedeSuivi: precedeSuivi
};
