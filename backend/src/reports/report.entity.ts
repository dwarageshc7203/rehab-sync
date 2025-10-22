import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('reports')
export class Report {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'session_id', unique: true })
  sessionId: number;

  @Column({ name: 'total_reps' })
  totalReps: number;

  @Column({ name: 'avg_accuracy', type: 'float' })
  avgAccuracy: number;

  @Column({ name: 'avg_muscle_activation', type: 'float' })
  avgMuscleActivation: number;

  @Column({ name: 'peak_muscle_activation', type: 'float' })
  peakMuscleActivation: number;

  @Column({ name: 'issues_detected', type: 'text', array: true, default: '{}' })
  issuesDetected: string[];

  @Column({ name: 'recommendations', type: 'text', array: true, default: '{}' })
  recommendations: string[];

  @CreateDateColumn({ name: 'generated_at' })
  generatedAt: Date;
}
