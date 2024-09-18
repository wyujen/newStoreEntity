import { Entity } from 'mycena-store';
import { Product } from './product.model';

export class ProductEntity extends Entity {
  _name = 'ProductEntity';
  constructor(property: Product) {
    super(property);
  }
}
