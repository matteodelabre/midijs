/*jshint node:true, browser:true */

'use strict';

// program types
var types = exports.types = [
    'piano', 'percussive', 'percussion', 'effect',
    'brass', 'pipe', 'string', 'synth', 'guitar',
    'orchestra', 'bass', 'organ'
];

// list of programs defined in the General MIDI standard
// http://en.wikipedia.org/wiki/General_MIDI
exports.programs = [
    'Grand piano acoustique', 'Piano acoustique', 'Grand piano électrique',
    'Piano bastringue', 'Piano électrique', 'Piano - effet chorus',
    'Clavecin', 'Clavinet', 'Celesta', 'Glockenspiel', 'Boîte à musique',
    'Vibraphone', 'Marimba', 'Xylophone', 'Cloches tubulaires', 'Tympanon',
    'Orgue Hammond', 'Orgue à percussion', 'Orgue - Rock', 'Grandes orgues',
    'Harmonium', 'Accordéon', 'Harmonica', 'Accordéon tango',
    'Guitare classique', 'Guitare sèche', 'Guitare électrique - Jazz',
    'Guitare électrique - son clair', 'Guitare électrique - sourdine',
    'Guitare saturée', 'Guitare avec distorsion', 'Harmoniques de guitare',
    'Basse acoustique sans frettes', 'Basse électrique',
    'Basse électrique - médiator', 'Basse sans frettes', 'Basse - slap 1',
    'Basse - slap 2', 'Basse synthé 1', 'Basse synthé 2', 'Violon',
    'Violon alto', 'Violoncelle', 'Contrebasse', 'Cordes - trémolo',
    'Cordes - pizzicato', 'Harpe', 'Timbales',
    'Ensemble acoustique à Cordes 1', 'Ensemble acoustique à Cordes 2',
    'Cordes synthé 1', 'Cordes synthé 2', 'Chœur - "Aah"', 'Voix - "Ooh"',
    'Voix synthétique', 'Coup d\'orchestre', 'Trompette', 'Trombone', 'Tuba',
    'Trompette en sourdine', 'Cor d\'harmonie', 'Section de cuivres',
    'Cuivres synthé', 'Cuivres synthé', 'Saxophone soprano', 'Saxophone alto',
    'Saxophone ténor', 'Saxophone baryton', 'Hautbois', 'Cor anglais',
    'Basson', 'Clarinette', 'Piccolo', 'Flûte', 'Flûte à bec', 'Flûte de pan',
    'Bouteille - souffle', 'Shakuhachi', 'Sifflet', 'Ocarina', 'Signal carré',
    'Signal dents de scie', 'Orgue à vapeur', 'Chiffer', 'Charang',
    'Voix solo', 'Signal dent de scie en quinte', 'Basse & Solo', 'Fantaisie',
    'Son chaleureux', 'Polysynthé', 'Chœur', 'Archet', 'Métallique', 'Halo',
    'Balai', 'Pluie de glace', 'Trames sonores', 'Cristal', 'Atmosphère',
    'Brillance', 'Gobelins', 'Échos', 'Espace', 'Sitar', 'Banjo', 'Shamisen',
    'Koto', 'Kalimba', 'Cornemuse', 'Viole', 'Shehnai', 'Clochettes', 'Agogo',
    'Batterie métallique', 'Planchettes', 'Timbales', 'Tom mélodique',
    'Tambour synthétique', 'Cymbale - inversée', 'Guitare - bruit de frette',
    'Respiration', 'Rivage', 'Gazouilli', 'Sonnerie de téléphone',
    'Hélicoptère', 'Applaudissements', 'Coup de feu'
];

exports.getType = function (id) {
    if (id >= 0 && id <= 7) {
        return types[0];
    } else if ((id >= 8 && id <= 15) || (id >= 104 && id <= 119)) {
        return types[1];
    } else if (id >= 16 && id <= 23) {
        return types[11];
    } else if (id >= 24 && id <= 31) {
        return types[8];
    } else if (id >= 32 && id <= 39) {
        return types[10];
    } else if (id >= 40 && id <= 47) {
        return types[6];
    } else if (id >= 48 && id <= 55) {
        return types[9];
    } else if (id >= 56 && id <= 71) {
        return types[4];
    } else if (id >= 72 && id <= 79) {
        return types[5];
    } else if (id >= 80 && id <= 95) {
        return types[7];
    } else if ((id >= 96 && id <= 103) || (id >= 120 && id <= 127)) {
        return types[3];
    } else {
        return '';
    }
};