import { Injectable } from '@nestjs/common';
import { Neo4jService } from '../../neo4j/neo4j.service';

@Injectable()
export class InventoryReceiptService {
  constructor(private neo4jService: Neo4jService) { }

  async create(dtos: any[]) {
    let cypherQuery: string;

    cypherQuery =
      `
      WITH $dtos AS inventoryReceipts
      UNWIND inventoryReceipts AS inventoryReceiptData
      CREATE (g:InventoryReceipt { id: "inventoryReceipt-" + randomUUID(), name: inventoryReceiptData.name, phone: inventoryReceiptData.phone, fax: inventoryReceiptData.fax, taxId: inventoryReceiptData.taxId, companyAddress: inventoryReceiptData.companyAddress, shippingAddress: inventoryReceiptData.shippingAddress, contactPerson:inventoryReceiptData.contactPerson , timestamps: timestamp(), updateAt: timestamp(), deleted: false })
      WITH g, inventoryReceiptData, 
          CASE WHEN inventoryReceiptData.type = 'Main' THEN true ELSE false END AS isMainInventoryReceipt
      WITH CASE WHEN isMainInventoryReceipt THEN g ELSE NULL END AS mainInventoryReceipt,
          CASE WHEN NOT isMainInventoryReceipt THEN g ELSE NULL END AS otherInventoryReceipt,
          inventoryReceiptData
      WITH mainInventoryReceipt, otherInventoryReceipt, inventoryReceiptData
      OPTIONAL MATCH (existingMainInventoryReceipt:InventoryReceipt {name: 'Yaotai'})
      WITH COALESCE(mainInventoryReceipt, existingMainInventoryReceipt) AS mainInventoryReceipt, otherInventoryReceipt, inventoryReceiptData
      WITH mainInventoryReceipt, otherInventoryReceipt, inventoryReceiptData
      WHERE mainInventoryReceipt IS NOT NULL AND otherInventoryReceipt IS NOT NULL AND inventoryReceiptData.type <> 'Main'
      WITH mainInventoryReceipt, otherInventoryReceipt, inventoryReceiptData,
      CASE inventoryReceiptData.type
        WHEN 'Manufacturer' THEN 'MANUFACTURER_OF'
        WHEN 'Supplier' THEN 'SUPPLIER_OF'
        WHEN 'Customer' THEN 'CUSTOMER_OF'
        WHEN 'Contractor' THEN 'CONTRACTOR_OF'
        ELSE NULL
      END AS relType
      WHERE relType IS NOT NULL
      CALL apoc.merge.relationship(otherInventoryReceipt, relType, {id: mainInventoryReceipt.id + '_' + otherInventoryReceipt.id}, {
        fromId: mainInventoryReceipt.id,
        toId: otherInventoryReceipt.id,
        serial: inventoryReceiptData.serial,
        timestamps: timestamp(),
        updateAt: timestamp()
      }, mainInventoryReceipt) YIELD rel
      WITH relType, rel, otherInventoryReceipt, inventoryReceiptData, mainInventoryReceipt
      WITH
        collect(DISTINCT relType) AS relTypes,
        collect(DISTINCT rel{.*}) AS relations,
        collect(DISTINCT otherInventoryReceipt{.*, type: inventoryReceiptData.type}) AS otherInventoryReceipts,
        CASE WHEN mainInventoryReceipt IS NOT NULL THEN [mainInventoryReceipt{.*}] ELSE [] END AS mainInventoryReceiptList
        WITH relTypes, relations, otherInventoryReceipts + mainInventoryReceiptList AS inventoryReceipts
        RETURN relTypes, relations, inventoryReceipts
`

    const results = await this.neo4jService.write(cypherQuery, { dtos: dtos }).catch((error) => { throw error; });
    const payload = {
      inventoryReceipts: results.records[0].get('inventoryReceipts'),
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
      'MATCH (g:InventoryReceipt { deleted: false }) ' +
      'WITH g { .* } AS object ' +
      'RETURN collect(object) AS inventoryReceipts'
    ).catch((error) => { throw error; });

    return { status: true, payload: results.records[0].get('inventoryReceipts') };
  }

