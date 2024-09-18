import { Entity } from 'mycena-store';
import { Group } from './group.model';

export class GroupEntity extends Entity {
  _name = 'GroupEntity';
  constructor(property: Group) {
    super(property);
  }
}
