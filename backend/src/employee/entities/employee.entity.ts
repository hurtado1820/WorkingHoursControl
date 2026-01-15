import { Workday } from "src/workday/entities/workday.entity";
import { Entity, Column, Index, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Employee {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column("varchar", {nullable:false})
    @Index()
    code: string;

    @Column("varchar", {nullable: false, length: 50})
    name: string;

    @OneToMany(() => Workday, workday => workday.employee)
    workdays: Workday[];
}
