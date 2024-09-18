import { Injectable } from '@nestjs/common';
import { Neo4jService } from '../../neo4j/neo4j.service';

@Injectable()
export class OriginalService {
  constructor(private neo4jService: Neo4jService) { }

  async create(dtos: any[]) {
    let cypherQuery: string;

    cypherQuery =
      `
      WITH $dtos AS originals
      UNWIND originals AS originalData
      CREATE (g:Original { id: "original-" + randomUUID(), name: originalData.name, phone: originalData.phone, fax: originalData.fax, taxId: originalData.taxId, companyAddress: originalData.companyAddress, shippingAddress: originalData.shippingAddress, contactPerson:originalData.contactPerson , timestamps: timestamp(), updateAt: timestamp(), deleted: false })
      WITH g, originalData, 
          CASE WHEN originalData.type = 'Main' THEN true ELSE false END AS isMainOriginal
      WITH CASE WHEN isMainOriginal THEN g ELSE NULL END AS mainOriginal,
          CASE WHEN NOT isMainOriginal THEN g ELSE NULL END AS otherOriginal,
          originalData
      WITH mainOriginal, otherOriginal, originalData
      OPTIONAL MATCH (existingMainOriginal:Original {name: 'Yaotai'})
      WITH COALESCE(mainOriginal, existingMainOriginal) AS mainOriginal, otherOriginal, originalData
      WITH mainOriginal, otherOriginal, originalData
      WHERE mainOriginal IS NOT NULL AND otherOriginal IS NOT NULL AND originalData.type <> 'Main'
      WITH mainOriginal, otherOriginal, originalData,
      CASE originalData.type
        WHEN 'Manufacturer' THEN 'MANUFACTURER_OF'
        WHEN 'Supplier' THEN 'SUPPLIER_OF'
        WHEN 'Customer' THEN 'CUSTOMER_OF'
        WHEN 'Contractor' THEN 'CONTRACTOR_OF'
        ELSE NULL
      END AS relType
      WHERE relType IS NOT NULL
      CALL apoc.merge.relationship(otherOriginal, relType, {id: mainOriginal.id + '_' + otherOriginal.id}, {
        fromId: mainOriginal.id,
        toId: otherOriginal.id,
        serial: originalData.serial,
        timestamps: timestamp(),
        updateAt: timestamp()
      }, mainOriginal) YIELD rel
      WITH relType, rel, otherOriginal, originalData, mainOriginal
      WITH
        collect(DISTINCT relType) AS relTypes,
        collect(DISTINCT rel{.*}) AS relations,
        collect(DISTINCT otherOriginal{.*, type: originalData.type}) AS otherOriginals,
        CASE WHEN mainOriginal IS NOT NULL THEN [mainOriginal{.*}] ELSE [] END AS mainOriginalList
        WITH relTypes, relations, otherOriginals + mainOriginalList AS originals
        RETURN relTypes, relations, originals
`

    const results = await this.neo4jService.write(cypherQuery, { dtos: dtos }).catch((error) => { throw error; });
    const payload = {
      originals: results.records[0].get('originals'),
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
      'MATCH (g:Original { deleted: false }) ' +
      'WITH g { .* } AS object ' +
      'RETURN collect(object) AS originals'
    ).catch((error) => { throw error; });

    return { status: true, payload: results.records[0].get('originals') };
  }

  async getList() {
    const results = await this.neo4jService.read(
      `
          MATCH (mainOriginal:Original {name: 'Yaotai'})
          MATCH (g:Original)-[rel]->(mainOriginal)
          WITH collect(g{.*}) AS originalNodes, collect(rel{.*, type: type(rel)}) AS relations, mainOriginal
          WITH originalNodes + [mainOriginal{.*}] AS originals, relations
          RETURN originals, relations
          `
    ).catch((error) => { throw error; });

    const payload = {
      originals: results.records[0].get('originals'),
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
      MATCH (mainOriginal:Original {name: 'Yaotai',  deleted: false})
      WITH $dtos AS originals, mainOriginal
      UNWIND originals AS original
      MATCH (g:Original {id: original.id})
      SET g += original
      SET g.updateAt = timestamp()
      WITH mainOriginal, g, original
      MATCH (g)-[existingRel]->(mainOriginal)
      DELETE existingRel
      WITH mainOriginal, g, original,
      CASE original.type
        WHEN 'Manufacturer' THEN 'MANUFACTURER_OF'
        WHEN 'Supplier' THEN 'SUPPLIER_OF'
        WHEN 'Customer' THEN 'CUSTOMER_OF'
        WHEN 'Contractor' THEN 'CONTRACTOR_OF'
        ELSE NULL
      END AS relType
      WHERE relType IS NOT NULL
      CALL apoc.create.relationship(g, relType, {id: mainOriginal.id+'_'+g.id , fromId: mainOriginal.id, toId: g.id, serial: original.serial, timestamps: timestamp()}, mainOriginal) YIELD rel
      WITH relType, rel{.*} AS relation,  g {.*, type: original.type} AS otherOriginal, mainOriginal
      WITH  collect(DISTINCT relType) AS relTypes, collect(DISTINCT relation) AS relations, collect(DISTINCT otherOriginal) AS otherOriginals, mainOriginal
      RETURN relTypes, relations, otherOriginals+[mainOriginal{.*}] AS originals
       `,
      { dtos: dtos }).catch((error) => { throw error; }
      );

    const payload = {
      originals: results.records[0].get('originals'),
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
      'MATCH (g:Original { name: "Yaotai", deleted: false }) ' +
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
      'MATCH (og:Original { deleted: false }) WHERE og.name IS NOT NULL AND og.name <> "Yaotai" ' +
      'OPTIONAL MATCH (og)--(oi:Item) ' +
      'WITH mg, og, collect(DISTINCT properties(oi)) AS ois ' +
      'WITH mg, collect(og { .*, labels: labels(og), items: ois }) AS objects ' +
      'RETURN [mg] + objects AS originals',
    ).catch((error) => { throw error; });

    return { status: true, payload: results.records[0].get('originals') };
  }

  async delete(dto: any[]) {
    const results = await this.neo4jService.write(
      'UNWIND $dto AS originalId ' +
      `MATCH (g:Original { id: originalId }) OPTIONAL MATCH (g)-[r]-() DELETE r, g RETURN *`,
      { dto: dto }).catch((error) => { throw error; }
      );

    return { status: true, payload: results.summary.query.parameters.dto };
  }
}
