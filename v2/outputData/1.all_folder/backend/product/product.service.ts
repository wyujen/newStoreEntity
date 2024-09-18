import { Injectable } from '@nestjs/common';
import { Neo4jService } from '../../neo4j/neo4j.service';

@Injectable()
export class ProductService {
  constructor(private neo4jService: Neo4jService) { }

  async create(dtos: any[]) {
    let cypherQuery: string;

    cypherQuery =
      `
      WITH $dtos AS products
      UNWIND products AS productData
      CREATE (g:Product { id: "product-" + randomUUID(), name: productData.name, phone: productData.phone, fax: productData.fax, taxId: productData.taxId, companyAddress: productData.companyAddress, shippingAddress: productData.shippingAddress, contactPerson:productData.contactPerson , timestamps: timestamp(), updateAt: timestamp(), deleted: false })
      WITH g, productData, 
          CASE WHEN productData.type = 'Main' THEN true ELSE false END AS isMainProduct
      WITH CASE WHEN isMainProduct THEN g ELSE NULL END AS mainProduct,
          CASE WHEN NOT isMainProduct THEN g ELSE NULL END AS otherProduct,
          productData
      WITH mainProduct, otherProduct, productData
      OPTIONAL MATCH (existingMainProduct:Product {name: 'Yaotai'})
      WITH COALESCE(mainProduct, existingMainProduct) AS mainProduct, otherProduct, productData
      WITH mainProduct, otherProduct, productData
      WHERE mainProduct IS NOT NULL AND otherProduct IS NOT NULL AND productData.type <> 'Main'
      WITH mainProduct, otherProduct, productData,
      CASE productData.type
        WHEN 'Manufacturer' THEN 'MANUFACTURER_OF'
        WHEN 'Supplier' THEN 'SUPPLIER_OF'
        WHEN 'Customer' THEN 'CUSTOMER_OF'
        WHEN 'Contractor' THEN 'CONTRACTOR_OF'
        ELSE NULL
      END AS relType
      WHERE relType IS NOT NULL
      CALL apoc.merge.relationship(otherProduct, relType, {id: mainProduct.id + '_' + otherProduct.id}, {
        fromId: mainProduct.id,
        toId: otherProduct.id,
        serial: productData.serial,
        timestamps: timestamp(),
        updateAt: timestamp()
      }, mainProduct) YIELD rel
      WITH relType, rel, otherProduct, productData, mainProduct
      WITH
        collect(DISTINCT relType) AS relTypes,
        collect(DISTINCT rel{.*}) AS relations,
        collect(DISTINCT otherProduct{.*, type: productData.type}) AS otherProducts,
        CASE WHEN mainProduct IS NOT NULL THEN [mainProduct{.*}] ELSE [] END AS mainProductList
        WITH relTypes, relations, otherProducts + mainProductList AS products
        RETURN relTypes, relations, products
`

    const results = await this.neo4jService.write(cypherQuery, { dtos: dtos }).catch((error) => { throw error; });
    const payload = {
      products: results.records[0].get('products'),
      MANUFACTURER_OF: [],
      SUPPLIER_OF: [],
      CUSTOMER_OF: [],
      CONTRACTOR_OF: [],
    }

    // 取得 relTypes 和 relations
    const relTypes = results.records[0].get('relTypes');
    const relations = results.records[0].get('relations');

    // 遍歷 relTypes 和 relations，將關係分類到 payload 中
    relTypes.forEach((relType, index) => {
      const relation = relations[index];
      if (payload.hasOwnProperty(relType)) {
        payload[relType].push(relation);
      } else {
        // 如果 payload 中沒有該鍵，則初始化一個新列表
        payload[relType] = [relation];
      }
    });

    console.log('payload', payload)
    return { status: true, payload: payload };
  }

  async readItself() {
    const results = await this.neo4jService.read(
      'MATCH (g:Product { deleted: false }) ' +
      'WITH g { .* } AS object ' +
      'RETURN collect(object) AS products'
    ).catch((error) => { throw error; });

    return { status: true, payload: results.records[0].get('products') };
  }

  async getList() {
    const results = await this.neo4jService.read(
      `
          MATCH (mainProduct:Product {name: 'Yaotai'})
          MATCH (g:Product)-[rel]->(mainProduct)
          WITH collect(g{.*}) AS productNodes, collect(rel{.*, type: type(rel)}) AS relations, mainProduct
          WITH productNodes + [mainProduct{.*}] AS products, relations
          RETURN products, relations
          `
    ).catch((error) => { throw error; });

    const payload = {
      products: results.records[0].get('products'),
      MANUFACTURER_OF: [],
      SUPPLIER_OF: [],
      CUSTOMER_OF: [],
      CONTRACTOR_OF: [],
    }
    const relations = results.records[0].get('relations');
    console.log('realtionsssss', relations)

    relations.forEach(relation => {
      if (payload.hasOwnProperty(relation.type)) {
        payload[relation.type].push(relation);
      } else {
        // 如果 payload 中沒有該鍵，則初始化一個新列表
        payload[relation.type] = [relation];
      }
    });
    console.log('realtionsssss payload', payload)

    return { status: true, payload: payload };
  }

