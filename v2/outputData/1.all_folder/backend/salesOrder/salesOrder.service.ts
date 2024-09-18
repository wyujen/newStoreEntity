import { Injectable } from '@nestjs/common';
import { Neo4jService } from '../../neo4j/neo4j.service';

@Injectable()
export class SalesOrderService {
  constructor(private neo4jService: Neo4jService) { }

  async create(dtos: any[]) {
    let cypherQuery: string;

    cypherQuery =
      `
      WITH $dtos AS salesOrders
      UNWIND salesOrders AS salesOrderData
      CREATE (g:SalesOrder { id: "salesOrder-" + randomUUID(), name: salesOrderData.name, phone: salesOrderData.phone, fax: salesOrderData.fax, taxId: salesOrderData.taxId, companyAddress: salesOrderData.companyAddress, shippingAddress: salesOrderData.shippingAddress, contactPerson:salesOrderData.contactPerson , timestamps: timestamp(), updateAt: timestamp(), deleted: false })
      WITH g, salesOrderData, 
          CASE WHEN salesOrderData.type = 'Main' THEN true ELSE false END AS isMainSalesOrder
      WITH CASE WHEN isMainSalesOrder THEN g ELSE NULL END AS mainSalesOrder,
          CASE WHEN NOT isMainSalesOrder THEN g ELSE NULL END AS otherSalesOrder,
          salesOrderData
      WITH mainSalesOrder, otherSalesOrder, salesOrderData
      OPTIONAL MATCH (existingMainSalesOrder:SalesOrder {name: 'Yaotai'})
      WITH COALESCE(mainSalesOrder, existingMainSalesOrder) AS mainSalesOrder, otherSalesOrder, salesOrderData
      WITH mainSalesOrder, otherSalesOrder, salesOrderData
      WHERE mainSalesOrder IS NOT NULL AND otherSalesOrder IS NOT NULL AND salesOrderData.type <> 'Main'
      WITH mainSalesOrder, otherSalesOrder, salesOrderData,
      CASE salesOrderData.type
        WHEN 'Manufacturer' THEN 'MANUFACTURER_OF'
        WHEN 'Supplier' THEN 'SUPPLIER_OF'
        WHEN 'Customer' THEN 'CUSTOMER_OF'
        WHEN 'Contractor' THEN 'CONTRACTOR_OF'
        ELSE NULL
      END AS relType
      WHERE relType IS NOT NULL
      CALL apoc.merge.relationship(otherSalesOrder, relType, {id: mainSalesOrder.id + '_' + otherSalesOrder.id}, {
        fromId: mainSalesOrder.id,
        toId: otherSalesOrder.id,
        serial: salesOrderData.serial,
        timestamps: timestamp(),
        updateAt: timestamp()
      }, mainSalesOrder) YIELD rel
      WITH relType, rel, otherSalesOrder, salesOrderData, mainSalesOrder
      WITH
        collect(DISTINCT relType) AS relTypes,
        collect(DISTINCT rel{.*}) AS relations,
        collect(DISTINCT otherSalesOrder{.*, type: salesOrderData.type}) AS otherSalesOrders,
        CASE WHEN mainSalesOrder IS NOT NULL THEN [mainSalesOrder{.*}] ELSE [] END AS mainSalesOrderList
        WITH relTypes, relations, otherSalesOrders + mainSalesOrderList AS salesOrders
        RETURN relTypes, relations, salesOrders
`

    const results = await this.neo4jService.write(cypherQuery, { dtos: dtos }).catch((error) => { throw error; });
    const payload = {
      salesOrders: results.records[0].get('salesOrders'),
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
      'MATCH (g:SalesOrder { deleted: false }) ' +
      'WITH g { .* } AS object ' +
      'RETURN collect(object) AS salesOrders'
    ).catch((error) => { throw error; });

    return { status: true, payload: results.records[0].get('salesOrders') };
  }

  async getList() {
    const results = await this.neo4jService.read(
      `
          MATCH (mainSalesOrder:SalesOrder {name: 'Yaotai'})
          MATCH (g:SalesOrder)-[rel]->(mainSalesOrder)
          WITH collect(g{.*}) AS salesOrderNodes, collect(rel{.*, type: type(rel)}) AS relations, mainSalesOrder
          WITH salesOrderNodes + [mainSalesOrder{.*}] AS salesOrders, relations
          RETURN salesOrders, relations
          `
    ).catch((error) => { throw error; });

    const payload = {
      salesOrders: results.records[0].get('salesOrders'),
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
      MATCH (mainSalesOrder:SalesOrder {name: 'Yaotai',  deleted: false})
      WITH $dtos AS salesOrders, mainSalesOrder
      UNWIND salesOrders AS salesOrder
      MATCH (g:SalesOrder {id: salesOrder.id})
      SET g += salesOrder
      SET g.updateAt = timestamp()
      WITH mainSalesOrder, g, salesOrder
      MATCH (g)-[existingRel]->(mainSalesOrder)
      DELETE existingRel
      WITH mainSalesOrder, g, salesOrder,
      CASE salesOrder.type
        WHEN 'Manufacturer' THEN 'MANUFACTURER_OF'
        WHEN 'Supplier' THEN 'SUPPLIER_OF'
        WHEN 'Customer' THEN 'CUSTOMER_OF'
        WHEN 'Contractor' THEN 'CONTRACTOR_OF'
        ELSE NULL
      END AS relType
      WHERE relType IS NOT NULL
      CALL apoc.create.relationship(g, relType, {id: mainSalesOrder.id+'_'+g.id , fromId: mainSalesOrder.id, toId: g.id, serial: salesOrder.serial, timestamps: timestamp()}, mainSalesOrder) YIELD rel
      WITH relType, rel{.*} AS relation,  g {.*, type: salesOrder.type} AS otherSalesOrder, mainSalesOrder
      WITH  collect(DISTINCT relType) AS relTypes, collect(DISTINCT relation) AS relations, collect(DISTINCT otherSalesOrder) AS otherSalesOrders, mainSalesOrder
      RETURN relTypes, relations, otherSalesOrders+[mainSalesOrder{.*}] AS salesOrders
       `,
      { dtos: dtos }).catch((error) => { throw error; }
      );

    const payload = {
      salesOrders: results.records[0].get('salesOrders'),
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
      'MATCH (g:SalesOrder { name: "Yaotai", deleted: false }) ' +
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
      'MATCH (og:SalesOrder { deleted: false }) WHERE og.name IS NOT NULL AND og.name <> "Yaotai" ' +
      'OPTIONAL MATCH (og)--(oi:Item) ' +
      'WITH mg, og, collect(DISTINCT properties(oi)) AS ois ' +
      'WITH mg, collect(og { .*, labels: labels(og), items: ois }) AS objects ' +
      'RETURN [mg] + objects AS salesOrders',
    ).catch((error) => { throw error; });

    return { status: true, payload: results.records[0].get('salesOrders') };
  }

  async delete(dto: any[]) {
    const results = await this.neo4jService.write(
      'UNWIND $dto AS salesOrderId ' +
      `MATCH (g:SalesOrder { id: salesOrderId }) OPTIONAL MATCH (g)-[r]-() DELETE r, g RETURN *`,
      { dto: dto }).catch((error) => { throw error; }
      );

    return { status: true, payload: results.summary.query.parameters.dto };
  }
}
