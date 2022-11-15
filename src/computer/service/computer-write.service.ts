/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable sort-imports */
/**
 * Das Modul besteht aus der Klasse {@linkcode ComputerWriteService} für die
 * Schreiboperationen im Anwendungskern.
 * @packageDocumentation
 */

import { Computer } from '../entity/computer.entity.js';
import {
    type ComputerNotExists,
    type CreateError,
    type NameExists,
    type UpdateError,
    type VersionInvalid,
    type VersionOutdated,
} from './errors.js';
import { type DeleteResult, Repository } from 'typeorm';
import { ComputerReadService } from './computer-read.service.js';
import { ComputerValidationService } from './computer-validation.service.js';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import RE2 from 're2';
import { getLogger } from '../../logger/logger.js';
import { v4 as uuid } from 'uuid';

/**
 * Die Klasse `ComputerWriteService` implementiert den Anwendungskern für das
 * Schreiben von ComputerList und greift mit _TypeORM_ auf die DB zu.
 */
@Injectable()
export class ComputerWriteService {
    private static readonly VERSION_PATTERN = new RE2('^"\\d*"');

    readonly #repo: Repository<Computer>;

    readonly #readService: ComputerReadService;

    readonly #validationService: ComputerValidationService;

    readonly #logger = getLogger(ComputerWriteService.name);

    constructor(
        @InjectRepository(Computer) repo: Repository<Computer>,
        readService: ComputerReadService,
        validationService: ComputerValidationService,
    ) {
        this.#repo = repo;
        this.#readService = readService;
        this.#validationService = validationService;
    }

    /**
     * Ein neuer Computer soll angelegt werden.
     * @param computer Der neu anzulegende Computer
     * @returns Die ID des neu angelegten Computers oder im Fehlerfall
     * [CreateError](../types/computer_service_errors.CreateError.html)
     */
    async create(computer: Computer): Promise<CreateError | string> {
        this.#logger.debug('create: computer=%o', computer);
        const validateResult = await this.#validateCreate(computer);
        if (validateResult !== undefined) {
            return validateResult;
        }

        computer.id = uuid(); // eslint-disable-line require-atomic-updates

        // implizite Transaktion
        const computerDb = await this.#repo.save(computer); // implizite Transaktion
        this.#logger.debug('create: computerDb=%o', computerDb);

        return computerDb.id!; // eslint-disable-line @typescript-eslint/no-non-null-assertion
    }

    /**
     * Ein vorhandener Computer soll aktualisiert wereden.
     * @param computer Der zu aktualisierende Computer
     * @param id ID des zu aktualisierenden Computers
     * @param version Die Versionsnummer für optimistische Synchronisation
     * @returns Die neue Versionsnummer gemäß optimistischer Synchronisation oder im Fehlerfall
     *          [UpdateError](../types/computer_service_errors.UpdateError.html)
     */
    async update(
        id: string | undefined,
        computer: Computer,
        version: string,
    ): Promise<UpdateError | number> {
        this.#logger.debug(
            'update: id=%s, computer=%o, version=%s',
            id,
            computer,
            version,
        );
        if (id === undefined || !this.#validationService.validateId(id)) {
            this.#logger.debug('update: Keine gueltige ID');
            return { type: 'ComputerNotExists', id };
        }

