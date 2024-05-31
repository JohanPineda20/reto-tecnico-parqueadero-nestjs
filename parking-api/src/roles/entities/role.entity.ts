import { RoleEnum } from "src/common/enums/role.enum"
import { Column, Entity, PrimaryGeneratedColumn  } from "typeorm"

@Entity()
export class Role {
    @PrimaryGeneratedColumn()
    id: number
    @Column({nullable: false})
    name: string
    @Column()
    description: string
}
