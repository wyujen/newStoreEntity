import { Injectable } from '@nestjs/common';
import { Neo4jService } from '../../neo4j/neo4j.service';

@Injectable()
export class MaterialService {
  constructor(private neo4jService: Neo4jService) { }

  async create(dtos: any[]) {
    let cypherQuery: string;

    cypherQuery =
      `
      WITH $dtos AS materials
      UNWIND materials AS materialData
      CREATE (g:Material { id: "material-" + randomUUID(), name: materialData.name, phone: materialData.phone, fax: materialData.fax, taxId: materialData.taxId, companyAddress: materialData.companyAddress, shippingAddress: materialData.shippingAddress, contactPerson:materialData.contactPerson , timestamps: timestamp(), updateAt: timestamp(), deleted: false })
      WITH g, materialData, 
          CASE WHEN materialData.type = 'Main' THEN true ELSE false END AS isMainMaterial
      WITH CASE WHEN isMainMaterial THEN g ELSE NULL END AS mainMaterial,
          CASE WHEN NOT isMainMaterial THEN g ELSE NULL END AS otherMaterial,
          materialData
      WITH mainMaterial, otherMaterial, materialData
      OPTIONAL MATCH (existingMainMaterial:Material {name: 'Yaotai'})
      WITH COALESCE(mainMaterial, existingMainMaterial) AS mainMaterial, otherMaterial, materialData
      WITH mainMaterial, otherMaterial, materialData
      WHERE mainMaterial IS NOT NULL AND otherMaterial IS NOT NULL AND materialData.type <> 'Main'
      WITH mainMaterial, otherMaterial, materialData,
      CASE materialData.type
        WHEN 'Manufacturer' THEN 'MANUFACTURER_OF'
        WHEN 'Supplier' THEN 'SUPPLIER_OF'
        WHEN 'Customer' THEN 'CUSTOMER_OF'
        WHEN 'Contractor' THEN 'CONTRACTOR_OF'
        ELSE NULL
      END AS relType
      WHERE relType IS NOT NULL
      CALL apoc.merge.relationship(otherMaterial, relType, {id: mainMaterial.id + '_' + otherMaterial.id}, {
        fromId: mainMaterial.id,
        toId: otherMaterial.id,
        serial: materialData.serial,
        timestamps: timestamp(),
        updateAt: timestamp()
      }, mainMaterial) YIELD rel
      WITH relType, rel, otherMaterial, materialData, mainMaterial
      WITH
        collect(DISTINCT relType) AS relTypes,
        collect(DISTINCT rel{.*}) AS relations,
        collect(DISTINCT otherMaterial{.*, type: materialData.type}) AS otherMaterials,
        CASE WHEN mainMaterial IS NOT NULL THEN [mainMaterial{.*}] ELSE [] END AS mainMaterialList
        WITH relTypes, relations, otherMaterials + mainMaterialList AS materials
        RETURN relTypes, relations, materials
`

    const results = await this.neo4jService.write(cypherQuery, { dtos: dtos }).catch((error) => { throw error; });
    const payload = {
      materials: results.records[0].get('materials'),
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
      'MATCH (g:Material { deleted: false }) ' +
      'WITH g { .* } AS object ' +
      'RETURN collect(object) AS materials'
    ).catch((error) => { throw error; });

    return { status: true, payload: results.records[0].get('materials') };
  }

  async getList() {
    const results = await this.neo4jService.read(
      `
          MATCH (mainMaterial:Material {name: 'Yaotai'})
          MATCH (g:Material)-[rel]->(mainMaterial)
          WITH collect(g{.*}) AS materialNodes, collect(rel{.*, type: type(rel)}) AS relations, mainMaterial
          WITH materialNodes + [mainMaterial{.*}] AS materials, relations
          RETURN materials, relations
          `
    ).catch((error) => { throw error; });

    const payload = {
      materials: results.records[0].get('materials'),
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
      MATCH (mainMaterial:Material {name: 'Yaotai',  deleted: false})
      WITH $dtos AS materials, mainMaterial
      UNWIND materials AS material
      MATCH (g:Material {id: material.id})
      SET g += material
      SET g.updateAt = timestamp()
      WITH mainMaterial, g, material
      MATCH (g)-[existingRel]->(mainMaterial)
      DELETE existingRel
      WITH mainMaterial, g, material,
      CASE material.type
        WHEN 'Manufacturer' THEN 'MANUFACTURER_OF'
        WHEN 'Supplier' THEN 'SUPPLIER_OF'
        WHEN 'Customer' THEN 'CUSTOMER_OF'
        WHEN 'Contractor' THEN 'CONTRACTOR_OF'
        ELSE NULL
      END AS relType
      WHERE relType IS NOT NULL
      CALL apoc.create.relationship(g, relType, {id: mainMaterial.id+'_'+g.id , fromId: mainMaterial.id, toId: g.id, serial: material.serial, timestamps: timestamp()}, mainMaterial) YIELD rel
      WITH relType, rel{.*} AS relation,  g {.*, type: material.type} AS otherMaterial, mainMaterial
      WITH  collect(DISTINCT relType) AS relTypes, collect(DISTINCT relation) AS relations, collect(DISTINCT otherMaterial) AS otherMaterials, mainMaterial
      RETURN relTypes, relations, otherMaterials+[mainMaterial{.*}] AS materials
       `,
      { dtos: dtos }).catch((error) => { throw error; }
      );

    const payload = {
      materials: results.records[0].get('materials'),
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
      'MATCH (g:Material { name: "Yaotai", deleted: false }) ' +
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
      'MATCH (og:Material { deleted: false }) WHERE og.name IS NOT NULL AND og.name <> "Yaotai" ' +
      'OPTIONAL MATCH (og)--(oi:Item) ' +
      'WITH mg, og, collect(DISTINCT properties(oi)) AS ois ' +
      'WITH mg, collect(og { .*, labels: labels(og), items: ois }) AS objects ' +
      'RETURN [mg] + objects AS materials',
    ).catch((error) => { throw error; });

    return { status: true, payload: results.records[0].get('materials') };
  }

  async delete(dto: any[]) {
    const results = await this.neo4jService.write(
      'UNWIND $dto AS materialId ' +
      `MATCH (g:Material { id: materialId }) OPTIONAL MATCH (g)-[r]-() DELETE r, g RETURN *`,
      { dto: dto }).catch((error) => { throw error; }
      );

    return { status: true, payload: results.summary.query.parameters.dto };
  }
}
