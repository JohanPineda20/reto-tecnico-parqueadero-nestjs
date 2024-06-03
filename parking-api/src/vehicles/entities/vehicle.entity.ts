import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Vehicle{
    @PrimaryGeneratedColumn()
    id:number;
    
    @Column()
    licensePlate: string;
}