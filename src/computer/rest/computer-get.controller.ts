/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable max-lines */

/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable max-params */
/* eslint-disable max-lines-per-function */
/**
 * Das Modul besteht aus der Controller-Klasse für Lesen an der REST-Schnittstelle.
 * @packageDocumentation
 */

// eslint-disable-next-line max-classes-per-file
import {
    ApiHeader,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiParam,
    ApiProperty,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import { type Computer, type ComputerArt } from '../entity/computer.entity.js';
import {
    ComputerReadService,
    type Suchkriterien,
} from '../service/computer-read.service.js';
import {
    Controller,
    Get,
    Headers,
    HttpStatus,
    Param,
    Query,
    Req,
    Res,
    UseInterceptors,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ResponseTimeInterceptor } from '../../logger/response-time.interceptor.js';
import { getBaseUri } from './getBaseUri.js';
import { getLogger } from '../../logger/logger.js';

// TypeScript
interface Link {
    href: string;
}
interface Links {
    self: Link;
    // optional
    list?: Link;
    add?: Link;
    update?: Link;
    remove?: Link;
}

// Interface fuer GET-Request mit Links fuer HATEOAS
export type ComputerModel = Omit<
    Computer,
    'aktualisiert' | 'erzeugt' | 'id' | 'version'
> & {
    _links: Links;
};

export interface ComputerListModel {
    _embedded: {
        computerList: ComputerModel[];
    };
}

/**
 * Klasse für `ComputerGetController`, um Queries in _OpenAPI_ bzw. Swagger zu
 * formulieren. `ComputerController` hat dieselben Properties wie die Basisklasse
 * `Computer` - allerdings mit dem Unterschied, dass diese Properties beim Ableiten
 * so überschrieben sind, dass sie auch nicht gesetzt bzw. undefined sein
 * dürfen, damit die Queries flexibel formuliert werden können. Deshalb ist auch
 * immer der zusätzliche Typ undefined erforderlich.
 * Außerdem muss noch `string` statt `Date` verwendet werden, weil es in OpenAPI
 * den Typ Date nicht gibt.
 */
export class ComputerQuery implements Suchkriterien {
    @ApiProperty({ required: false })
    declare readonly name: string;

    @ApiProperty({ required: false })
    declare readonly art: ComputerArt;

    @ApiProperty({ required: false })
    declare readonly prozessor: string;

    @ApiProperty({ required: false })
    declare readonly grafikkarte: string;

    @ApiProperty({ required: false })
    declare readonly arbeitsspeicher: string;

    @ApiProperty({ required: false })
    declare readonly massenspeicher: string;

    @ApiProperty({ required: false })
    declare readonly preis: number;

    @ApiProperty({ required: false })
    declare readonly betriebssystem: string;

    @ApiProperty({ required: false })
    declare readonly homepage: string;

    @ApiProperty({ required: false })
    declare readonly artikelnummer: number;

    @ApiProperty({ required: false })
    declare readonly lieferbar: boolean;
}

/**
 * Die Controller-Klasse für die Verwaltung von ComputerList.
 */
@Controller()
@UseInterceptors(ResponseTimeInterceptor)
@ApiTags('Computer API')
export class ComputerGetController {
    readonly #service: ComputerReadService;

    readonly #logger = getLogger(ComputerGetController.name);

    // Dependency Injection (DI) bzw. Constructor Injection
    // constructor(private readonly service: ComputerReadService) {}
    constructor(service: ComputerReadService) {
        this.#service = service;
    }

    /**
     * Ein Computer wird asynchron anhand seiner ID als Pfadparameter gesucht.
     *
     * Falls es einen solchen Computer gibt und `If-None-Match` im Request-Header
     * auf die aktuelle Version des Computers gesetzt war, wird der Statuscode
     * `304` (`Not Modified`) zurückgeliefert. Falls `If-None-Match` nicht
     * gesetzt ist oder eine veraltete Version enthält, wird das gefundene
     * Computer um Rumpf des Response als JSON-Datensatz mit Atom-Links für HATEOAS
     * und dem Statuscode `200` (`OK`) zurückgeliefert.
     *
     * Falls es keinen Computer zur angegebenen ID gibt, wird der Statuscode `404`
     * (`Not Found`) zurückgeliefert.
     *
     * @param id Pfad-Parameter `id`
     * @param req Request-Objekt von Express mit Pfadparameter, Query-String,
     *            Request-Header und Request-Body
     * @param version Versionsnummer im Request-Header bei `If-None-Match`
     * @param accept Content-Type bzw. MIME-Type
     * @param res Leeres Response-Objekt von Express
     * @returns Leeres Promise-Objekt
     */

    @Get(':id')
    @ApiOperation({ summary: 'Suche mit der Computer-ID', tags: ['Suchen'] })
    @ApiParam({
        name: 'id',
        description: 'Z.B. 00000000-0000-0000-0000-000000000001',
    })
    @ApiHeader({
        name: 'If-None-Match',
        description: 'Header für bedingte GET-Requests, z.B. "0"',
        required: false,
    })
    @ApiOkResponse({ description: 'Der Computer wurde gefunden' })
    @ApiNotFoundResponse({ description: 'Kein Computer zur ID gefunden' })
    @ApiResponse({
        status: HttpStatus.NOT_MODIFIED,
        description: 'Der Computer wurde bereits heruntergeladen',
    })
    async findById(
        @Param('id') id: string,
        @Req() req: Request,
        @Headers('If-None-Match') version: string | undefined,
        @Res() res: Response,
    ): Promise<Response<ComputerModel | undefined>> {
        this.#logger.debug('findById: id=%s, version=%s"', id, version);

        if (req.accepts(['json', 'html']) === false) {
            this.#logger.debug('findById: accepted=%o', req.accepted);
            return res.sendStatus(HttpStatus.NOT_ACCEPTABLE);
        }

        let computer: Computer | undefined;
        try {
            // vgl. Kotlin: Aufruf einer suspend-Function
            computer = await this.#service.findById(id);
        } catch (err) {
            // err ist implizit vom Typ "unknown", d.h. keine Operationen koennen ausgefuehrt werden
            // Exception einer export async function bei der Ausfuehrung fangen:
            // https://strongloop.com/strongblog/comparing-node-js-promises-trycatch-zone-js-angular
            this.#logger.error('findById: error=%o', err);
            return res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
        }

        if (computer === undefined) {
            this.#logger.debug('findById: NOT_FOUND');
            return res.sendStatus(HttpStatus.NOT_FOUND);
        }
        this.#logger.debug('findById(): computer=%o', computer);

        // ETags
        const versionDb = computer.version;
        if (version === `"${versionDb}"`) {
            this.#logger.debug('findById: NOT_MODIFIED');
            return res.sendStatus(HttpStatus.NOT_MODIFIED);
        }
        this.#logger.debug('findById: versionDb=%s', versionDb);
        res.header('ETag', `"${versionDb}"`);

        // HATEOAS mit Atom Links und HAL (= Hypertext Application Language)
        const computerModel = this.#toModel(computer, req);
        this.#logger.debug('findById: computerModel=%o', computerModel);
        return res.json(computerModel);
    }

    /**
     * ComputerList werden mit Query-Parametern asynchrom gesucht. Falls es mindestens
     * einen solchen Computer gibt, wird der Statuscode `200` (`OK`) gesetzt. Im Rumpf
     * des Response ist das JSON-Array mit den gefundenen Computern, die jeweils
     * um Atom-Links für HATEOAS ergänzt sind.
     *
     * Falls es keinen Computer zu den Suchkriterien gibt, wird der Statuscode `404`
     * (`Not Found`) gesetzt.
     *
     * Falls es keine Query-Parameter gibt, werden alle Computer(als ComputerList) ermittelt.
     *
     * @param query Query-Parameter von Express
     * @param req Request-Objekt von Express
     * @param res Leeres Response-Objekt von Express
     * @returns Leeres Promise-Objekt
     */
    @Get()
    @ApiOperation({ summary: 'Suche mit Suchkriterien', tags: ['Suchen'] })
    @ApiOkResponse({
        description: 'Eine evtl. leere Liste mit Computern(Plural)',
    })
    async find(
        @Query() query: ComputerQuery,
        @Req() req: Request,
        @Res() res: Response,
    ): Promise<Response<ComputerListModel | undefined>> {
        this.#logger.debug('find: query=%o', query);

        if (req.accepts(['json', 'html']) === false) {
            this.#logger.debug('find: accepted=%o', req.accepted);
            return res.sendStatus(HttpStatus.NOT_ACCEPTABLE);
        }

        const computerList = await this.#service.find(query);
        this.#logger.debug('find: %o', computerList);
        if (computerList.length === 0) {
            this.#logger.debug('find: NOT_FOUND');
            return res.sendStatus(HttpStatus.NOT_FOUND);
        }

        // HATEOAS: Atom Links je Computer
        const computerListModel = computerList.map((computer: Computer) =>
            this.#toModel(computer, req, false),
        );
        this.#logger.debug('find: computerListModel=%o', computerListModel);

        const result: ComputerListModel = {
            _embedded: { computerList: computerListModel },
        };
        return res.json(result).send();
    }

    #toModel(computer: Computer, req: Request, all = true) {
        const baseUri = getBaseUri(req);
        this.#logger.debug('#toModel: baseUri=%s', baseUri);
        const { id } = computer;
        const links = all
            ? {
                  self: { href: `${baseUri}/${id}` },
                  list: { href: `${baseUri}` },
                  add: { href: `${baseUri}` },
                  update: { href: `${baseUri}/${id}` },
                  remove: { href: `${baseUri}/${id}` },
              }
            : { self: { href: `${baseUri}/${id}` } };

        this.#logger.debug('#toModel: computer=%o, links=%o', computer, links);
        /* eslint-disable unicorn/consistent-destructuring */
        const computerModel: ComputerModel = {
            name: computer.name,
            art: computer.art,
            prozessor: computer.prozessor,
            grafikkarte: computer.grafikkarte,
            arbeitsspeicher: computer.arbeitsspeicher,
            massenspeicher: computer.massenspeicher,
            preis: computer.preis,
            betriebssystem: computer.betriebssystem,
            homepage: computer.homepage,
            artikelnummer: computer.artikelnummer,
            lieferbar: computer.lieferbar,
            _links: links,
        };
        /* eslint-enable unicorn/consistent-destructuring */

        return computerModel;
    }
}
