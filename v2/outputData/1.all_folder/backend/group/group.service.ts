import { Injectable } from '@nestjs/common';
import { Neo4jService } from '../../neo4j/neo4j.service';

@Injectable()
export class GroupService {
  constructor(private neo4jService: Neo4jService) { }

  async create(dtos: any[]) {
    let cypherQuery: string;

    cypherQuery =
      `
      WITH $dtos AS groups
      UNWIND groups AS groupData
      CREATE (g:Group { id: "group-" + randomUUID(), name: groupData.name, phone: groupData.phone, fax: groupData.fax, taxId: groupData.taxId, companyAddress: groupData.companyAddress, shippingAddress: groupData.shippingAddress, contactPerson:groupData.contactPerson , timestamps: timestamp(), updateAt: timestamp(), deleted: false })
      WITH g, groupData, 
          CASE WHEN groupData.type = 'Main' THEN true ELSE false END AS isMainGroup
      WITH CASE WHEN isMainGroup THEN g ELSE NULL END AS mainGroup,
          CASE WHEN NOT isMainGroup THEN g ELSE NULL END AS otherGroup,
          groupData
      WITH mainGroup, otherGroup, groupData
      OPTIONAL MATCH (existingMainGroup:Group {name: 'Yaotai'})
      WITH COALESCE(mainGroup, existingMainGroup) AS mainGroup, otherGroup, groupData
      WITH mainGroup, otherGroup, groupData
      WHERE mainGroup IS NOT NULL AND otherGroup IS NOT NULL AND groupData.type <> 'Main'
      WITH mainGroup, otherGroup, groupData,
      CASE groupData.type
        WHEN 'Manufacturer' THEN 'MANUFACTURER_OF'
        WHEN 'Supplier' THEN 'SUPPLIER_OF'
        WHEN 'Customer' THEN 'CUSTOMER_OF'
        WHEN 'Contractor' THEN 'CONTRACTOR_OF'
        ELSE NULL
      END AS relType
      WHERE relType IS NOT NULL
      CALL apoc.merge.relationship(otherGroup, relType, {id: mainGroup.id + '_' + otherGroup.id}, {
        fromId: mainGroup.id,
        toId: otherGroup.id,
        serial: groupData.serial,
        timestamps: timestamp(),
        updateAt: timestamp()
      }, mainGroup) YIELD rel
      WITH relType, rel, otherGroup, groupData, mainGroup
      WITH
        collect(DISTINCT relType) AS relTypes,
        collect(DISTINCT rel{.*}) AS relations,
        collect(DISTINCT otherGroup{.*, type: groupData.type}) AS otherGroups,
        CASE WHEN mainGroup IS NOT NULL THEN [mainGroup{.*}] ELSE [] END AS mainGroupList
        WITH relTypes, relations, otherGroups + mainGroupList AS groups
        RETURN relTypes, relations, groups
`

    const results = await this.neo4jService.write(cypherQuery, { dtos: dtos }).catch((error) => { throw error; });
    const payload = {
      groups: results.records[0].get('groups'),
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
      'MATCH (g:Group { deleted: false }) ' +
      'WITH g { .* } AS object ' +
      'RETURN collect(object) AS groups'
    ).catch((error) => { throw error; });

    return { status: true, payload: results.records[0].get('groups') };
  }

  async getList() {
    const results = await this.neo4jService.read(
      `
          MATCH (mainGroup:Group {name: 'Yaotai'})
          MATCH (g:Group)-[rel]->(mainGroup)
          WITH collect(g{.*}) AS groupNodes, collect(rel{.*, type: type(rel)}) AS relations, mainGroup
          WITH groupNodes + [mainGroup{.*}] AS groups, relations
          RETURN groups, relations
          `
    ).catch((error) => { throw error; });

    const payload = {
      groups: results.records[0].get('groups'),
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
      MATCH (mainGroup:Group {name: 'Yaotai',  deleted: false})
      WITH $dtos AS groups, mainGroup
      UNWIND groups AS group
      MATCH (g:Group {id: group.id})
      SET g += group
      SET g.updateAt = timestamp()
      WITH mainGroup, g, group
      MATCH (g)-[existingRel]->(mainGroup)
      DELETE existingRel
      WITH mainGroup, g, group,
      CASE group.type
        WHEN 'Manufacturer' THEN 'MANUFACTURER_OF'
        WHEN 'Supplier' THEN 'SUPPLIER_OF'
        WHEN 'Customer' THEN 'CUSTOMER_OF'
        WHEN 'Contractor' THEN 'CONTRACTOR_OF'
        ELSE NULL
      END AS relType
      WHERE relType IS NOT NULL
      CALL apoc.create.relationship(g, relType, {id: mainGroup.id+'_'+g.id , fromId: mainGroup.id, toId: g.id, serial: group.serial, timestamps: timestamp()}, mainGroup) YIELD rel
      WITH relType, rel{.*} AS relation,  g {.*, type: group.type} AS otherGroup, mainGroup
      WITH  collect(DISTINCT relType) AS relTypes, collect(DISTINCT relation) AS relations, collect(DISTINCT otherGroup) AS otherGroups, mainGroup
      RETURN relTypes, relations, otherGroups+[mainGroup{.*}] AS groups
       `,
      { dtos: dtos }).catch((error) => { throw error; }
      );

    const payload = {
      groups: results.records[0].get('groups'),
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
      'MATCH (g:Group { name: "Yaotai", deleted: false }) ' +
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
      'MATCH (og:Group { deleted: false }) WHERE og.name IS NOT NULL AND og.name <> "Yaotai" ' +
      'OPTIONAL MATCH (og)--(oi:Item) ' +
      'WITH mg, og, collect(DISTINCT properties(oi)) AS ois ' +
      'WITH mg, collect(og { .*, labels: labels(og), items: ois }) AS objects ' +
      'RETURN [mg] + objects AS groups',
    ).catch((error) => { throw error; });

    return { status: true, payload: results.records[0].get('groups') };
  }

  async delete(dto: any[]) {
    const results = await this.neo4jService.write(
      'UNWIND $dto AS groupId ' +
      `MATCH (g:Group { id: groupId }) OPTIONAL MATCH (g)-[r]-() DELETE r, g RETURN *`,
      { dto: dto }).catch((error) => { throw error; }
      );

    return { status: true, payload: results.summary.query.parameters.dto };
  }
}
