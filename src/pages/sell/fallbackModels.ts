import { SmartphoneModel, ModelWithVariants, DeviceVariant } from '../../types';

export interface AppleModelSpec {
  order: number;
  name: string;
  slug: string;
  releaseYear: number;
  basePrice: number;
  ram: string;
  storages: string[];
}

export const EXACT_APPLE_37_SPECS: AppleModelSpec[] = [
  { order: 1, name: 'iPhone 18 Pro Max', slug: 'iphone-18-pro-max', releaseYear: 2026, basePrice: 131000, ram: '12GB', storages: ['256GB', '512GB', '1TB', '2TB'] },
  { order: 2, name: 'iPhone 18 Pro', slug: 'iphone-18-pro', releaseYear: 2026, basePrice: 121000, ram: '12GB', storages: ['256GB', '512GB', '1TB', '2TB'] },
  { order: 3, name: 'iPhone 17e', slug: 'iphone-17e', releaseYear: 2025, basePrice: 38000, ram: '8GB', storages: ['256GB', '512GB'] },
  { order: 4, name: 'iPhone 17 Pro Max', slug: 'iphone-17-pro-max', releaseYear: 2025, basePrice: 76500, ram: '12GB', storages: ['256GB', '512GB', '1TB', '2TB'] },
  { order: 5, name: 'iPhone 17 Pro', slug: 'iphone-17-pro', releaseYear: 2025, basePrice: 66000, ram: '12GB', storages: ['256GB', '512GB', '1TB'] },
  { order: 6, name: 'iPhone Air', slug: 'iphone-air', releaseYear: 2025, basePrice: 54000, ram: '12GB', storages: ['256GB', '512GB', '1TB'] },
  { order: 7, name: 'iPhone 17', slug: 'iphone-17', releaseYear: 2025, basePrice: 47500, ram: '8GB', storages: ['256GB', '512GB'] },
  { order: 8, name: 'iPhone 16e', slug: 'iphone-16e', releaseYear: 2025, basePrice: 29500, ram: '8GB', storages: ['128GB', '256GB', '512GB'] },
  { order: 9, name: 'iPhone 16 Pro Max', slug: 'iphone-16-pro-max', releaseYear: 2024, basePrice: 64000, ram: '8GB', storages: ['256GB', '512GB', '1TB'] },
  { order: 10, name: 'iPhone 16 Pro', slug: 'iphone-16-pro', releaseYear: 2024, basePrice: 55000, ram: '8GB', storages: ['128GB', '256GB', '512GB', '1TB'] },
  { order: 11, name: 'iPhone 16 Plus', slug: 'iphone-16-plus', releaseYear: 2024, basePrice: 43000, ram: '8GB', storages: ['128GB', '256GB', '512GB'] },
  { order: 12, name: 'iPhone 16', slug: 'iphone-16', releaseYear: 2024, basePrice: 38500, ram: '8GB', storages: ['128GB', '256GB', '512GB'] },
  { order: 13, name: 'iPhone 15', slug: 'iphone-15', releaseYear: 2023, basePrice: 35000, ram: '6GB', storages: ['128GB', '256GB', '512GB'] },
  { order: 14, name: 'iPhone 15 Plus', slug: 'iphone-15-plus', releaseYear: 2023, basePrice: 38500, ram: '6GB', storages: ['128GB', '256GB', '512GB'] },
  { order: 15, name: 'iPhone 15 Pro Max', slug: 'iphone-15-pro-max', releaseYear: 2023, basePrice: 56000, ram: '8GB', storages: ['256GB', '512GB', '1TB'] },
  { order: 16, name: 'iPhone 15 Pro', slug: 'iphone-15-pro', releaseYear: 2023, basePrice: 48000, ram: '8GB', storages: ['128GB', '256GB', '512GB', '1TB'] },
  { order: 17, name: 'iPhone 14 Plus', slug: 'iphone-14-plus', releaseYear: 2022, basePrice: 28000, ram: '6GB', storages: ['128GB', '256GB', '512GB'] },
  { order: 18, name: 'iPhone 14 Pro Max', slug: 'iphone-14-pro-max', releaseYear: 2022, basePrice: 42000, ram: '6GB', storages: ['128GB', '256GB', '512GB', '1TB'] },
  { order: 19, name: 'iPhone 14 Pro', slug: 'iphone-14-pro', releaseYear: 2022, basePrice: 36000, ram: '6GB', storages: ['128GB', '256GB', '512GB', '1TB'] },
  { order: 20, name: 'iPhone 14', slug: 'iphone-14', releaseYear: 2022, basePrice: 25000, ram: '6GB', storages: ['128GB', '256GB', '512GB'] },
  { order: 21, name: 'iPhone SE 2022', slug: 'iphone-se-2022', releaseYear: 2022, basePrice: 12000, ram: '4GB', storages: ['64GB', '128GB', '256GB'] },
  { order: 22, name: 'iPhone XS Max', slug: 'iphone-xs-max', releaseYear: 2018, basePrice: 11500, ram: '4GB', storages: ['64GB', '256GB', '512GB'] },
  { order: 23, name: 'iPhone XR', slug: 'iphone-xr', releaseYear: 2018, basePrice: 8500, ram: '3GB', storages: ['64GB', '128GB', '256GB'] },
  { order: 24, name: 'iPhone X', slug: 'iphone-x', releaseYear: 2017, basePrice: 7500, ram: '3GB', storages: ['64GB', '256GB'] },
  { order: 25, name: 'iPhone 13 Pro Max', slug: 'iphone-13-pro-max', releaseYear: 2021, basePrice: 32000, ram: '6GB', storages: ['128GB', '256GB', '512GB', '1TB'] },
  { order: 26, name: 'iPhone 13 Pro', slug: 'iphone-13-pro', releaseYear: 2021, basePrice: 27500, ram: '6GB', storages: ['128GB', '256GB', '512GB', '1TB'] },
  { order: 27, name: 'iPhone 13 Mini', slug: 'iphone-13-mini', releaseYear: 2021, basePrice: 19000, ram: '4GB', storages: ['128GB', '256GB', '512GB'] },
  { order: 28, name: 'iPhone 13', slug: 'iphone-13', releaseYear: 2021, basePrice: 22000, ram: '4GB', storages: ['128GB', '256GB', '512GB'] },
  { order: 29, name: 'iPhone 12 Pro Max', slug: 'iphone-12-pro-max', releaseYear: 2020, basePrice: 23000, ram: '6GB', storages: ['128GB', '256GB', '512GB'] },
  { order: 30, name: 'iPhone 12 Pro', slug: 'iphone-12-pro', releaseYear: 2020, basePrice: 19500, ram: '6GB', storages: ['128GB', '256GB', '512GB'] },
  { order: 31, name: 'iPhone 12 Mini', slug: 'iphone-12-mini', releaseYear: 2020, basePrice: 13500, ram: '4GB', storages: ['64GB', '128GB', '256GB'] },
  { order: 32, name: 'iPhone 12', slug: 'iphone-12', releaseYear: 2020, basePrice: 13500, ram: '4GB', storages: ['64GB', '128GB', '256GB'] },
  { order: 33, name: 'iPhone SE 2020', slug: 'iphone-se-2020', releaseYear: 2020, basePrice: 7500, ram: '3GB', storages: ['64GB', '128GB', '256GB'] },
  { order: 34, name: 'iPhone 11 Pro Max', slug: 'iphone-11-pro-max', releaseYear: 2019, basePrice: 16500, ram: '4GB', storages: ['64GB', '256GB', '512GB'] },
  { order: 35, name: 'iPhone 11 Pro', slug: 'iphone-11-pro', releaseYear: 2019, basePrice: 14000, ram: '4GB', storages: ['64GB', '256GB', '512GB'] },
  { order: 36, name: 'iPhone 11', slug: 'iphone-11', releaseYear: 2019, basePrice: 10200, ram: '4GB', storages: ['64GB', '128GB', '256GB'] },
  { order: 37, name: 'iPhone XS', slug: 'iphone-xs', releaseYear: 2018, basePrice: 9500, ram: '4GB', storages: ['64GB', '256GB', '512GB'] },
];

