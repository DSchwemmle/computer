/**
 * Das Modul besteht aus der Entity-Klasse.
 * @packageDocumentation
 */

import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryColumn,
    UpdateDateColumn,
    VersionColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { DecimalTransformer } from './decimal-transformer.js';

/**
 * Alias-Typ für gültige Strings bei der Art eines Computers.
 */
export type ComputerArt = 'DESKTOP-PC' | 'NOTEBOOK';

@Entity()
export class Computer {
    @Column('char')
    // https://typeorm.io/entities#primary-columns
    // CAVEAT: zuerst @Column() und erst dann @PrimaryColumn()
    @PrimaryColumn('uuid')
    id: string | undefined;

    @VersionColumn()
    readonly version: number | undefined;

    @Column('varchar')
    @ApiProperty({ example: 'Computerhersteller', type: String })
    readonly name!: string; //NOSONAR

    @Column('varchar')
    @ApiProperty({ example: 'NOTEBOOK', type: String })
    readonly art: ComputerArt | undefined;

    @Column('varchar')
    @ApiProperty({ example: 'Intel Core i5-12600KF', type: String })
    readonly prozessor!: string;

    @Column('varchar')
    @ApiProperty({ example: 'Nvidia Geforce RTX4090', type: String })
    readonly grafikkarte!: string;

    @Column('varchar')
    @ApiProperty({ example: '16 GB', type: String })
    readonly arbeitsspeicher!: string;

    @Column('varchar')
    @ApiProperty({ example: '1024 GB', type: String })
    readonly massenspeicher!: string;

    @Column({ type: 'decimal', transformer: new DecimalTransformer() })
    @ApiProperty({ example: 1, type: Number })
    // statt number ggf. Decimal aus decimal.js analog zu BigDecimal von Java
    readonly preis!: number;

    @Column('varchar')
    @ApiProperty({ example: 'Windows 11 Home', type: String })
    readonly betriebssystem!: string;

    @Column('varchar')
    @ApiProperty({ example: 'https://test.de/', type: String })
    readonly homepage: string | undefined;

    @Column('int')
    @ApiProperty({ example: 10_024_742, type: Number })
    readonly artikelnummer!: number;

    @Column('boolean')
    @ApiProperty({ example: true, type: Boolean })
    readonly lieferbar: boolean | undefined;

    // https://typeorm.io/entities#special-columns
    @CreateDateColumn({ type: 'timestamp' })
    readonly erzeugt: Date | undefined = new Date();

    @UpdateDateColumn({ type: 'timestamp' })
    readonly aktualisiert: Date | undefined = new Date();
}
