import { Injectable } from '@nestjs/common';
import { Neo4jService } from '../../neo4j/neo4j.service';

@Injectable()
export class PurchuserOrderService {
  constructor(private neo4jService: Neo4jService) { }

  async create(dtos: any[]) {
    let cypherQuery: string;

    cypherQuery =
      `
      WITH $dtos AS purchuserOrders
      UNWIND purchuserOrders AS purchuserOrderData
      CREATE (g:PurchuserOrder { id: "purchuserOrder-" + randomUUID(), name: purchuserOrderData.name, phone: purchuserOrderData.phone, fax: purchuserOrderData.fax, taxId: purchuserOrderData.taxId, companyAddress: purchuserOrderData.companyAddress, shippingAddress: purchuserOrderData.shippingAddress, contactPerson:purchuserOrderData.contactPerson , timestamps: timestamp(), updateAt: timestamp(), deleted: false })
      WITH g, purchuserOrderData, 
          CASE WHEN purchuserOrderData.type = 'Main' THEN true ELSE false END AS isMainPurchuserOrder
      WITH CASE WHEN isMainPurchuserOrder THEN g ELSE NULL END AS mainPurchuserOrder,
          CASE WHEN NOT isMainPurchuserOrder THEN g ELSE NULL END AS otherPurchuserOrder,
          purchuserOrderData
      WITH mainPurchuserOrder, otherPurchuserOrder, purchuserOrderData
      OPTIONAL MATCH (existingMainPurchuserOrder:PurchuserOrder {name: 'Yaotai'})
      WITH COALESCE(mainPurchuserOrder, existingMainPurchuserOrder) AS mainPurchuserOrder, otherPurchuserOrder, purchuserOrderData
      WITH mainPurchuserOrder, otherPurchuserOrder, purchuserOrderData
      WHERE mainPurchuserOrder IS NOT NULL AND otherPurchuserOrder IS NOT NULL AND purchuserOrderData.type <> 'Main'
      WITH mainPurchuserOrder, otherPurchuserOrder, purchuserOrderData,
      CASE purchuserOrderData.type
        WHEN 'Manufacturer' THEN 'MANUFACTURER_OF'
        WHEN 'Supplier' THEN 'SUPPLIER_OF'
        WHEN 'Customer' THEN 'CUSTOMER_OF'
        WHEN 'Contractor' THEN 'CONTRACTOR_OF'
        ELSE NULL
      END AS relType
      WHERE relType IS NOT NULL
      CALL apoc.merge.relationship(otherPurchuserOrder, relType, {id: mainPurchuserOrder.id + '_' + otherPurchuserOrder.id}, {
        fromId: mainPurchuserOrder.id,
        toId: otherPurchuserOrder.id,
        serial: purchuserOrderData.serial,
        timestamps: timestamp(),
        updateAt: timestamp()
      }, mainPurchuserOrder) YIELD rel
      WITH relType, rel, otherPurchuserOrder, purchuserOrderData, mainPurchuserOrder
      WITH
        collect(DISTINCT relType) AS relTypes,
        collect(DISTINCT rel{.*}) AS relations,
        collect(DISTINCT otherPurchuserOrder{.*, type: purchuserOrderData.type}) AS otherPurchuserOrders,
        CASE WHEN mainPurchuserOrder IS NOT NULL THEN [mainPurchuserOrder{.*}] ELSE [] END AS mainPurchuserOrderList
        WITH relTypes, relations, otherPurchuserOrders + mainPurchuserOrderList AS purchuserOrders
        RETURN relTypes, relations, purchuserOrders
`

    const results = await this.neo4jService.write(cypherQuery, { dtos: dtos }).catch((error) => { throw error; });
    const payload = {
      purchuserOrders: results.records[0].get('purchuserOrders'),
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
      'MATCH (g:PurchuserOrder { deleted: false }) ' +
      'WITH g { .* } AS object ' +
      'RETURN collect(object) AS purchuserOrders'
    ).catch((error) => { throw error; });

    return { status: true, payload: results.records[0].get('purchuserOrders') };
  }

