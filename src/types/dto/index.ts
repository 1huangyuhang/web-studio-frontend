/**
 * 官网展示层 DTO：与后端 Prisma + `serializeMediaFields` 出参对齐。
 * 页面与组件应通过 `parse*Dto` 收敛未知 JSON，再用 `mediaDisplaySrc` 生成图片地址。
 */
export type { MediaFieldsDTO } from './media';
export { mediaDisplaySrc } from './media';

export type { ProductDTO } from './product.dto';
export { parseProductDto } from './product.dto';

export type { ActivityDTO } from './activity.dto';
export { parseActivityDto, activityDisplayDateFromRow } from './activity.dto';

export type { NewsListItemDTO } from './news.dto';
export { parseNewsListItemDto } from './news.dto';

export type { CourseDTO } from './course.dto';
export { parseCourseDto } from './course.dto';

export type { PricingPlanDTO } from './pricingPlan.dto';
export { parsePricingPlanDto } from './pricingPlan.dto';

export type { SiteAssetDTO } from './siteAsset.dto';
export { parseSiteAssetDto } from './siteAsset.dto';

export {
  coerceNumber,
  coerceString,
  coerceNullableString,
  coerceBoolean,
  coerceIsoDateString,
} from './utils';
