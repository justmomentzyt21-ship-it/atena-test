export function optimizeCloudinaryUrl(url: string, width = 500, aspectRatio?: string): string {
  if (!url.includes('res.cloudinary.com')) return url;

  const cropParams = aspectRatio
    ? `f_auto,q_auto,w_${width},c_fill,ar_${aspectRatio}/`
    : `f_auto,q_auto,w_${width}/`;

  return url.replace('/upload/', `/upload/${cropParams}`);
}
