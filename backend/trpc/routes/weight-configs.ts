import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../create-context";
import { dbQuery, ensureDB } from "../../db";

export const weightConfigsRouter = createTRPCRouter({
  list: publicProcedure
    .input(z.object({ site: z.string().optional() }).optional())
    .query(async ({ input }) => {
      await ensureDB();
      const site = input?.site;
      let sql = "SELECT * FROM weight_config ORDER BY created_at DESC";
      const params: unknown[] = [];
      if (site && site !== "ALL") {
        sql = "SELECT * FROM weight_config WHERE site = ? ORDER BY created_at DESC";
        params.push(site);
      }
      console.log("[weightConfigs.list] Fetching weight configs");
      const results = await dbQuery<Record<string, unknown>>(sql, params);
      console.log("[weightConfigs.list] Found", results.length, "configs");
      return results;
    }),

  save: publicProcedure
    .input(z.object({
      name: z.string(),
      site: z.string(),
      is_default: z.boolean(),
      weights: z.record(z.number()),
      sub_weights: z.record(z.unknown()),
      tga: z.number(),
      tar: z.number(),
    }))
    .mutation(async ({ input }) => {
      await ensureDB();
      console.log("[weightConfigs.save] Saving weight config:", input.name);

      await dbQuery("DELETE FROM weight_config WHERE name = ?", [input.name]);

      if (input.is_default) {
        await dbQuery("UPDATE weight_config SET is_default = false WHERE site = ?", [input.site]);
      }

      const weightsJson = JSON.stringify(input.weights);
      const subWeightsJson = JSON.stringify(input.sub_weights);
      const now = new Date().toISOString();

      await dbQuery(
        `INSERT INTO weight_config (name, site, is_default, weights, sub_weights, tga, tar, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [input.name, input.site, input.is_default, weightsJson, subWeightsJson, input.tga, input.tar, now, now],
      );

      console.log("[weightConfigs.save] Weight config saved successfully");
      return { success: true };
    }),

  delete: publicProcedure
    .input(z.object({ name: z.string() }))
    .mutation(async ({ input }) => {
      await ensureDB();
      console.log("[weightConfigs.delete] Deleting weight config:", input.name);
      await dbQuery("DELETE FROM weight_config WHERE name = ?", [input.name]);
      return { success: true };
    }),

  getDefaults: publicProcedure
    .query(async () => {
      await ensureDB();
      console.log("[weightConfigs.getDefaults] Fetching default assessment configs");

      // Return default assessment configurations
      const defaults = {
        shoulder: {
          name: 'Shoulder Assessment Default',
          domains: ['Severity', 'ROM', 'Rotator Cuff', 'Physio Exam', 'Occupational', 'Comorbidity'],
          defaultWeights: {
            'Severity': 25,
            'ROM': 25,
            'Rotator Cuff': 15,
            'Physio Exam': 15,
            'Occupational': 12,
            'Comorbidity': 8
          },
          constraints: {
            'Severity': { min: 18, max: 40 },
            'ROM': { min: 15, max: 35 },
            'Rotator Cuff': { min: 10, max: 25 },
            'Physio Exam': { min: 12, max: 20 },
            'Occupational': { min: 8, max: 20 },
            'Comorbidity': { min: 5, max: 15 }
          },
          questions: {
            'Severity': ['Pain Level', 'Functional Impact'],
            'ROM': ['Abduction', 'Adduction', 'Internal Rotation', 'External Rotation', 'Horizontal Adduction', 'Horizontal Abduction'],
            'Rotator Cuff': ['Strength', 'Impingement Test'],
            'Physio Exam': ["Neer's Test", "Hawkins Test", 'Drop Arm Test', "O'Brien's Test", 'Tenderness', 'ROM Quality'],
            'Occupational': ['Overhead Work', 'Lifting Frequency']
          },
          questionConstraints: {
            'Severity': { 'Pain Level': { min: 10, max: 25 }, 'Functional Impact': { min: 10, max: 25 } },
            'ROM': {
              'Abduction': { min: 8, max: 20 },
              'Adduction': { min: 8, max: 20 },
              'Internal Rotation': { min: 8, max: 20 },
              'External Rotation': { min: 8, max: 20 },
              'Horizontal Adduction': { min: 8, max: 20 },
              'Horizontal Abduction': { min: 8, max: 20 }
            },
            'Rotator Cuff': { 'Strength': { min: 10, max: 20 }, 'Impingement Test': { min: 10, max: 20 } },
            'Physio Exam': {
              "Neer's Test": { min: 8, max: 18 },
              "Hawkins Test": { min: 8, max: 18 },
              'Drop Arm Test': { min: 8, max: 18 },
              "O'Brien's Test": { min: 8, max: 18 },
              'Tenderness': { min: 8, max: 18 },
              'ROM Quality': { min: 8, max: 18 }
            },
            'Occupational': { 'Overhead Work': { min: 10, max: 20 }, 'Lifting Frequency': { min: 10, max: 20 } }
          }
        }
      };

      return defaults;
    }),
});
