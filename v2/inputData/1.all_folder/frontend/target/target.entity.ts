import { Entity } from 'mycena-store';
import { Target } from './target.model';

export class TargetEntity extends Entity {
  _name = 'TargetEntity';
  constructor(property: Target) {
    super(property);
  }
}
