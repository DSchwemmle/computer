import { Args, Query, Resolver } from '@nestjs/graphql';
import { type Computer } from '../entity/computer.entity.js';
import { ComputerReadService } from '../service/computer-read.service.js';
import { ResponseTimeInterceptor } from '../../logger/response-time.interceptor.js';
import { UseInterceptors } from '@nestjs/common';
import { UserInputError } from 'apollo-server-express';
import { getLogger } from '../../logger/logger.js';

export type ComputerDTO = Omit<Computer, 'aktualisiert' | 'erzeugt'>;
export interface IdInput {
    id: string;
}

@Resolver()
@UseInterceptors(ResponseTimeInterceptor)
export class ComputerQueryResolver {
    readonly #service: ComputerReadService;

    readonly #logger = getLogger(ComputerQueryResolver.name);

    constructor(service: ComputerReadService) {
        this.#service = service;
    }

    @Query('computer')
    async findById(@Args() id: IdInput) {
        const idStr = id.id;
        this.#logger.debug('findById: id=%s', idStr);

        const computer = await this.#service.findById(idStr);
        if (computer === undefined) {
            // UserInputError liefert Statuscode 200
            // Weitere Error-Klasse in apollo-server-errors:
            // SyntaxError, ValidationError, AuthenticationError, ForbiddenError,
            // PersistedQuery, PersistedQuery
            // https://www.apollographql.com/blog/graphql/error-handling/full-stack-error-handling-with-graphql-apollo
            throw new UserInputError(
                `Es wurde kein Computer mit der ID ${idStr} gefunden.`,
            );
        }
        const computerDTO = this.#toComputerDTO(computer);
        this.#logger.debug('findById: computerDTO=%o', computerDTO);
        return computerDTO;
    }

    @Query('computerList')
    async find(@Args() name: { name: string } | undefined) {
        const nameStr = name?.name;
        this.#logger.debug('find: name=%s', nameStr);
        const suchkriterium = nameStr === undefined ? {} : { name: nameStr };
        const computerList = await this.#service.find(suchkriterium);
        if (computerList.length === 0) {
            // UserInputError liefert Statuscode 200
            throw new UserInputError('Es wurde keine ComputerList gefunden.');
        }

        const computerListDTO = computerList.map((computer: Computer) =>
            this.#toComputerDTO(computer),
        );
        this.#logger.debug('find: computerListDTO=%o', computerListDTO);
        return computerListDTO;
    }

    #toComputerDTO(computer: Computer) {
        const computerDTO: ComputerDTO = {
            id: computer.id,
            version: computer.version,
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
        };
        return computerDTO;
    }
}
