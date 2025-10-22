import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('cv_analysis')
export class CvAnalysis {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'session_id' })
  sessionId: number;

  @Column({ name: 'frame_number' })
  frameNumber: number;

  @Column({ name: 'rep_count', default: 0 })
  repCount: number;

  @Column({ name: 'current_angle', type: 'float' })
  currentAngle: number;

  @Column({ name: 'accuracy_score', type: 'float' })
  accuracyScore: number;

  @Column({ name: 'issues_detected', type: 'text', array: true, default: '{}' })
  issuesDetected: string[];

  @CreateDateColumn()
  timestamp: Date;
}
