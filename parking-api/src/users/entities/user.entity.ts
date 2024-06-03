import { Role } from "src/roles/entities/role.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;
    @Column({nullable: false})
    name: string;
    @Column({nullable: true})
    lastname: string;
    @Column({length: 10, unique: true})
    dni: string;
    @Column({length: 10})
    phone: string;
    @Column({unique: true})
    email: string;
    @Column({nullable: false})
    password: string;
    @Column({nullable: true})
    token: string

    @ManyToOne(() => Role)
    @JoinColumn({name: "role_id"})
    role: Role;
}
