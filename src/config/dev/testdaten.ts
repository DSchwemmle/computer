/*
 * Copyright (C) 2020 - present Juergen Zimmermann, Hochschule Karlsruhe
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
import { type Computer } from '../../computer/entity/computer.entity.js';

// TypeORM kann keine SQL-Skripte ausfuehren

export const computerList: Computer[] = [
    // -------------------------------------------------------------------------
    // L e s e n
    // -------------------------------------------------------------------------
    {
        id: '00000000-0000-0000-0000-000000000001',
        version: 0,
        name: 'Dell XPS 15',
        art: 'NOTEBOOK',
        prozessor: 'Intel Core i9-12900HK',
        grafikkarte: 'NVIDIA GeForce RTX 3050 Ti',
        arbeitsspeicher: '32 GB',
        massenspeicher: '1024 GB',
        preis: 4999.99,
        betriebssystem: 'Windows 11 Pro',
        homepage: 'https://dell.com/',
        // eslint-disable-next-line unicorn/numeric-separators-style
        artikelnummer: 1234567890,
        lieferbar: true,
        erzeugt: new Date('2022-02-01'),
        aktualisiert: new Date('2022-02-01'),
    },
    {
        id: '00000000-0000-0000-0000-000000000002',
        version: 0,
        name: 'Medion Erazer Engineer P10',
        art: 'DESKTOP-PC',
        prozessor: 'Intel Core i5-12400',
        grafikkarte: 'NVIDIA GeForce RTX 3060',
        arbeitsspeicher: '16 GB',
        massenspeicher: '1024 GB',
        preis: 1049.99,
        betriebssystem: 'Windows 11 Home',
        homepage: 'https://medion.com/',
        // eslint-disable-next-line unicorn/numeric-separators-style
        artikelnummer: 9234567890,
        lieferbar: false,
        erzeugt: new Date('2022-02-02'),
        aktualisiert: new Date('2022-02-02'),
    },
    {
        id: '00000000-0000-0000-0000-000000000003',
        version: 0,
        name: 'Samsung Galaxy Book2 Pro',
        art: 'NOTEBOOK',
        prozessor: 'Intel Core i7-1260P',
        grafikkarte: 'Intel Iris Xe Graphics',
        arbeitsspeicher: '16 GB',
        massenspeicher: '512 GB',
        preis: 1549.99,
        betriebssystem: 'Windows 11 Home',
        homepage: 'https://samsung.com/',
        // eslint-disable-next-line unicorn/numeric-separators-style
        artikelnummer: 9834567890,
        lieferbar: true,
        erzeugt: new Date('2022-02-03'),
        aktualisiert: new Date('2022-02-03'),
    },
    // -------------------------------------------------------------------------
    // A e n d e r n
    // -------------------------------------------------------------------------
    {
        id: '00000000-0000-0000-0000-000000000040',
        version: 0,
        name: 'Apple iMac Pro',
        art: 'DESKTOP-PC',
        prozessor: 'Apple M1 Pro',
        grafikkarte: 'Apple M1 Pro',
        arbeitsspeicher: '64 GB',
        massenspeicher: '2048 GB',
        preis: 9999,
        betriebssystem: 'macOS Ventura',
        homepage: 'https://apple.com/',
        // eslint-disable-next-line unicorn/numeric-separators-style
        artikelnummer: 1237995832,
        lieferbar: true,
        erzeugt: new Date('2022-02-05'),
        aktualisiert: new Date('2022-02-05'),
    },
    // -------------------------------------------------------------------------
    // L o e s c h e n
    // -------------------------------------------------------------------------
    {
        id: '00000000-0000-0000-0000-000000000050',
        version: 0,
        name: 'DELETE ME RAZER Blade 17',
        art: 'NOTEBOOK',
        prozessor: 'Intel Core i7-12800H',
        grafikkarte: 'NVIDIA GeForce RTX 3060',
        arbeitsspeicher: '16 GB',
        massenspeicher: '1024 GB',
        preis: 2949,
        betriebssystem: 'Windows 11 Pro',
        homepage: 'https://razer.com/',
        // eslint-disable-next-line unicorn/numeric-separators-style
        artikelnummer: 1797995832,
        lieferbar: true,
        erzeugt: new Date('2022-02-06'),
        aktualisiert: new Date('2022-02-06'),
    },
    {
        id: '00000000-0000-0000-0000-000000000060',
        version: 0,
        name: 'DELETE ME Huawei Matebook D15',
        art: 'NOTEBOOK',
        prozessor: 'AMD Ryzen 5',
        grafikkarte: 'AMD Radeon Grafik',
        arbeitsspeicher: '8 GB',
        massenspeicher: '512 GB',
        preis: 549.99,
        betriebssystem: 'Windows 11 Home',
        homepage: 'https://huawei.com/',
        // eslint-disable-next-line unicorn/numeric-separators-style
        artikelnummer: 9834817890,
        lieferbar: false,
        erzeugt: new Date('2022-02-07'),
        aktualisiert: new Date('2022-02-07'),
    },
];
