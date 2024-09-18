import { Injectable } from '@nestjs/common';
import { Neo4jService } from '../../neo4j/neo4j.service';

@Injectable()
export class ProcedureService {
  constructor(private neo4jService: Neo4jService) { }

  async create(dtos: any[]) {
    let cypherQuery: string;

    cypherQuery =
      `
      WITH $dtos AS procedures
      UNWIND procedures AS procedureData
      CREATE (g:Procedure { id: "procedure-" + randomUUID(), name: procedureData.name, phone: procedureData.phone, fax: procedureData.fax, taxId: procedureData.taxId, companyAddress: procedureData.companyAddress, shippingAddress: procedureData.shippingAddress, contactPerson:procedureData.contactPerson , timestamps: timestamp(), updateAt: timestamp(), deleted: false })
      WITH g, procedureData, 
          CASE WHEN procedureData.type = 'Main' THEN true ELSE false END AS isMainProcedure
      WITH CASE WHEN isMainProcedure THEN g ELSE NULL END AS mainProcedure,
          CASE WHEN NOT isMainProcedure THEN g ELSE NULL END AS otherProcedure,
          procedureData
      WITH mainProcedure, otherProcedure, procedureData
      OPTIONAL MATCH (existingMainProcedure:Procedure {name: 'Yaotai'})
      WITH COALESCE(mainProcedure, existingMainProcedure) AS mainProcedure, otherProcedure, procedureData
      WITH mainProcedure, otherProcedure, procedureData
      WHERE mainProcedure IS NOT NULL AND otherProcedure IS NOT NULL AND procedureData.type <> 'Main'
      WITH mainProcedure, otherProcedure, procedureData,
      CASE procedureData.type
        WHEN 'Manufacturer' THEN 'MANUFACTURER_OF'
        WHEN 'Supplier' THEN 'SUPPLIER_OF'
        WHEN 'Customer' THEN 'CUSTOMER_OF'
        WHEN 'Contractor' THEN 'CONTRACTOR_OF'
        ELSE NULL
      END AS relType
      WHERE relType IS NOT NULL
      CALL apoc.merge.relationship(otherProcedure, relType, {id: mainProcedure.id + '_' + otherProcedure.id}, {
        fromId: mainProcedure.id,
        toId: otherProcedure.id,
        serial: procedureData.serial,
        timestamps: timestamp(),
        updateAt: timestamp()
      }, mainProcedure) YIELD rel
      WITH relType, rel, otherProcedure, procedureData, mainProcedure
      WITH
        collect(DISTINCT relType) AS relTypes,
        collect(DISTINCT rel{.*}) AS relations,
        collect(DISTINCT otherProcedure{.*, type: procedureData.type}) AS otherProcedures,
        CASE WHEN mainProcedure IS NOT NULL THEN [mainProcedure{.*}] ELSE [] END AS mainProcedureList
        WITH relTypes, relations, otherProcedures + mainProcedureList AS procedures
        RETURN relTypes, relations, procedures
`

    const results = await this.neo4jService.write(cypherQuery, { dtos: dtos }).catch((error) => { throw error; });
    const payload = {
      procedures: results.records[0].get('procedures'),
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
      'MATCH (g:Procedure { deleted: false }) ' +
      'WITH g { .* } AS object ' +
      'RETURN collect(object) AS procedures'
    ).catch((error) => { throw error; });

    return { status: true, payload: results.records[0].get('procedures') };
  }

  async getList() {
    const results = await this.neo4jService.read(
      `
          MATCH (mainProcedure:Procedure {name: 'Yaotai'})
          MATCH (g:Procedure)-[rel]->(mainProcedure)
          WITH collect(g{.*}) AS procedureNodes, collect(rel{.*, type: type(rel)}) AS relations, mainProcedure
          WITH procedureNodes + [mainProcedure{.*}] AS procedures, relations
          RETURN procedures, relations
          `
    ).catch((error) => { throw error; });

    const payload = {
      procedures: results.records[0].get('procedures'),
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
      MATCH (mainProcedure:Procedure {name: 'Yaotai',  deleted: false})
      WITH $dtos AS procedures, mainProcedure
      UNWIND procedures AS procedure
      MATCH (g:Procedure {id: procedure.id})
      SET g += procedure
      SET g.updateAt = timestamp()
      WITH mainProcedure, g, procedure
      MATCH (g)-[existingRel]->(mainProcedure)
      DELETE existingRel
      WITH mainProcedure, g, procedure,
      CASE procedure.type
        WHEN 'Manufacturer' THEN 'MANUFACTURER_OF'
        WHEN 'Supplier' THEN 'SUPPLIER_OF'
        WHEN 'Customer' THEN 'CUSTOMER_OF'
        WHEN 'Contractor' THEN 'CONTRACTOR_OF'
        ELSE NULL
      END AS relType
      WHERE relType IS NOT NULL
      CALL apoc.create.relationship(g, relType, {id: mainProcedure.id+'_'+g.id , fromId: mainProcedure.id, toId: g.id, serial: procedure.serial, timestamps: timestamp()}, mainProcedure) YIELD rel
      WITH relType, rel{.*} AS relation,  g {.*, type: procedure.type} AS otherProcedure, mainProcedure
      WITH  collect(DISTINCT relType) AS relTypes, collect(DISTINCT relation) AS relations, collect(DISTINCT otherProcedure) AS otherProcedures, mainProcedure
      RETURN relTypes, relations, otherProcedures+[mainProcedure{.*}] AS procedures
       `,
      { dtos: dtos }).catch((error) => { throw error; }
      );

    const payload = {
      procedures: results.records[0].get('procedures'),
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
      'MATCH (g:Procedure { name: "Yaotai", deleted: false }) ' +
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
      'MATCH (og:Procedure { deleted: false }) WHERE og.name IS NOT NULL AND og.name <> "Yaotai" ' +
      'OPTIONAL MATCH (og)--(oi:Item) ' +
      'WITH mg, og, collect(DISTINCT properties(oi)) AS ois ' +
      'WITH mg, collect(og { .*, labels: labels(og), items: ois }) AS objects ' +
      'RETURN [mg] + objects AS procedures',
    ).catch((error) => { throw error; });

    return { status: true, payload: results.records[0].get('procedures') };
  }

  async delete(dto: any[]) {
    const results = await this.neo4jService.write(
      'UNWIND $dto AS procedureId ' +
      `MATCH (g:Procedure { id: procedureId }) OPTIONAL MATCH (g)-[r]-() DELETE r, g RETURN *`,
      { dto: dto }).catch((error) => { throw error; }
      );

    return { status: true, payload: results.summary.query.parameters.dto };
  }
}
