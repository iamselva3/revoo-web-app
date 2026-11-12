import { SmartphoneModel, ModelWithVariants, DeviceVariant } from '../../types';

export const FALLBACK_BRAND_MODELS: Record<string, SmartphoneModel[]> = {
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
      const variants: DeviceVariant[] = [
        { _id: `${found.slug}-var-1`, capacity: '128GB', priceModifier: 0, price: found.basePrice },
        { _id: `${found.slug}-var-2`, capacity: '256GB', priceModifier: 3000, price: found.basePrice + 3000 },
      ];
      return {
        model: found,
        variants,
        minPrice: found.basePrice,
        maxPrice: found.basePrice + 3000,
      };
    }
  }
  return null;
}
