import type { MediaFieldsDTO } from './media';
import {
  coerceNumber,
  coerceString,
  coerceBoolean,
  coerceNullableString,
  coerceIsoDateString,
} from './utils';

/** 与后端 `formatPlan` 一致 */
export type PricingPlanDTO = MediaFieldsDTO & {
  id: number;
  name: string;
  price: number;
  description: string;
  features: string[];
  isPopular: boolean;
  tag: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export function parsePricingPlanDto(raw: unknown): PricingPlanDTO | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  const id = coerceNumber(o.id);
  const price = coerceNumber(o.price);
  const sortOrder = coerceNumber(o.sortOrder);
  if (id == null || price == null || sortOrder == null) return null;

  const fr = o.features;
  const features = Array.isArray(fr)
    ? fr.filter((x): x is string => typeof x === 'string')
    : [];

  return {
    id,
    name: coerceString(o.name),
    price,
    description: coerceString(o.description),
    features,
    isPopular: coerceBoolean(o.isPopular),
    tag: coerceNullableString(o.tag),
    image: coerceNullableString(o.image),
    imageUrl: coerceNullableString(o.imageUrl),
    sortOrder,
    createdAt: coerceIsoDateString(o.createdAt) ?? '',
    updatedAt: coerceIsoDateString(o.updatedAt) ?? '',
  };
}