  async update(dtos: any[]) {
    console.log('update dto', dtos)
    const results = await this.neo4jService.write(
      `
      MATCH (mainProduct:Product {name: 'Yaotai',  deleted: false})
      WITH $dtos AS products, mainProduct
      UNWIND products AS product
      MATCH (g:Product {id: product.id})
      SET g += product
      SET g.updateAt = timestamp()
      WITH mainProduct, g, product
      MATCH (g)-[existingRel]->(mainProduct)
      DELETE existingRel
      WITH mainProduct, g, product,
      CASE product.type
        WHEN 'Manufacturer' THEN 'MANUFACTURER_OF'
        WHEN 'Supplier' THEN 'SUPPLIER_OF'
        WHEN 'Customer' THEN 'CUSTOMER_OF'
        WHEN 'Contractor' THEN 'CONTRACTOR_OF'
        ELSE NULL
      END AS relType
      WHERE relType IS NOT NULL
      CALL apoc.create.relationship(g, relType, {id: mainProduct.id+'_'+g.id , fromId: mainProduct.id, toId: g.id, serial: product.serial, timestamps: timestamp()}, mainProduct) YIELD rel
      WITH relType, rel{.*} AS relation,  g {.*, type: product.type} AS otherProduct, mainProduct
      WITH  collect(DISTINCT relType) AS relTypes, collect(DISTINCT relation) AS relations, collect(DISTINCT otherProduct) AS otherProducts, mainProduct
      RETURN relTypes, relations, otherProducts+[mainProduct{.*}] AS products
       `,
      { dtos: dtos }).catch((error) => { throw error; }
      );

    const payload = {
      products: results.records[0].get('products'),
      MANUFACTURER_OF: [],
      SUPPLIER_OF: [],
      CUSTOMER_OF: [],
      CONTRACTOR_OF: [],
    }


    const relTypes = results.records[0].get('relTypes');
    const relations = results.records[0].get('relations');

    // 遍歷 relTypes 和 relations，將關係分類到 payload 中
    relTypes.forEach((relType, index) => {
      const relation = relations[index];
      if (payload.hasOwnProperty(relType)) {
        payload[relType].push(relation);
      } else {
        // 如果 payload 中沒有該鍵，則初始化一個新列表
        payload[relType] = [relation];
      }
    });

    return { status: true, payload: payload };
  }

  async read() {
    const results = await this.neo4jService.read(
      'MATCH (g:Product { name: "Yaotai", deleted: false }) ' +
      'OPTIONAL MATCH (g1:Processor { deleted: false }) ' +
      'OPTIONAL MATCH (g2:Subcontractor { deleted: false }) ' +
      'OPTIONAL MATCH (g3:Supplier { deleted: false }) ' +
      'OPTIONAL MATCH (g4:Customer { deleted: false }) ' +
      'OPTIONAL MATCH (g5:Other { deleted: false }) ' +
      'OPTIONAL MATCH (g)--(d:Department) ' +
      'OPTIONAL MATCH (g)--(p:Project) ' +
      'OPTIONAL MATCH (g)--(b:BillOfMaterials) ' +
      'OPTIONAL MATCH (g)--(i:Item) ' +
      'WITH g, collect(DISTINCT properties(d)) AS ds, collect(DISTINCT properties(p)) AS ps, collect(DISTINCT properties(b)) AS bs, collect(DISTINCT properties(i)) AS is, collect(DISTINCT properties(g1)) AS g1s, collect(DISTINCT properties(g2)) AS g2s, collect(DISTINCT properties(g3)) AS g3s, collect(DISTINCT properties(g4)) AS g4s, collect(DISTINCT properties(g5)) AS g5s ' +
      'WITH g { .*, labels: labels(g), departments: ds, projects: ps, billOfMaterials: bs, items: is, processors: g1s, subcontractors: g2s, suppliers: g3s, customers: g4s, others: g5s } AS mg ' +
      'MATCH (og:Product { deleted: false }) WHERE og.name IS NOT NULL AND og.name <> "Yaotai" ' +
      'OPTIONAL MATCH (og)--(oi:Item) ' +
      'WITH mg, og, collect(DISTINCT properties(oi)) AS ois ' +
      'WITH mg, collect(og { .*, labels: labels(og), items: ois }) AS objects ' +
      'RETURN [mg] + objects AS products',
    ).catch((error) => { throw error; });

    return { status: true, payload: results.records[0].get('products') };
  }

  async delete(dto: any[]) {
    const results = await this.neo4jService.write(
      'UNWIND $dto AS productId ' +
      `MATCH (g:Product { id: productId }) OPTIONAL MATCH (g)-[r]-() DELETE r, g RETURN *`,
      { dto: dto }).catch((error) => { throw error; }
      );

    return { status: true, payload: results.summary.query.parameters.dto };
  }
}
