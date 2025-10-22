import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('iot_readings')
export class IotReading {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'session_id' })
  sessionId: number;

  @Column({ name: 'fsr_value' })
  fsrValue: number;

  @Column({ name: 'activation_percent', type: 'float' })
  activationPercent: number;

  @CreateDateColumn()
  timestamp: Date;
}