        const validateResult = await this.#validateUpdate(
            computer,
            id,
            version,
        );
        this.#logger.debug('update: validateResult=%o', validateResult);
        if (!(validateResult instanceof Computer)) {
            return validateResult;
        }

        const computerNeu = validateResult;
        const merged = this.#repo.merge(computerNeu);
        this.#logger.debug('update: merged=%o', merged);
        const updated = await this.#repo.save(merged); // implizite Transaktion
        this.#logger.debug('update: updated=%o', updated);

        return updated.version!; // eslint-disable-line @typescript-eslint/no-non-null-assertion
    }

    /**
     * Ein Computer wird asynchrom anhand seiner ID gelöscht.
     *
     * @param id ID des zu löschenden Computers
     * @returs true, falls der Computer vorhanden war und gelöscht wurde. Andernfalls false.
     */
    async delete(id: string) {
        this.#logger.debug('delete: id=%s', id);
        if (!this.#validationService.validateId(id)) {
            this.#logger.debug('delete: Keine gueltige ID');
            return false;
        }

        const computer = await this.#readService.findById(id);
        if (computer === undefined) {
            return false;
        }

        let deleteResult: DeleteResult | undefined;
        await this.#repo.manager.transaction(async (transactionalMgr) => {
            // Den Computer zur gegebenen ID asynchron loeschen
            deleteResult = await transactionalMgr.delete(Computer, id);
            this.#logger.debug('delete: deleteResult=%o', deleteResult);
        });

        return (
            deleteResult?.affected !== undefined &&
            deleteResult.affected !== null &&
            deleteResult.affected > 0
        );
    }

    async #validateCreate(
        computer: Computer,
    ): Promise<CreateError | undefined> {
        const validateResult = this.#validationService.validate(computer);
        if (validateResult !== undefined) {
            const messages = validateResult;
            this.#logger.debug('#validateCreate: messages=%o', messages);
            return { type: 'ConstraintViolations', messages };
        }

        const { name } = computer;
        let computerList = await this.#readService.find({ name: name }); // eslint-disable-line object-shorthand
        if (computerList.length > 0) {
            return { type: 'NameExists', name };
        }

        const { artikelnummer } = computer;
        computerList = await this.#readService.find({
            artikelnummer,
        });
        if (computerList.length > 0) {
            return { type: 'ArtikelnummerExists', artikelnummer };
        }

        this.#logger.debug('#validateCreate: ok');
        return undefined;
    }

    async #validateUpdate(
        computer: Computer,
        id: string,
        versionStr: string,
    ): Promise<Computer | UpdateError> {
        const result = this.#validateVersion(versionStr);
        if (typeof result !== 'number') {
            return result;
        }

        const version = result;
        this.#logger.debug(
            '#validateUpdate: computer=%o, version=%s',
            computer,
            version,
        );

        const validateResult = this.#validationService.validate(computer);
        if (validateResult !== undefined) {
            const messages = validateResult;
            this.#logger.debug('#validateUpdate: messages=%o', messages);
            return { type: 'ConstraintViolations', messages };
        }

        const resultName = await this.#checkNameExists(computer);
        if (resultName !== undefined && resultName.id !== id) {
            return resultName;
        }

        const resultFindById = await this.#findByIdAndCheckVersion(id, version);
        this.#logger.debug('#validateUpdate: %o', resultFindById);
        return resultFindById;
    }

    #validateVersion(version: string | undefined): VersionInvalid | number {
        if (
            version === undefined ||
            !ComputerWriteService.VERSION_PATTERN.test(version)
        ) {
            const error: VersionInvalid = { type: 'VersionInvalid', version };
            this.#logger.debug('#validateVersion: VersionInvalid=%o', error);
            return error;
        }

        return Number.parseInt(version.slice(1, -1), 10);
    }

    async #checkNameExists(
        computer: Computer,
    ): Promise<NameExists | undefined> {
        const { name } = computer;

        const computerList = await this.#readService.find({ name: name }); // eslint-disable-line object-shorthand
        if (computerList.length > 0) {
            const [gefundenerComputer] = computerList;
            const { id } = gefundenerComputer!; // eslint-disable-line @typescript-eslint/no-non-null-assertion
            this.#logger.debug('#checkNameExists: id=%s', id);
            return { type: 'NameExists', name, id: id! }; // eslint-disable-line @typescript-eslint/no-non-null-assertion
        }

        this.#logger.debug('#checkNameExists: ok');
        return undefined;
    }

    async #findByIdAndCheckVersion(
        id: string,
        version: number,
    ): Promise<Computer | ComputerNotExists | VersionOutdated> {
        const computerDb = await this.#readService.findById(id);
        if (computerDb === undefined) {
            const result: ComputerNotExists = { type: 'ComputerNotExists', id };
            this.#logger.debug(
                '#checkIdAndVersion: ComputerNotExists=%o',
                result,
            );
            return result;
        }

        // nullish coalescing
        const versionDb = computerDb.version!; // eslint-disable-line @typescript-eslint/no-non-null-assertion
        if (version < versionDb) {
            const result: VersionOutdated = {
                type: 'VersionOutdated',
                id,
                version,
            };
            this.#logger.debug(
                '#checkIdAndVersion: VersionOutdated=%o',
                result,
            );
            return result;
        }

        return computerDb;
    }
}