function getModifier(baseStorage: string, storage: string): number {
  if (storage === baseStorage) return 0;
  if (baseStorage === '64GB') {
    if (storage === '128GB') return 2000;
    if (storage === '256GB') return 4500;
    if (storage === '512GB') return 7500;
  }
  if (baseStorage === '128GB') {
    if (storage === '256GB') return 4000;
    if (storage === '512GB') return 9000;
    if (storage === '1TB') return 18000;
  }
  if (baseStorage === '256GB') {
    if (storage === '512GB') return 9000;
    if (storage === '1TB') return 19000;
    if (storage === '2TB') return 34000;
  }
  return 3000;
}

const APPLE_FALLBACK_MODELS: SmartphoneModel[] = EXACT_APPLE_37_SPECS.map((spec) => {
  const baseStorage = spec.storages[0];
  const maxStorage = spec.storages[spec.storages.length - 1];
  const maxMod = getModifier(baseStorage, maxStorage);
  return {
    _id: spec.slug,
    name: spec.name,
    slug: spec.slug,
    brandId: 'apple',
    releaseYear: spec.releaseYear,
    basePrice: spec.basePrice,
    displayOrder: spec.order,
    isPublished: true,
    imageUrl: `/uploads/devices/${spec.slug}.png`,
    minPrice: spec.basePrice,
    maxPrice: spec.basePrice + maxMod,
    variantCount: spec.storages.length,
    variants: spec.storages.map((s) => ({
      _id: `${spec.slug}-${s.toLowerCase()}`,
      capacity: `${spec.ram} / ${s}`,
      ram: spec.ram,
      storage: s,
      priceModifier: getModifier(baseStorage, s),
      price: spec.basePrice + getModifier(baseStorage, s),
    })),
  };
});

