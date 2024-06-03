import { ParkingVehicle } from "src/parking_vehicle/entities/parkingVehicle.entity";
import { User } from "src/users/entities/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Parking {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;
    
    @Column()
    capacity: number;

    @Column({name: 'cost_x_hour'})
    costPerHour: number;

    @ManyToOne(() => User)
    @JoinColumn({name: 'user_id'})
    user: User;

    @OneToMany(() => ParkingVehicle, (parkingVehicle) => parkingVehicle.parking, { cascade: ['remove'] })
    parkingVehicles: ParkingVehicle[];
}