  async getList() {
    const results = await this.neo4jService.read(
      `
          MATCH (mainPurchuserOrder:PurchuserOrder {name: 'Yaotai'})
          MATCH (g:PurchuserOrder)-[rel]->(mainPurchuserOrder)
          WITH collect(g{.*}) AS purchuserOrderNodes, collect(rel{.*, type: type(rel)}) AS relations, mainPurchuserOrder
          WITH purchuserOrderNodes + [mainPurchuserOrder{.*}] AS purchuserOrders, relations
          RETURN purchuserOrders, relations
          `
    ).catch((error) => { throw error; });

    const payload = {
      purchuserOrders: results.records[0].get('purchuserOrders'),
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
      MATCH (mainPurchuserOrder:PurchuserOrder {name: 'Yaotai',  deleted: false})
      WITH $dtos AS purchuserOrders, mainPurchuserOrder
      UNWIND purchuserOrders AS purchuserOrder
      MATCH (g:PurchuserOrder {id: purchuserOrder.id})
      SET g += purchuserOrder
      SET g.updateAt = timestamp()
      WITH mainPurchuserOrder, g, purchuserOrder
      MATCH (g)-[existingRel]->(mainPurchuserOrder)
      DELETE existingRel
      WITH mainPurchuserOrder, g, purchuserOrder,
      CASE purchuserOrder.type
        WHEN 'Manufacturer' THEN 'MANUFACTURER_OF'
        WHEN 'Supplier' THEN 'SUPPLIER_OF'
        WHEN 'Customer' THEN 'CUSTOMER_OF'
        WHEN 'Contractor' THEN 'CONTRACTOR_OF'
        ELSE NULL
      END AS relType
      WHERE relType IS NOT NULL
      CALL apoc.create.relationship(g, relType, {id: mainPurchuserOrder.id+'_'+g.id , fromId: mainPurchuserOrder.id, toId: g.id, serial: purchuserOrder.serial, timestamps: timestamp()}, mainPurchuserOrder) YIELD rel
      WITH relType, rel{.*} AS relation,  g {.*, type: purchuserOrder.type} AS otherPurchuserOrder, mainPurchuserOrder
      WITH  collect(DISTINCT relType) AS relTypes, collect(DISTINCT relation) AS relations, collect(DISTINCT otherPurchuserOrder) AS otherPurchuserOrders, mainPurchuserOrder
      RETURN relTypes, relations, otherPurchuserOrders+[mainPurchuserOrder{.*}] AS purchuserOrders
       `,
      { dtos: dtos }).catch((error) => { throw error; }
      );

    const payload = {
      purchuserOrders: results.records[0].get('purchuserOrders'),
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
      'MATCH (g:PurchuserOrder { name: "Yaotai", deleted: false }) ' +
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
      'MATCH (og:PurchuserOrder { deleted: false }) WHERE og.name IS NOT NULL AND og.name <> "Yaotai" ' +
      'OPTIONAL MATCH (og)--(oi:Item) ' +
      'WITH mg, og, collect(DISTINCT properties(oi)) AS ois ' +
      'WITH mg, collect(og { .*, labels: labels(og), items: ois }) AS objects ' +
      'RETURN [mg] + objects AS purchuserOrders',
    ).catch((error) => { throw error; });

    return { status: true, payload: results.records[0].get('purchuserOrders') };
  }

  async delete(dto: any[]) {
    const results = await this.neo4jService.write(
      'UNWIND $dto AS purchuserOrderId ' +
      `MATCH (g:PurchuserOrder { id: purchuserOrderId }) OPTIONAL MATCH (g)-[r]-() DELETE r, g RETURN *`,
      { dto: dto }).catch((error) => { throw error; }
      );

    return { status: true, payload: results.summary.query.parameters.dto };
  }
}
