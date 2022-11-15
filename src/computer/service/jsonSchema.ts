/*
 * Copyright (C) 2019 - present Juergen Zimmermann, Hochschule Karlsruhe
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
import { type GenericJsonSchema } from './GenericJsonSchema.js';

export const MAX_RATING = 5;

export const jsonSchema: GenericJsonSchema = {
    // naechstes Release: 2021-02-01
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    $id: 'https://acme.com/computer.json#',
    title: 'Computer',
    description: 'Eigenschaften eines Computers: Typen und Constraints',
    type: 'object',
    properties: {
        id: {
            type: 'string',
            pattern:
                '^[\\dA-Fa-f]{8}-[\\dA-Fa-f]{4}-[\\dA-Fa-f]{4}-[\\dA-Fa-f]{4}-[\\dA-Fa-f]{12}$',
        },
        version: {
            type: 'number',
            minimum: 0,
        },
        name: { type: 'string' },
        art: {
            type: 'string',
            enum: ['NOTEBOOK', 'DESKTOP-PC', ''],
        },
        prozessor: { type: 'string' },
        grafikkarte: { type: 'string' },
        arbeitsspeicher: { type: 'string' },
        massenspeicher: { type: 'string' },
        preis: {
            type: 'number',
            minimum: 0,
        },
        betriebssystem: { type: 'string' },
        homepage: { type: 'string', format: 'uri' },
        artikelnummer: { type: 'number' },
        lieferbar: { type: 'boolean' },
        erzeugt: { type: ['string', 'null'] },
        aktualisiert: { type: ['string', 'null'] },
    },
    required: [
        'name',
        'prozessor',
        'grafikkarte',
        'arbeitsspeicher',
        'massenspeicher',
        'preis',
        'betriebssystem',
        'artikelnummer',
    ],
    additionalProperties: false,
    errorMessage: {
        properties: {
            version: 'Die Versionsnummer muss mindestens 0 sein.',
            name: 'Ein Computer muss mit einem Buchstaben, einer Ziffer oder _ beginnen.',
            art: 'Die Art eines Computers muss NOTEBOOK oder DESKTOP-PC sein.',
            prozessor: 'Ein Prozessor muss vorhanden sein.',
            grafikkarte: 'Eine Grafikkarte muss vorhanden sein.',
            arbeitsspeicher: 'Arbeitsspeicher muss verbaut sein.',
            massenspeicher:
                'Der Massenspeicer in Form einer HDD oder SSD muss vorhanden sein.',
            preis: 'Der Preis darf nicht negativ sein.',
            betriebssystem: 'Ein Betriebssystem muss installiert sein.',
            homepage: 'Die Homepage ist nicht korrekt.',
            artikelnummer: 'Die Artikelnummer ist nicht korrekt.',
            lieferbar: '"lieferbar" muss auf true oder false gesetzt sein.',
        },
    },
};
