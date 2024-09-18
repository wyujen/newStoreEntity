import { Injectable } from '@nestjs/common';
import { Neo4jService } from '../../neo4j/neo4j.service';

@Injectable()
export class BillOfMaterialsService {
  constructor(private neo4jService: Neo4jService) { }

  async create(dtos: any[]) {
    let cypherQuery: string;

    cypherQuery =
      `
      WITH $dtos AS billOfMaterialss
      UNWIND billOfMaterialss AS billOfMaterialsData
      CREATE (g:BillOfMaterials { id: "billOfMaterials-" + randomUUID(), name: billOfMaterialsData.name, phone: billOfMaterialsData.phone, fax: billOfMaterialsData.fax, taxId: billOfMaterialsData.taxId, companyAddress: billOfMaterialsData.companyAddress, shippingAddress: billOfMaterialsData.shippingAddress, contactPerson:billOfMaterialsData.contactPerson , timestamps: timestamp(), updateAt: timestamp(), deleted: false })
      WITH g, billOfMaterialsData, 
          CASE WHEN billOfMaterialsData.type = 'Main' THEN true ELSE false END AS isMainBillOfMaterials
      WITH CASE WHEN isMainBillOfMaterials THEN g ELSE NULL END AS mainBillOfMaterials,
          CASE WHEN NOT isMainBillOfMaterials THEN g ELSE NULL END AS otherBillOfMaterials,
          billOfMaterialsData
      WITH mainBillOfMaterials, otherBillOfMaterials, billOfMaterialsData
      OPTIONAL MATCH (existingMainBillOfMaterials:BillOfMaterials {name: 'Yaotai'})
      WITH COALESCE(mainBillOfMaterials, existingMainBillOfMaterials) AS mainBillOfMaterials, otherBillOfMaterials, billOfMaterialsData
      WITH mainBillOfMaterials, otherBillOfMaterials, billOfMaterialsData
      WHERE mainBillOfMaterials IS NOT NULL AND otherBillOfMaterials IS NOT NULL AND billOfMaterialsData.type <> 'Main'
      WITH mainBillOfMaterials, otherBillOfMaterials, billOfMaterialsData,
      CASE billOfMaterialsData.type
        WHEN 'Manufacturer' THEN 'MANUFACTURER_OF'
        WHEN 'Supplier' THEN 'SUPPLIER_OF'
        WHEN 'Customer' THEN 'CUSTOMER_OF'
        WHEN 'Contractor' THEN 'CONTRACTOR_OF'
        ELSE NULL
      END AS relType
      WHERE relType IS NOT NULL
      CALL apoc.merge.relationship(otherBillOfMaterials, relType, {id: mainBillOfMaterials.id + '_' + otherBillOfMaterials.id}, {
        fromId: mainBillOfMaterials.id,
        toId: otherBillOfMaterials.id,
        serial: billOfMaterialsData.serial,
        timestamps: timestamp(),
        updateAt: timestamp()
      }, mainBillOfMaterials) YIELD rel
      WITH relType, rel, otherBillOfMaterials, billOfMaterialsData, mainBillOfMaterials
      WITH
        collect(DISTINCT relType) AS relTypes,
        collect(DISTINCT rel{.*}) AS relations,
        collect(DISTINCT otherBillOfMaterials{.*, type: billOfMaterialsData.type}) AS otherBillOfMaterialss,
        CASE WHEN mainBillOfMaterials IS NOT NULL THEN [mainBillOfMaterials{.*}] ELSE [] END AS mainBillOfMaterialsList
        WITH relTypes, relations, otherBillOfMaterialss + mainBillOfMaterialsList AS billOfMaterialss
        RETURN relTypes, relations, billOfMaterialss
`

    const results = await this.neo4jService.write(cypherQuery, { dtos: dtos }).catch((error) => { throw error; });
    const payload = {
      billOfMaterialss: results.records[0].get('billOfMaterialss'),
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
      'MATCH (g:BillOfMaterials { deleted: false }) ' +
      'WITH g { .* } AS object ' +
      'RETURN collect(object) AS billOfMaterialss'
    ).catch((error) => { throw error; });

    return { status: true, payload: results.records[0].get('billOfMaterialss') };
  }

