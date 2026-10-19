/** Isolated 3D packshot for each catalogue item (files in /public/products). */
const BY_NAME: Record<string, string> = {
  "iPhone 15 Pro Max": "/products/iphone-15-pro-max.webp",
  "iPhone 15": "/products/iphone-15.webp",
  "iPhone 14 Pro": "/products/iphone-14-pro.webp",
  "iPhone 13": "/products/iphone-13.webp",
  "iPhone 12 Pro Max": "/products/iphone-12-pro-max.webp",
  "iPhone 12": "/products/iphone-12.webp",
  "iPhone 11": "/products/iphone-11.webp",
  "Galaxy S24 Ultra": "/products/galaxy-s24-ultra.webp",
  "Galaxy S23 Ultra": "/products/galaxy-s23-ultra.webp",
  "Galaxy S23 FE": "/products/galaxy-s23-fe.webp",
  "Galaxy Z Flip5": "/products/galaxy-z-flip5.webp",
  "Galaxy A54 5G": "/products/galaxy-a54.webp",
  'MacBook Air 13" M2': "/products/macbook-air-m2.webp",
  'MacBook Pro 14" M1 Pro': "/products/macbook-pro-14.webp",
  'MacBook Air 13" M1': "/products/macbook-air-m1.webp",
  "Dell XPS 13 9310": "/products/dell-xps-13.webp",
  "ThinkPad X1 Carbon Gen 9": "/products/thinkpad-x1.webp",
  "HP EliteBook 840 G8": "/products/hp-elitebook.webp",
  "Acer Swift 3": "/products/acer-swift.webp",
  'iPad Pro 11" M2': "/products/ipad-pro.webp",
  "iPad Air 5th Gen": "/products/ipad-air.webp",
  "iPad 9th Gen": "/products/ipad-9.webp",
  "Galaxy Tab S8": "/products/galaxy-tab-s8.webp",
  "Apple Watch Series 9 45mm": "/products/apple-watch-s9.webp",
  "Apple Watch Series 8 41mm": "/products/apple-watch-s8.webp",
  "Apple Watch SE 2": "/products/apple-watch-se.webp",
  "Galaxy Watch 6 44mm": "/products/galaxy-watch-6.webp",
  "AirPods Pro 2": "/products/airpods-pro-2.webp",
  "AirPods 3rd Gen": "/products/airpods-3.webp",
  "Sony WH-1000XM4": "/products/sony-wh-1000xm4.webp",
  "JBL Flip 6": "/products/jbl-flip-6.webp",
  "35W Dual USB-C Power Adapter": "/products/charger.webp",
  "240W USB-C Charge Cable 2m": "/products/cable.webp",
  "Shockproof Clear Case": "/products/case.webp",
};

export const CATEGORY_IMAGE: Record<string, string> = {
  iphones: "/products/iphone-15-pro-max.webp",
  samsung: "/products/galaxy-s24-ultra.webp",
  laptops: "/products/macbook-air-m2.webp",
  tablets: "/products/ipad-pro.webp",
  watches: "/products/apple-watch-s9.webp",
  audio: "/products/airpods-pro-2.webp",
  accessories: "/products/charger.webp",
};

export function imageFor(name: string) {
  return BY_NAME[name] ?? "/products/iphone-15.webp";
}

/** Representative 3D model for each category tile. */
export const CATEGORY_SAMPLE: Record<string, string> = {
  iphones: "iPhone 15 Pro Max",
  samsung: "Galaxy S24 Ultra",
  laptops: 'MacBook Air 13" M2',
  tablets: 'iPad Pro 11" M2',
  watches: "Apple Watch Series 9 45mm",
  audio: "AirPods Pro 2",
  accessories: "35W Dual USB-C Power Adapter",
};
