/**
 * Das Modul besteht aus der Klasse {@linkcode ComputerValidationService}.
 * @packageDocumentation
 */

import Ajv2020 from 'ajv/dist/2020.js';
import { type Computer } from '../entity/computer.entity.js';
import { Injectable } from '@nestjs/common';
import RE2 from 're2';
import { getLogger } from '../../logger/logger.js';
import { jsonSchema } from './jsonSchema.js';

export const ID_PATTERN = new RE2(
    '^[\\dA-Fa-f]{8}-[\\dA-Fa-f]{4}-[\\dA-Fa-f]{4}-[\\dA-Fa-f]{4}-[\\dA-Fa-f]{12}$',
);
@Injectable()
export class ComputerValidationService {
    #ajv = new Ajv2020({
        allowUnionTypes: true,
        allErrors: true,
    });

    readonly #logger = getLogger(ComputerValidationService.name);

    validateId(id: string) {
        return ID_PATTERN.test(id);
    }

    /**
     * Funktion zur Validierung, wenn mehrere neue Computer angelegt oder mehrere vorhandene Computer
     * aktualisiert bzw. überschrieben werden sollen.
     */
    validate(computer: Computer) {
        this.#logger.debug('validate: computer=%o', computer);
        const validate = this.#ajv.compile<Computer>(jsonSchema);
        validate(computer);

        // nullish coalescing
        const errors = validate.errors ?? [];
        const messages = errors
            .map((error) => error.message)
            .filter((msg) => msg !== undefined);
        this.#logger.debug(
            'validate: errors=%o, messages=%o',
            errors,
            messages,
        );
        return messages.length > 0 ? (messages as string[]) : undefined;
    }
}