export const FALLBACK_BRAND_MODELS: Record<string, SmartphoneModel[]> = {
  apple: APPLE_FALLBACK_MODELS,
  infinix: [
    { _id: 'infinix-gt-20-pro-5g', name: 'Infinix GT 20 Pro 5G', slug: 'infinix-gt-20-pro-5g', brandId: 'infinix', releaseYear: 2024, basePrice: 21999, isPublished: true, imageUrl: '/uploads/brands/infinix.png' },
    { _id: 'infinix-note-40-pro-plus-5g', name: 'Infinix Note 40 Pro+ 5G', slug: 'infinix-note-40-pro-plus-5g', brandId: 'infinix', releaseYear: 2024, basePrice: 20999, isPublished: true, imageUrl: '/uploads/brands/infinix.png' },
    { _id: 'infinix-note-40-pro-5g', name: 'Infinix Note 40 Pro 5G', slug: 'infinix-note-40-pro-5g', brandId: 'infinix', releaseYear: 2024, basePrice: 18999, isPublished: true, imageUrl: '/uploads/brands/infinix.png' },
    { _id: 'infinix-zero-30-5g', name: 'Infinix Zero 30 5G', slug: 'infinix-zero-30-5g', brandId: 'infinix', releaseYear: 2023, basePrice: 19999, isPublished: true, imageUrl: '/uploads/brands/infinix.png' },
    { _id: 'infinix-hot-40i', name: 'Infinix Hot 40i', slug: 'infinix-hot-40i', brandId: 'infinix', releaseYear: 2024, basePrice: 9999, isPublished: true, imageUrl: '/uploads/brands/infinix.png' },
    { _id: 'infinix-smart-8-hd', name: 'Infinix Smart 8 HD', slug: 'infinix-smart-8-hd', brandId: 'infinix', releaseYear: 2023, basePrice: 6299, isPublished: true, imageUrl: '/uploads/brands/infinix.png' },
  ],
  tecno: [
    { _id: 'tecno-phantom-v-fold-5g', name: 'Tecno Phantom V Fold 5G', slug: 'tecno-phantom-v-fold-5g', brandId: 'tecno', releaseYear: 2023, basePrice: 64999, isPublished: true, imageUrl: '/uploads/brands/tecno.png' },
    { _id: 'tecno-phantom-v-flip-5g', name: 'Tecno Phantom V Flip 5G', slug: 'tecno-phantom-v-flip-5g', brandId: 'tecno', releaseYear: 2023, basePrice: 39999, isPublished: true, imageUrl: '/uploads/brands/tecno.png' },
    { _id: 'tecno-camon-30-premier-5g', name: 'Tecno Camon 30 Premier 5G', slug: 'tecno-camon-30-premier-5g', brandId: 'tecno', releaseYear: 2024, basePrice: 34999, isPublished: true, imageUrl: '/uploads/brands/tecno.png' },
    { _id: 'tecno-camon-30-pro-5g', name: 'Tecno Camon 30 Pro 5G', slug: 'tecno-camon-30-pro-5g', brandId: 'tecno', releaseYear: 2024, basePrice: 22999, isPublished: true, imageUrl: '/uploads/brands/tecno.png' },
    { _id: 'tecno-pova-6-pro-5g', name: 'Tecno Pova 6 Pro 5G', slug: 'tecno-pova-6-pro-5g', brandId: 'tecno', releaseYear: 2024, basePrice: 17999, isPublished: true, imageUrl: '/uploads/brands/tecno.png' },
    { _id: 'tecno-spark-20-pro-plus', name: 'Tecno Spark 20 Pro+', slug: 'tecno-spark-20-pro-plus', brandId: 'tecno', releaseYear: 2024, basePrice: 14999, isPublished: true, imageUrl: '/uploads/brands/tecno.png' },
  ],
  nokia: [
    { _id: 'nokia-xr21-5g', name: 'Nokia XR21 5G Rugged', slug: 'nokia-xr21-5g', brandId: 'nokia', releaseYear: 2023, basePrice: 26999, isPublished: true, imageUrl: '/uploads/brands/nokia.png' },
    { _id: 'nokia-g42-5g', name: 'Nokia G42 5G', slug: 'nokia-g42-5g', brandId: 'nokia', releaseYear: 2023, basePrice: 12999, isPublished: true, imageUrl: '/uploads/brands/nokia.png' },
    { _id: 'nokia-x30-5g', name: 'Nokia X30 5G PureView', slug: 'nokia-x30-5g', brandId: 'nokia', releaseYear: 2022, basePrice: 24999, isPublished: true, imageUrl: '/uploads/brands/nokia.png' },
    { _id: 'nokia-g21', name: 'Nokia G21', slug: 'nokia-g21', brandId: 'nokia', releaseYear: 2022, basePrice: 9999, isPublished: true, imageUrl: '/uploads/brands/nokia.png' },
    { _id: 'nokia-c32', name: 'Nokia C32', slug: 'nokia-c32', brandId: 'nokia', releaseYear: 2023, basePrice: 7999, isPublished: true, imageUrl: '/uploads/brands/nokia.png' },
  ],
  lava: [
    { _id: 'lava-agni-3-5g', name: 'Lava Agni 3 5G Dual AMOLED', slug: 'lava-agni-3-5g', brandId: 'lava', releaseYear: 2024, basePrice: 20999, isPublished: true, imageUrl: '/uploads/brands/lava.png' },
    { _id: 'lava-agni-2-5g', name: 'Lava Agni 2 5G Curved AMOLED', slug: 'lava-agni-2-5g', brandId: 'lava', releaseYear: 2023, basePrice: 17999, isPublished: true, imageUrl: '/uploads/brands/lava.png' },
    { _id: 'lava-blaze-curve-5g', name: 'Lava Blaze Curve 5G', slug: 'lava-blaze-curve-5g', brandId: 'lava', releaseYear: 2024, basePrice: 15999, isPublished: true, imageUrl: '/uploads/brands/lava.png' },
    { _id: 'lava-blaze-pro-5g', name: 'Lava Blaze Pro 5G', slug: 'lava-blaze-pro-5g', brandId: 'lava', releaseYear: 2023, basePrice: 11999, isPublished: true, imageUrl: '/uploads/brands/lava.png' },
    { _id: 'lava-yuva-3-pro', name: 'Lava Yuva 3 Pro', slug: 'lava-yuva-3-pro', brandId: 'lava', releaseYear: 2023, basePrice: 8499, isPublished: true, imageUrl: '/uploads/brands/lava.png' },
    { _id: 'lava-o2', name: 'Lava O2', slug: 'lava-o2', brandId: 'lava', releaseYear: 2024, basePrice: 7999, isPublished: true, imageUrl: '/uploads/brands/lava.png' },
  ],
  honor: [
    { _id: 'honor-magic-6-pro-5g', name: 'Honor Magic 6 Pro 5G AI', slug: 'honor-magic-6-pro-5g', brandId: 'honor', releaseYear: 2024, basePrice: 84999, isPublished: true, imageUrl: '/uploads/brands/honor.png' },
    { _id: 'honor-200-pro-5g', name: 'Honor 200 Pro 5G Studio Portrait', slug: 'honor-200-pro-5g', brandId: 'honor', releaseYear: 2024, basePrice: 49999, isPublished: true, imageUrl: '/uploads/brands/honor.png' },
    { _id: 'honor-200-5g', name: 'Honor 200 5G', slug: 'honor-200-5g', brandId: 'honor', releaseYear: 2024, basePrice: 31999, isPublished: true, imageUrl: '/uploads/brands/honor.png' },
    { _id: 'honor-x9b-5g', name: 'Honor X9b 5G Ultra-Bounce', slug: 'honor-x9b-5g', brandId: 'honor', releaseYear: 2024, basePrice: 21999, isPublished: true, imageUrl: '/uploads/brands/honor.png' },
    { _id: 'honor-90-5g', name: 'Honor 90 5G 200MP', slug: 'honor-90-5g', brandId: 'honor', releaseYear: 2023, basePrice: 25999, isPublished: true, imageUrl: '/uploads/brands/honor.png' },
  ],
  huawei: [
    { _id: 'huawei-mate-60-pro', name: 'Huawei Mate 60 Pro Satellite', slug: 'huawei-mate-60-pro', brandId: 'huawei', releaseYear: 2023, basePrice: 72999, isPublished: true, imageUrl: '/uploads/brands/huawei.png' },
    { _id: 'huawei-p60-pro', name: 'Huawei P60 Pro XMAGE', slug: 'huawei-p60-pro', brandId: 'huawei', releaseYear: 2023, basePrice: 58999, isPublished: true, imageUrl: '/uploads/brands/huawei.png' },
    { _id: 'huawei-nova-11-pro', name: 'Huawei Nova 11 Pro', slug: 'huawei-nova-11-pro', brandId: 'huawei', releaseYear: 2023, basePrice: 32999, isPublished: true, imageUrl: '/uploads/brands/huawei.png' },
    { _id: 'huawei-p50-pro', name: 'Huawei P50 Pro', slug: 'huawei-p50-pro', brandId: 'huawei', releaseYear: 2022, basePrice: 38999, isPublished: true, imageUrl: '/uploads/brands/huawei.png' },
    { _id: 'huawei-mate-50-pro', name: 'Huawei Mate 50 Pro', slug: 'huawei-mate-50-pro', brandId: 'huawei', releaseYear: 2022, basePrice: 44999, isPublished: true, imageUrl: '/uploads/brands/huawei.png' },
  ],
  nubia: [
    { _id: 'nubia-redmagic-9-pro-5g', name: 'Nubia RedMagic 9 Pro 5G Flagship Gaming', slug: 'nubia-redmagic-9-pro-5g', brandId: 'nubia', releaseYear: 2024, basePrice: 64999, isPublished: true, imageUrl: '/uploads/brands/nubia.png' },
    { _id: 'nubia-redmagic-8s-pro-5g', name: 'Nubia RedMagic 8S Pro 5G', slug: 'nubia-redmagic-8s-pro-5g', brandId: 'nubia', releaseYear: 2023, basePrice: 49999, isPublished: true, imageUrl: '/uploads/brands/nubia.png' },
    { _id: 'nubia-z60-ultra-5g', name: 'Nubia Z60 Ultra 5G Under-Display Cam', slug: 'nubia-z60-ultra-5g', brandId: 'nubia', releaseYear: 2024, basePrice: 54999, isPublished: true, imageUrl: '/uploads/brands/nubia.png' },
    { _id: 'nubia-focus-pro-5g', name: 'Nubia Focus Pro 5G 108MP', slug: 'nubia-focus-pro-5g', brandId: 'nubia', releaseYear: 2024, basePrice: 18999, isPublished: true, imageUrl: '/uploads/brands/nubia.png' },
    { _id: 'nubia-neo-2-5g', name: 'Nubia Neo 2 5G Gaming Triggers', slug: 'nubia-neo-2-5g', brandId: 'nubia', releaseYear: 2024, basePrice: 16999, isPublished: true, imageUrl: '/uploads/brands/nubia.png' },
  ],
  cmf: [
    { _id: 'cmf-phone-1', name: 'CMF Phone 1 by Nothing', slug: 'cmf-phone-1', brandId: 'cmf', releaseYear: 2024, basePrice: 14999, isPublished: true, imageUrl: '/uploads/brands/cmf.png' },
  ],
};

export function findFallbackModel(modelSlugOrId: string): ModelWithVariants | null {
  const target = modelSlugOrId.toLowerCase();
  for (const models of Object.values(FALLBACK_BRAND_MODELS)) {
    const found = models.find((m) => m.slug.toLowerCase() === target || m._id.toLowerCase() === target);
    if (found) {
      const variants: DeviceVariant[] = found.variants && found.variants.length > 0
        ? found.variants
        : [
            { _id: `${found.slug}-var-1`, capacity: '128GB', priceModifier: 0, price: found.basePrice },
            { _id: `${found.slug}-var-2`, capacity: '256GB', priceModifier: 3000, price: found.basePrice + 3000 },
          ];
      return {
        model: found,
        variants,
        minPrice: found.minPrice ?? found.basePrice,
        maxPrice: found.maxPrice ?? (found.basePrice + (variants[variants.length - 1]?.priceModifier || 0)),
      };
    }
  }
  return null;
}
