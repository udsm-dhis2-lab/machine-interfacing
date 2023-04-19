const mappings = {
  mtb: 'ywRl88yte5b',
  inh: 'nPGTzMkULFh',
  linh: 'nPGTzMkULFh',
  'GLqRo7AuhJM': 'GLqRo7AuhJM', //DST Result Ethionamide
  flq: 'o2zbpZDZele', //DST Result Fluoroquinolone
  lflq: 'o2zbpZDZele' //DST Result Fluoroquinolone
}

const mapping = {
  ywRl88yte5b: ['mtb'],
  nPGTzMkULFh: ['inh', 'linh'],
  o2zbpZDZele: ['flq', 'lflq'],
  GLqRo7AuhJM: ['eth']
}

const stageMappings = {
  nPGTzMkULFh: { inh: 'INH Resistance ', linh: 'INH Resistance ' },
  ywRl88yte5b: { mtb: 'MTB ' },
  o2zbpZDZele: { flq: 'FLQ Resistance ', lflq: 'FLQ Resistance ' },
  GLqRo7AuhJM: { eth: 'ETH Resistance ' }
}

const finalResults = (results) => {
  let stage1 = []
  let stage2 = []
  Object.keys(results).forEach(dataElement => {
    if (results[dataElement].length === 2) {
      stage1 = [...stage1, { dataElement, value: stageMappings[dataElement][results[dataElement][0]?.assayNumber] + results[dataElement][0]?.result }]
      stage2 = [...stage2, { dataElement, value: stageMappings[dataElement][results[dataElement][1]?.assayNumber] + results[dataElement][1]?.result }]
    } else {
      stage1 = [...stage1, { dataElement, value: stageMappings[dataElement][results[dataElement][0]?.assayNumber] + results[dataElement][0]?.result }]
    }
  })
  return { stage1, stage2 }
}

const filterResults = (results, value) => {
  return results.find(({ assayNumber }) => assayNumber === value)?.result
}

const patientResults = (results) => {
  const result = {}
  Object.keys(mapping).forEach(key => {
    const data = mapping[key].map(d => results.find(({ assayNumber, result }) => assayNumber === d && result !== '')).filter(d => Boolean(d))
    if (data.length > 0) {
      result[key] = data
    }

  })
  return finalResults(result)
}

const sanitizeResults = (results) => {
  results = results.map(result => {
    const cleanResult = {}
    Object.keys(result).forEach(key => {
      cleanResult[key] = isNaN(result[key]) ? (result[key] || '').replace(/^\^+|\^+$/g, '') : result[key]
    })
    return cleanResult
  }).filter(result => Boolean(result))

  return patientResults(results)
}
const cleanData = (data) => {
  const dataArrays = context.raw(data).filter(d => d.resultData.length > 0)
  let results = []
  for (const dataArray of dataArrays) {
    const testedResults = dataArray.resultData.filter(d => d.testedBy && d.testedBy !== '')
    results = [...results, ...testedResults]
  }
  const ethr = data.split('ETH Resistance^|')
  const ethrData = { ...results[0], assayNumber: 'eth', result: ethr.length > 1 ? ethr[1]?.split('|')[0] : null }
  results = [...results, ethrData]
  return sanitizeResults(results)
}

const syncData = async (rows) => {
  const auth = {
    username: context.secret.username,
    password: context.secret.password,
  };
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "*",
    "Access-Control-Allow-Credentials": "true",
    Accept: "*",
  };
  for (const row of rows) {
    if (!row?.patient_id) continue;
    const url = `${context.secret.url}/api/trackedEntityInstances.json?filter=${context.secret.tbAttribute
      }:EQ:${row?.patient_id
        .replace("-", "=")
        .split("-")
        .join("/")
        .replace("=", "-")}&ou=${context.secret.ou}&ouMode=DESCENDANTS&program=${context.secret.program
      }&fields=attributes[attribute,code,value],enrollments[*],orgUnit,trackedEntityInstance&paging=false`;
    const res = await context.http.get(url, {
      auth,
      headers,
    });
    // FOUND CLIENTS
    if (
      res?.data?.trackedEntityInstances?.length > 0
    ) {
      const trackedEntityInstanceData = res.data?.trackedEntityInstances[0];
      let stage1DataValues = []
      let stage2DataValues = []
      let dataValues = [
        {
          dataElement: "LV7d7aBw0fn",
          value: "true",
          providedElsewhere: false,
        },
        {
          dataElement: "jYKFZdR99Tz",
          value: row?.order_id,
          providedElsewhere: false,
        },
        {
          dataElement: "levlyYdnhws",
          value: "10 Color Module GeneXpert",
        },
      ]
      const stages = cleanData(rows[0]?.raw_text)
      if (stages.stage1.length > 1) {
        stage1DataValues = [...stage1DataValues, ...dataValues, ...stages.stage1]
      }

      if (stages.stage2.length > 1) {
        stage2DataValues = [...stage2DataValues, ...dataValues, ...stages.stage2]
      }
      const eventPayload = {
        orgUnit: trackedEntityInstanceData?.orgUnit,
        program: "tj4u1ip0tTF",
        programStage: "yzu183PkJCH",
        status: "VISITED",
        eventDate: new Date(row?.analysed_date_time),
        trackedEntityInstance: trackedEntityInstanceData?.trackedEntityInstance,
        dataValues: stages.stage1.length > 1 ? stage1DataValues : stage2DataValues
      };

      const eventUrl = `${context.secret.url}/api/events${row?.reference_uuid ? "/" + row?.reference_uuid : ""
        }.json`;
      const { data } = !row?.reference_uuid
        ? await context.http.post(eventUrl, eventPayload, {
          auth,
          headers,
        })
        : await context.http.put(eventUrl, eventPayload, {
          auth,
          headers,
        });
      const response = data?.response;
      if (response?.imported === 1 || response?.updated === 1) {
        const reference_uuid = response?.importSummaries[0]?.reference;
        const sync_status = response?.importSummaries[0]?.status;
        //   Update the orders table for sync reference references
        try {
          const db = new context.sqlite.Database(
            context.dbPath,
            context.sqlite.OPEN_READWRITE,
            (err) => {
              if (err) {
              }
            }
          );

          const query = `UPDATE orders SET reference_uuid="${reference_uuid}",sync_status="${sync_status}" WHERE id=${row?.id}`;
          db.all(query, [], async (err, rows) => {
            if (!err) {
            } else {
            }
          });
        } catch (e) { }
      } else {
      }
    }
    continue;
  }
};
const run = async () => {
  try {
    const db = new context.sqlite.Database(
      context.dbPath,
      context.sqlite.OPEN_READWRITE,
      (err) => {
        if (err) {
          console.error(err.message);
        }
      }
    );

    const sql = `SELECT * FROM orders WHERE CAN_SYNC='true';`;
    db.all(sql, [], async (err, rows) => {
      if (err || rows.length === 0) {
        console.error(err ? err : "No data to sync");
      } else {
        await syncData(rows);
      }
    });
  } catch (e) { }
};

return run();
