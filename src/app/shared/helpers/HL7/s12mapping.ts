export const HL7Mapping = {
  format: "hl7-2.4",
  adapter: "default",
  mapping: {
    msh: {
      values: [
        { field: "msh.message_datetime", component: [5, 1] },
        { field: "msh.message_type", component: [7, 1] },
        { field: "msh.message_type_ref", component: [7, 2] },
        { field: "msh.message_control_id", component: [8, 1] },
        { field: "msh.principal_language_of_message", component: [15, 1] },
        { field: "msh.character_set", component: [16, 1] },
      ],
    },
    pid: {
      values: [
        { field: "pid.id", component: [3, 1] },
        { field: "pid.origin", component: [3, 4] },
        { field: "pid.first_name", component: [5, 2] },
        { field: "pid.last_name", component: [5, 1] },
        { field: "pid.birthdate", component: [7, 1] },
        { field: "pid.gender", component: [8, 1] },
        { field: "pid.street_name", component: [11, 1] },
        { field: "pid.city", component: [11, 3] },
        { field: "pid.zip_code", component: [11, 5] },
        { field: "pid.phone", component: [13, 1] },
        { field: "pid.email", component: [13, 4] },
      ],
    },
    sch: {
      values: [
        { field: "sch.id", component: [2, 1] },
        { field: "sch.origin", component: [2, 2] },
        { field: "sch.length", component: [6, 1] },
        { field: "sch.minutes", component: [11, 3] },
        { field: "sch.datetime", component: [11, 4] },
        { field: "sch.datetime", component: [16, 1] },
        { field: "sch.last_name", component: [16, 2] },
        { field: "sch.first_name", component: [16, 3] },
        { field: "sch.source", component: [20, 1] },
        { field: "sch.status", component: [25, 1] },
      ],
    },
    rgs: {
      values: [{ field: "rgs.id", component: [1, 1] }],
    },
    aig: {
      values: [
        { field: "aig.id", component: [1, 1] },
        { field: "aig.rpps_finess", component: [4, 1] },
      ],
    },
    nte: {
      values: [{ field: "nte.comment", component: [3, 1] }],
    },
  },
};