  async getList() {
    const results = await this.neo4jService.read(
      `
          MATCH (mainBillOfMaterials:BillOfMaterials {name: 'Yaotai'})
          MATCH (g:BillOfMaterials)-[rel]->(mainBillOfMaterials)
          WITH collect(g{.*}) AS billOfMaterialsNodes, collect(rel{.*, type: type(rel)}) AS relations, mainBillOfMaterials
          WITH billOfMaterialsNodes + [mainBillOfMaterials{.*}] AS billOfMaterialss, relations
          RETURN billOfMaterialss, relations
          `
    ).catch((error) => { throw error; });

    const payload = {
      billOfMaterialss: results.records[0].get('billOfMaterialss'),
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
      MATCH (mainBillOfMaterials:BillOfMaterials {name: 'Yaotai',  deleted: false})
      WITH $dtos AS billOfMaterialss, mainBillOfMaterials
      UNWIND billOfMaterialss AS billOfMaterials
      MATCH (g:BillOfMaterials {id: billOfMaterials.id})
      SET g += billOfMaterials
      SET g.updateAt = timestamp()
      WITH mainBillOfMaterials, g, billOfMaterials
      MATCH (g)-[existingRel]->(mainBillOfMaterials)
      DELETE existingRel
      WITH mainBillOfMaterials, g, billOfMaterials,
      CASE billOfMaterials.type
        WHEN 'Manufacturer' THEN 'MANUFACTURER_OF'
        WHEN 'Supplier' THEN 'SUPPLIER_OF'
        WHEN 'Customer' THEN 'CUSTOMER_OF'
        WHEN 'Contractor' THEN 'CONTRACTOR_OF'
        ELSE NULL
      END AS relType
      WHERE relType IS NOT NULL
      CALL apoc.create.relationship(g, relType, {id: mainBillOfMaterials.id+'_'+g.id , fromId: mainBillOfMaterials.id, toId: g.id, serial: billOfMaterials.serial, timestamps: timestamp()}, mainBillOfMaterials) YIELD rel
      WITH relType, rel{.*} AS relation,  g {.*, type: billOfMaterials.type} AS otherBillOfMaterials, mainBillOfMaterials
      WITH  collect(DISTINCT relType) AS relTypes, collect(DISTINCT relation) AS relations, collect(DISTINCT otherBillOfMaterials) AS otherBillOfMaterialss, mainBillOfMaterials
      RETURN relTypes, relations, otherBillOfMaterialss+[mainBillOfMaterials{.*}] AS billOfMaterialss
       `,
      { dtos: dtos }).catch((error) => { throw error; }
      );

    const payload = {
      billOfMaterialss: results.records[0].get('billOfMaterialss'),
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
      'MATCH (g:BillOfMaterials { name: "Yaotai", deleted: false }) ' +
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
      'MATCH (og:BillOfMaterials { deleted: false }) WHERE og.name IS NOT NULL AND og.name <> "Yaotai" ' +
      'OPTIONAL MATCH (og)--(oi:Item) ' +
      'WITH mg, og, collect(DISTINCT properties(oi)) AS ois ' +
      'WITH mg, collect(og { .*, labels: labels(og), items: ois }) AS objects ' +
      'RETURN [mg] + objects AS billOfMaterialss',
    ).catch((error) => { throw error; });

    return { status: true, payload: results.records[0].get('billOfMaterialss') };
  }

  async delete(dto: any[]) {
    const results = await this.neo4jService.write(
      'UNWIND $dto AS billOfMaterialsId ' +
      `MATCH (g:BillOfMaterials { id: billOfMaterialsId }) OPTIONAL MATCH (g)-[r]-() DELETE r, g RETURN *`,
      { dto: dto }).catch((error) => { throw error; }
      );

    return { status: true, payload: results.summary.query.parameters.dto };
  }
}
