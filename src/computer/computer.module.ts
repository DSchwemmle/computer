import { AuthModule } from '../security/auth/auth.module.js';
import { Computer } from './entity/computer.entity.js';
import { ComputerGetController } from './rest/computer-get.controller.js';
import { ComputerMutationResolver } from './graphql/computer-mutation.resolver.js';
import { ComputerQueryResolver } from './graphql/computer-query.resolver.js';
import { ComputerReadService } from './service/computer-read.service.js';
import { ComputerValidationService } from './service/computer-validation.service.js';
import { ComputerWriteController } from './rest/computer-write.controller.js';
import { ComputerWriteService } from './service/computer-write.service.js';
import { Module } from '@nestjs/common';
import { QueryBuilder } from './service/query-builder.js';
import { TypeOrmModule } from '@nestjs/typeorm';

/**
 * Das Modul besteht aus Controller- und Service-Klassen für die Verwaltung von
 * ComputerList.
 * @packageDocumentation
 */

/**
 * Die dekorierte Modul-Klasse mit Controller- und Service-Klassen sowie der
 * Funktionalität für TypeORM.
 */
@Module({
    imports: [
        // siehe auch src\app.module.ts
        TypeOrmModule.forFeature([Computer]),
        AuthModule,
    ],
    controllers: [ComputerGetController, ComputerWriteController],
    // Provider sind z.B. Service-Klassen fuer DI
    providers: [
        ComputerReadService,
        ComputerWriteService,
        ComputerValidationService,
        ComputerQueryResolver,
        ComputerMutationResolver,
        QueryBuilder,
    ],
    // Export der Provider fuer DI in anderen Modulen
    exports: [
        ComputerReadService,
        ComputerWriteService,
        ComputerValidationService,
    ],
})
export class ComputerModule {}
