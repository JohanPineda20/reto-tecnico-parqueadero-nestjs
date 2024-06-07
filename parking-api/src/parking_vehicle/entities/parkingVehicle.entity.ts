import { Parking } from "src/parkings/entities/parking.entity";
import { Vehicle } from "src/vehicles/entities/vehicle.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class ParkingVehicle {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({name:'entry_date'})
    entryDate: Date

    @Column({name:'departure_date', nullable: true})
    departureDate: Date
    
    @Column({type: 'decimal', precision: 10, scale: 2, nullable: true})
    payment: number

    @ManyToOne(() => Parking, (parking) => parking.parkingVehicles, {onDelete: 'CASCADE'})
    @JoinColumn({name: 'parking_id'})
    parking: Parking

    @ManyToOne(() => Vehicle)
    @JoinColumn({name: 'vehicle_id'})
    vehicle: Vehicle
}
