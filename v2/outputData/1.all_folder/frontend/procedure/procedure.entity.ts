import { Entity } from 'mycena-store';
import { Procedure } from './procedure.model';

export class ProcedureEntity extends Entity {
  _name = 'ProcedureEntity';
  constructor(property: Procedure) {
    super(property);
  }
}
