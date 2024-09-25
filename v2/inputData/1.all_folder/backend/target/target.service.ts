import { Injectable } from '@nestjs/common';
import { Neo4jService } from '../../neo4j/neo4j.service';

@Injectable()
export class TargetService {
  constructor(private neo4jService: Neo4jService) { }

  async create(dtos: any[]) {
    let cypherQuery: string;

    cypherQuery =
      `
      WITH $dtos AS targets
      UNWIND targets AS targetData
      CREATE (g:Target { id: "target-" + randomUUID(), name: targetData.name, phone: targetData.phone, fax: targetData.fax, taxId: targetData.taxId, companyAddress: targetData.companyAddress, shippingAddress: targetData.shippingAddress, contactPerson:targetData.contactPerson , timestamps: timestamp(), updateAt: timestamp(), deleted: false })
      WITH g, targetData, 
          CASE WHEN targetData.type = 'Main' THEN true ELSE false END AS isMainTarget
      WITH CASE WHEN isMainTarget THEN g ELSE NULL END AS mainTarget,
          CASE WHEN NOT isMainTarget THEN g ELSE NULL END AS otherTarget,
          targetData
      WITH mainTarget, otherTarget, targetData
      OPTIONAL MATCH (existingMainTarget:Target {name: 'Yaotai'})
      WITH COALESCE(mainTarget, existingMainTarget) AS mainTarget, otherTarget, targetData
      WITH mainTarget, otherTarget, targetData
      WHERE mainTarget IS NOT NULL AND otherTarget IS NOT NULL AND targetData.type <> 'Main'
      WITH mainTarget, otherTarget, targetData,
      CASE targetData.type
        WHEN 'Manufacturer' THEN 'MANUFACTURER_OF'
        WHEN 'Supplier' THEN 'SUPPLIER_OF'
        WHEN 'Customer' THEN 'CUSTOMER_OF'
        WHEN 'Contractor' THEN 'CONTRACTOR_OF'
        ELSE NULL
      END AS relType
      WHERE relType IS NOT NULL
      CALL apoc.merge.relationship(otherTarget, relType, {id: mainTarget.id + '_' + otherTarget.id}, {
        fromId: mainTarget.id,
        toId: otherTarget.id,
        serial: targetData.serial,
        timestamps: timestamp(),
        updateAt: timestamp()
      }, mainTarget) YIELD rel
      WITH relType, rel, otherTarget, targetData, mainTarget
      WITH
        collect(DISTINCT relType) AS relTypes,
        collect(DISTINCT rel{.*}) AS relations,
        collect(DISTINCT otherTarget{.*, type: targetData.type}) AS otherTargets,
        CASE WHEN mainTarget IS NOT NULL THEN [mainTarget{.*}] ELSE [] END AS mainTargetList
        WITH relTypes, relations, otherTargets + mainTargetList AS targets
        RETURN relTypes, relations, targets
`

    const results = await this.neo4jService.write(cypherQuery, { dtos: dtos }).catch((error) => { throw error; });
    const payload = {
      targets: results.records[0].get('targets'),
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
      'MATCH (g:Target { deleted: false }) ' +
      'WITH g { .* } AS object ' +
      'RETURN collect(object) AS targets'
    ).catch((error) => { throw error; });

    return { status: true, payload: results.records[0].get('targets') };
  }

  async getList() {
    const results = await this.neo4jService.read(
      `
          MATCH (mainTarget:Target {name: 'Yaotai'})
          MATCH (g:Target)-[rel]->(mainTarget)
          WITH collect(g{.*}) AS targetNodes, collect(rel{.*, type: type(rel)}) AS relations, mainTarget
          WITH targetNodes + [mainTarget{.*}] AS targets, relations
          RETURN targets, relations
          `
    ).catch((error) => { throw error; });

    const payload = {
      targets: results.records[0].get('targets'),
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
      MATCH (mainTarget:Target {name: 'Yaotai',  deleted: false})
      WITH $dtos AS targets, mainTarget
      UNWIND targets AS target
      MATCH (g:Target {id: target.id})
      SET g += target
      SET g.updateAt = timestamp()
      WITH mainTarget, g, target
      MATCH (g)-[existingRel]->(mainTarget)
      DELETE existingRel
      WITH mainTarget, g, target,
      CASE target.type
        WHEN 'Manufacturer' THEN 'MANUFACTURER_OF'
        WHEN 'Supplier' THEN 'SUPPLIER_OF'
        WHEN 'Customer' THEN 'CUSTOMER_OF'
        WHEN 'Contractor' THEN 'CONTRACTOR_OF'
        ELSE NULL
      END AS relType
      WHERE relType IS NOT NULL
      CALL apoc.create.relationship(g, relType, {id: mainTarget.id+'_'+g.id , fromId: mainTarget.id, toId: g.id, serial: target.serial, timestamps: timestamp()}, mainTarget) YIELD rel
      WITH relType, rel{.*} AS relation,  g {.*, type: target.type} AS otherTarget, mainTarget
      WITH  collect(DISTINCT relType) AS relTypes, collect(DISTINCT relation) AS relations, collect(DISTINCT otherTarget) AS otherTargets, mainTarget
      RETURN relTypes, relations, otherTargets+[mainTarget{.*}] AS targets
       `,
      { dtos: dtos }).catch((error) => { throw error; }
      );

    const payload = {
      targets: results.records[0].get('targets'),
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
      'MATCH (g:Target { name: "Yaotai", deleted: false }) ' +
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
      'MATCH (og:Target { deleted: false }) WHERE og.name IS NOT NULL AND og.name <> "Yaotai" ' +
      'OPTIONAL MATCH (og)--(oi:Item) ' +
      'WITH mg, og, collect(DISTINCT properties(oi)) AS ois ' +
      'WITH mg, collect(og { .*, labels: labels(og), items: ois }) AS objects ' +
      'RETURN [mg] + objects AS targets',
    ).catch((error) => { throw error; });

    return { status: true, payload: results.records[0].get('targets') };
  }

  async delete(dto: any[]) {
    const results = await this.neo4jService.write(
      'UNWIND $dto AS targetId ' +
      `MATCH (g:Target { id: targetId }) OPTIONAL MATCH (g)-[r]-() DELETE r, g RETURN *`,
      { dto: dto }).catch((error) => { throw error; }
      );

    return { status: true, payload: results.summary.query.parameters.dto };
  }
}
