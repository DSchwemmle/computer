/**
 * Das Modul besteht aus der Klasse {@linkcode ComputerReadService}.
 * @packageDocumentation
 */

import { Computer, type ComputerArt } from './../entity/computer.entity.js';
import { ComputerValidationService } from './computer-validation.service.js';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { QueryBuilder } from './query-builder.js';
import { Repository } from 'typeorm';
import { getLogger } from '../../logger/logger.js';

export interface Suchkriterien {
    readonly name?: string;
    readonly art?: ComputerArt;
    readonly prozessor?: string;
    readonly grafikkarte?: string;
    readonly arbeitsspeicher?: string;
    readonly massenspeicher?: string;
    readonly preis?: number;
    readonly betriebssystem?: string;
    readonly homepage?: string;
    readonly artikelnummer?: number;
    readonly lieferbar?: boolean;
}

/**
 * Die Klasse `ComputerReadService` implementiert das Lesen für Computer(Plural) und greift
 * mit _TypeORM_ auf eine relationale DB zu.
 */
@Injectable()
export class ComputerReadService {
    readonly #repo: Repository<Computer>;

    readonly #computerProps: string[];

    readonly #queryBuilder: QueryBuilder;

    readonly #validationService: ComputerValidationService;

    readonly #logger = getLogger(ComputerReadService.name);

    constructor(
        @InjectRepository(Computer) repo: Repository<Computer>,
        queryBuilder: QueryBuilder,
        validationService: ComputerValidationService,
    ) {
        this.#repo = repo;
        const computerDummy = new Computer();
        this.#computerProps = Object.getOwnPropertyNames(computerDummy);
        this.#queryBuilder = queryBuilder;
        this.#validationService = validationService;
    }

    // Merken fürs Verständnis:
    // Rueckgabetyp Promise bei asynchronen Funktionen
    //    ab ES2015
    //    vergleiche Task<> bei C# und Mono<> aus Project Reactor
    // Status eines Promise:
    //    Pending: das Resultat ist noch nicht vorhanden, weil die asynchrone
    //             Operation noch nicht abgeschlossen ist
    //    Fulfilled: die asynchrone Operation ist abgeschlossen und
    //               das Promise-Objekt hat einen Wert
    //    Rejected: die asynchrone Operation ist fehlgeschlagen and das
    //              Promise-Objekt wird nicht den Status "fulfilled" erreichen.
    //              Im Promise-Objekt ist dann die Fehlerursache enthalten.

    /**
     * Einen Computer asynchrom anhand seiner ID suchen
     * @param id ID des gesuchten Computers
     * @returns Der gefundene Computer vom Typ [Computer](computer_entity_computer_entity.Computer.html)
     *          oder undefined in einem Promise aus ES2015 (vgl. Future aus Java)
     */
    async findById(id: string) {
        this.#logger.debug('findById: id=%s', id);

        if (!this.#validationService.validateId(id)) {
            this.#logger.debug('findById: Ungueltige ID');
            return;
        }

        // https://typeorm.io/working-with-repository
        // Das Resultat ist undefined, falls kein Datensatz gefunden
        // Lesen: Keine Transaktion erforderlich
        const computer = await this.#queryBuilder.buildId(id).getOne();
        if (computer === null) {
            this.#logger.debug('findById: Keinen Computer gefunden');
            return;
        }

        this.#logger.debug('findById: computer=%o', computer);
        return computer;
    }

    /**
     * ComputerList asynchron suchen.
     * @param suchkriterien JSON-Objekt mit Suchkriterien
     * @returns Ein JSON-Array mit der gefundenen ComputerList. Ggf. ist das Array leer.
     */
    async find(suchkriterien?: Suchkriterien) {
        this.#logger.debug('find: suchkriterien=%o', suchkriterien);

        // Keine Suchkriterien?
        if (suchkriterien === undefined) {
            return this.#findAll();
        }
        const keys = Object.keys(suchkriterien);
        if (keys.length === 0) {
            return this.#findAll();
        }

        // Falsche Namen fuer Suchkriterien?
        if (!this.#checkKeys(keys)) {
            return [];
        }

        // QueryBuilder https://typeorm.io/select-query-builder
        // Das Resultat ist eine leere Liste, falls nichts gefunden
        // Lesen: Keine Transaktion erforderlich
        const computerList = await this.#queryBuilder
            .build(suchkriterien)
            .getMany();
        this.#logger.debug('find: buecher=%o', computerList);

        return computerList;
    }

    async #findAll() {
        const computerList = await this.#repo.find();
        return computerList;
    }

    #checkKeys(keys: string[]) {
        // Ist jedes Suchkriterium auch eine Property von Computer
        let validKeys = true;
        keys.forEach((key) => {
            if (!this.#computerProps.includes(key)) {
                this.#logger.debug(
                    '#find: ungueltiges Suchkriterium "%s"',
                    key,
                );
                validKeys = false;
            }
        });

        return validKeys;
    }
}