  async getList() {
    const results = await this.neo4jService.read(
      `
          MATCH (mainInventoryReceipt:InventoryReceipt {name: 'Yaotai'})
          MATCH (g:InventoryReceipt)-[rel]->(mainInventoryReceipt)
          WITH collect(g{.*}) AS inventoryReceiptNodes, collect(rel{.*, type: type(rel)}) AS relations, mainInventoryReceipt
          WITH inventoryReceiptNodes + [mainInventoryReceipt{.*}] AS inventoryReceipts, relations
          RETURN inventoryReceipts, relations
          `
    ).catch((error) => { throw error; });

    const payload = {
      inventoryReceipts: results.records[0].get('inventoryReceipts'),
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
      MATCH (mainInventoryReceipt:InventoryReceipt {name: 'Yaotai',  deleted: false})
      WITH $dtos AS inventoryReceipts, mainInventoryReceipt
      UNWIND inventoryReceipts AS inventoryReceipt
      MATCH (g:InventoryReceipt {id: inventoryReceipt.id})
      SET g += inventoryReceipt
      SET g.updateAt = timestamp()
      WITH mainInventoryReceipt, g, inventoryReceipt
      MATCH (g)-[existingRel]->(mainInventoryReceipt)
      DELETE existingRel
      WITH mainInventoryReceipt, g, inventoryReceipt,
      CASE inventoryReceipt.type
        WHEN 'Manufacturer' THEN 'MANUFACTURER_OF'
        WHEN 'Supplier' THEN 'SUPPLIER_OF'
        WHEN 'Customer' THEN 'CUSTOMER_OF'
        WHEN 'Contractor' THEN 'CONTRACTOR_OF'
        ELSE NULL
      END AS relType
      WHERE relType IS NOT NULL
      CALL apoc.create.relationship(g, relType, {id: mainInventoryReceipt.id+'_'+g.id , fromId: mainInventoryReceipt.id, toId: g.id, serial: inventoryReceipt.serial, timestamps: timestamp()}, mainInventoryReceipt) YIELD rel
      WITH relType, rel{.*} AS relation,  g {.*, type: inventoryReceipt.type} AS otherInventoryReceipt, mainInventoryReceipt
      WITH  collect(DISTINCT relType) AS relTypes, collect(DISTINCT relation) AS relations, collect(DISTINCT otherInventoryReceipt) AS otherInventoryReceipts, mainInventoryReceipt
      RETURN relTypes, relations, otherInventoryReceipts+[mainInventoryReceipt{.*}] AS inventoryReceipts
       `,
      { dtos: dtos }).catch((error) => { throw error; }
      );

    const payload = {
      inventoryReceipts: results.records[0].get('inventoryReceipts'),
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
      'MATCH (g:InventoryReceipt { name: "Yaotai", deleted: false }) ' +
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
      'MATCH (og:InventoryReceipt { deleted: false }) WHERE og.name IS NOT NULL AND og.name <> "Yaotai" ' +
      'OPTIONAL MATCH (og)--(oi:Item) ' +
      'WITH mg, og, collect(DISTINCT properties(oi)) AS ois ' +
      'WITH mg, collect(og { .*, labels: labels(og), items: ois }) AS objects ' +
      'RETURN [mg] + objects AS inventoryReceipts',
    ).catch((error) => { throw error; });

    return { status: true, payload: results.records[0].get('inventoryReceipts') };
  }

  async delete(dto: any[]) {
    const results = await this.neo4jService.write(
      'UNWIND $dto AS inventoryReceiptId ' +
      `MATCH (g:InventoryReceipt { id: inventoryReceiptId }) OPTIONAL MATCH (g)-[r]-() DELETE r, g RETURN *`,
      { dto: dto }).catch((error) => { throw error; }
      );

    return { status: true, payload: results.summary.query.parameters.dto };
  }
}
