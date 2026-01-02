// Mindeststärke, ab der ein Genre überhaupt als relevant gilt.
// Filtert Rauschen und zufällige Einzeltreffer aus.
export const GENRE_THRESHOLD = 0.15;

// Mindeststärke für Tags.
// Höher als bei Genres, da Tags feiner und anfälliger für Zufall sind.
export const TAG_THRESHOLD = 0.2;

// Verstärkungsfaktor für negative Genres bei geringer Exposure.
// Selten gesehen + klar abgelehnt = stark negatives Signal.
export const NEG_SCARCITY_ALPHA_GENRE = 1.1;

// Verstärkungsfaktor für negative Tags bei geringer Exposure.
// Tags sind spezifischer → stärkere Bestrafung als Genres.
export const NEG_SCARCITY_ALPHA_TAG = 1.3;

// Grund-Malus für Genres, die der Nutzer noch nie gesehen hat.
// Bedeutet Desinteresse, kein aktiver Hass.
export const UNSEEN_GENRE_PENALTY = 0.6;

// Grund-Malus für Tags, die der Nutzer noch nie gesehen hat.
// Schwächer als Genres, da unbekannte Tags weniger aussagekräftig sind.
export const UNSEEN_TAG_PENALTY = 0.4;

// Mindestanzahl globaler Vorkommen, damit ein Tag statistisch relevant ist.
// Verhindert, dass extrem seltene Tags das Profil verzerren.
export const MIN_GLOBAL_TAG_COUNT = 50;

// Mindestwert, ab dem ein Genre als wirklich positiv gilt.
// Alles darunter ist zu schwach, um Empfehlungen zu tragen.
export const POSITIVE_GENRE_MIN = 3.5;

// Faktor zur Umklassifizierung schwacher positiver Genres.
// Schwach positiv → leicht negativ, da es eher Desinteresse signalisiert.
export const WEAK_GENRE_NEGATIVE_FACTOR = 0.6;


export const CORE_GENRE_EXPOSURE_BOOST = 1.5 * 100;
