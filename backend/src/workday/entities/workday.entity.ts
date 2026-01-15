import { Employee } from "src/employee/entities/employee.entity";
import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Workday {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column("varchar", {nullable:false})
    employeeID: string;

    @Column("datetime", {nullable:false})
    entry: Date;

    @Column("datetime", {nullable:true})
    leave: Date;

    @Column("int", {nullable:true})
    timeInSeconds: number;

    @OneToOne(()=> Employee, employee => employee.id)
    employee: Employee;
}
