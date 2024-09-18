import { Injectable } from '@nestjs/common';
import { Neo4jService } from '../../neo4j/neo4j.service';

@Injectable()
export class InventoryService {
  constructor(private neo4jService: Neo4jService) { }

  async create(dtos: any[]) {
    let cypherQuery: string;

    cypherQuery =
      `
      WITH $dtos AS inventorys
      UNWIND inventorys AS inventoryData
      CREATE (g:Inventory { id: "inventory-" + randomUUID(), name: inventoryData.name, phone: inventoryData.phone, fax: inventoryData.fax, taxId: inventoryData.taxId, companyAddress: inventoryData.companyAddress, shippingAddress: inventoryData.shippingAddress, contactPerson:inventoryData.contactPerson , timestamps: timestamp(), updateAt: timestamp(), deleted: false })
      WITH g, inventoryData, 
          CASE WHEN inventoryData.type = 'Main' THEN true ELSE false END AS isMainInventory
      WITH CASE WHEN isMainInventory THEN g ELSE NULL END AS mainInventory,
          CASE WHEN NOT isMainInventory THEN g ELSE NULL END AS otherInventory,
          inventoryData
      WITH mainInventory, otherInventory, inventoryData
      OPTIONAL MATCH (existingMainInventory:Inventory {name: 'Yaotai'})
      WITH COALESCE(mainInventory, existingMainInventory) AS mainInventory, otherInventory, inventoryData
      WITH mainInventory, otherInventory, inventoryData
      WHERE mainInventory IS NOT NULL AND otherInventory IS NOT NULL AND inventoryData.type <> 'Main'
      WITH mainInventory, otherInventory, inventoryData,
      CASE inventoryData.type
        WHEN 'Manufacturer' THEN 'MANUFACTURER_OF'
        WHEN 'Supplier' THEN 'SUPPLIER_OF'
        WHEN 'Customer' THEN 'CUSTOMER_OF'
        WHEN 'Contractor' THEN 'CONTRACTOR_OF'
        ELSE NULL
      END AS relType
      WHERE relType IS NOT NULL
      CALL apoc.merge.relationship(otherInventory, relType, {id: mainInventory.id + '_' + otherInventory.id}, {
        fromId: mainInventory.id,
        toId: otherInventory.id,
        serial: inventoryData.serial,
        timestamps: timestamp(),
        updateAt: timestamp()
      }, mainInventory) YIELD rel
      WITH relType, rel, otherInventory, inventoryData, mainInventory
      WITH
        collect(DISTINCT relType) AS relTypes,
        collect(DISTINCT rel{.*}) AS relations,
        collect(DISTINCT otherInventory{.*, type: inventoryData.type}) AS otherInventorys,
        CASE WHEN mainInventory IS NOT NULL THEN [mainInventory{.*}] ELSE [] END AS mainInventoryList
        WITH relTypes, relations, otherInventorys + mainInventoryList AS inventorys
        RETURN relTypes, relations, inventorys
`

    const results = await this.neo4jService.write(cypherQuery, { dtos: dtos }).catch((error) => { throw error; });
    const payload = {
      inventorys: results.records[0].get('inventorys'),
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
      'MATCH (g:Inventory { deleted: false }) ' +
      'WITH g { .* } AS object ' +
      'RETURN collect(object) AS inventorys'
    ).catch((error) => { throw error; });

    return { status: true, payload: results.records[0].get('inventorys') };
  }

  async getList() {
    const results = await this.neo4jService.read(
      `
          MATCH (mainInventory:Inventory {name: 'Yaotai'})
          MATCH (g:Inventory)-[rel]->(mainInventory)
          WITH collect(g{.*}) AS inventoryNodes, collect(rel{.*, type: type(rel)}) AS relations, mainInventory
          WITH inventoryNodes + [mainInventory{.*}] AS inventorys, relations
          RETURN inventorys, relations
          `
    ).catch((error) => { throw error; });

    const payload = {
      inventorys: results.records[0].get('inventorys'),
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
      MATCH (mainInventory:Inventory {name: 'Yaotai',  deleted: false})
      WITH $dtos AS inventorys, mainInventory
      UNWIND inventorys AS inventory
      MATCH (g:Inventory {id: inventory.id})
      SET g += inventory
      SET g.updateAt = timestamp()
      WITH mainInventory, g, inventory
      MATCH (g)-[existingRel]->(mainInventory)
      DELETE existingRel
      WITH mainInventory, g, inventory,
      CASE inventory.type
        WHEN 'Manufacturer' THEN 'MANUFACTURER_OF'
        WHEN 'Supplier' THEN 'SUPPLIER_OF'
        WHEN 'Customer' THEN 'CUSTOMER_OF'
        WHEN 'Contractor' THEN 'CONTRACTOR_OF'
        ELSE NULL
      END AS relType
      WHERE relType IS NOT NULL
      CALL apoc.create.relationship(g, relType, {id: mainInventory.id+'_'+g.id , fromId: mainInventory.id, toId: g.id, serial: inventory.serial, timestamps: timestamp()}, mainInventory) YIELD rel
      WITH relType, rel{.*} AS relation,  g {.*, type: inventory.type} AS otherInventory, mainInventory
      WITH  collect(DISTINCT relType) AS relTypes, collect(DISTINCT relation) AS relations, collect(DISTINCT otherInventory) AS otherInventorys, mainInventory
      RETURN relTypes, relations, otherInventorys+[mainInventory{.*}] AS inventorys
       `,
      { dtos: dtos }).catch((error) => { throw error; }
      );

    const payload = {
      inventorys: results.records[0].get('inventorys'),
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
      'MATCH (g:Inventory { name: "Yaotai", deleted: false }) ' +
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
      'MATCH (og:Inventory { deleted: false }) WHERE og.name IS NOT NULL AND og.name <> "Yaotai" ' +
      'OPTIONAL MATCH (og)--(oi:Item) ' +
      'WITH mg, og, collect(DISTINCT properties(oi)) AS ois ' +
      'WITH mg, collect(og { .*, labels: labels(og), items: ois }) AS objects ' +
      'RETURN [mg] + objects AS inventorys',
    ).catch((error) => { throw error; });

    return { status: true, payload: results.records[0].get('inventorys') };
  }

  async delete(dto: any[]) {
    const results = await this.neo4jService.write(
      'UNWIND $dto AS inventoryId ' +
      `MATCH (g:Inventory { id: inventoryId }) OPTIONAL MATCH (g)-[r]-() DELETE r, g RETURN *`,
      { dto: dto }).catch((error) => { throw error; }
      );

    return { status: true, payload: results.summary.query.parameters.dto };
  }
}
