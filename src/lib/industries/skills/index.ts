import { healthcareIndustry } from "./healthcare";
import { financeIndustry } from "./finance";
import { salesIndustry } from "./sales";
import { legalIndustry } from "./legal";
import { technologyIndustry } from "./technology";
import { marketingIndustry } from "./marketing";
import { human_resourcesIndustry } from "./human_resources";
import { educationIndustry } from "./education";
import { operationsIndustry } from "./operations";
import { designIndustry } from "./design";
import { customer_successIndustry } from "./customer_success";
import { data_analyticsIndustry } from "./data_analytics";
import { constructionIndustry } from "./construction";
import { generalIndustry } from "./general";
import type { IndustryDefinition } from "@/lib/industry-skills";

/**
 * All industry definitions assembled from per-industry files.
 * Add a new industry by creating a new file and importing it here.
 */
export const INDUSTRIES_FROM_FILES: Record<string, IndustryDefinition> = {
  healthcare: healthcareIndustry,
  finance: financeIndustry,
  sales: salesIndustry,
  legal: legalIndustry,
  technology: technologyIndustry,
  marketing: marketingIndustry,
  human_resources: human_resourcesIndustry,
  education: educationIndustry,
  operations: operationsIndustry,
  design: designIndustry,
  customer_success: customer_successIndustry,
  data_analytics: data_analyticsIndustry,
  construction: constructionIndustry,
  general: generalIndustry,
};
