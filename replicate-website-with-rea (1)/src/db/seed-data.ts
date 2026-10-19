type Seed = {
  name: string;
  brand: string;
  category: string;
  kind: string;
  price: number;
  compare?: number;
  storage?: string;
  colorName: string;
  color: string;
  grade?: string;
  battery?: number;
  rating?: number;
  reviews?: number;
  badge?: string;
  featured?: boolean;
  stock?: number;
};

const d = (s: Seed) => s;

export const SEED: Seed[] = [
  // iPhones
  d({ name: "iPhone 15 Pro Max", brand: "Apple", category: "iphones", kind: "phone", price: 3899, compare: 5099, storage: "256GB", colorName: "Natural Titanium", color: "#bdb5a8", battery: 92, rating: 4.9, reviews: 312, badge: "Best seller", featured: true }),
  d({ name: "iPhone 15", brand: "Apple", category: "iphones", kind: "phone", price: 2399, compare: 3299, storage: "128GB", colorName: "Blue", color: "#a9c4dd", battery: 90, rating: 4.8, reviews: 204, featured: true }),
  d({ name: "iPhone 14 Pro", brand: "Apple", category: "iphones", kind: "phone", price: 2499, compare: 3699, storage: "128GB", colorName: "Deep Purple", color: "#5b4b6e", battery: 89, rating: 4.8, reviews: 187, featured: true }),
  d({ name: "iPhone 13", brand: "Apple", category: "iphones", kind: "phone", price: 1599, compare: 2599, storage: "128GB", colorName: "Midnight", color: "#1f2430", battery: 88, rating: 4.7, reviews: 421, badge: "Popular", featured: true }),
  d({ name: "iPhone 12 Pro Max", brand: "Apple", category: "iphones", kind: "phone", price: 1799, compare: 2999, storage: "128GB", colorName: "Pacific Blue", color: "#2f4a5e", battery: 87, rating: 4.7, reviews: 266 }),
  d({ name: "iPhone 12", brand: "Apple", category: "iphones", kind: "phone", price: 1099, compare: 1899, storage: "64GB", colorName: "Green", color: "#b7d3c3", battery: 86, rating: 4.6, reviews: 330 }),
  d({ name: "iPhone 11", brand: "Apple", category: "iphones", kind: "phone", price: 799, compare: 1399, storage: "64GB", colorName: "Black", color: "#2b2b2e", battery: 85, grade: "Good", rating: 4.5, reviews: 512, badge: "Great value" }),
  // Samsung
  d({ name: "Galaxy S24 Ultra", brand: "Samsung", category: "samsung", kind: "phone", price: 3499, compare: 4999, storage: "256GB", colorName: "Titanium Gray", color: "#8e9096", battery: 93, rating: 4.9, reviews: 143, badge: "Flagship", featured: true }),
  d({ name: "Galaxy S23 Ultra", brand: "Samsung", category: "samsung", kind: "phone", price: 2699, compare: 4199, storage: "256GB", colorName: "Phantom Black", color: "#222428", battery: 90, rating: 4.8, reviews: 176, featured: true }),
  d({ name: "Galaxy S23 FE", brand: "Samsung", category: "samsung", kind: "phone", price: 1399, compare: 2099, storage: "128GB", colorName: "Mint", color: "#bfe3d0", battery: 91, rating: 4.6, reviews: 88 }),
  d({ name: "Galaxy Z Flip5", brand: "Samsung", category: "samsung", kind: "phone", price: 2199, compare: 3999, storage: "256GB", colorName: "Lavender", color: "#c9b8e6", battery: 89, rating: 4.6, reviews: 61, badge: "Foldable" }),
  d({ name: "Galaxy A54 5G", brand: "Samsung", category: "samsung", kind: "phone", price: 849, compare: 1399, storage: "128GB", colorName: "Awesome Lime", color: "#d7e58a", battery: 88, grade: "Good", rating: 4.5, reviews: 129 }),
  // Laptops
  d({ name: 'MacBook Air 13" M2', brand: "Apple", category: "laptops", kind: "laptop", price: 3399, compare: 4599, storage: "256GB · 8GB RAM", colorName: "Midnight", color: "#2a3140", battery: 94, rating: 4.9, reviews: 98, badge: "Best seller", featured: true }),
  d({ name: 'MacBook Pro 14" M1 Pro', brand: "Apple", category: "laptops", kind: "laptop", price: 5299, compare: 7499, storage: "512GB · 16GB RAM", colorName: "Space Gray", color: "#7d7f85", battery: 91, rating: 4.9, reviews: 54, featured: true }),
  d({ name: 'MacBook Air 13" M1', brand: "Apple", category: "laptops", kind: "laptop", price: 2399, compare: 3499, storage: "256GB · 8GB RAM", colorName: "Silver", color: "#d6d8db", battery: 90, rating: 4.8, reviews: 211, featured: true }),
  d({ name: "Dell XPS 13 9310", brand: "Dell", category: "laptops", kind: "laptop", price: 2199, compare: 4299, storage: "512GB · 16GB RAM", colorName: "Platinum", color: "#c8ccd1", battery: 85, rating: 4.6, reviews: 37 }),
  d({ name: "ThinkPad X1 Carbon Gen 9", brand: "Lenovo", category: "laptops", kind: "laptop", price: 2599, compare: 5199, storage: "512GB · 16GB RAM", colorName: "Black", color: "#24262a", battery: 86, rating: 4.7, reviews: 29 }),
  d({ name: "HP EliteBook 840 G8", brand: "HP", category: "laptops", kind: "laptop", price: 1899, compare: 3899, storage: "256GB · 16GB RAM", colorName: "Silver", color: "#b9bec4", battery: 85, grade: "Good", rating: 4.5, reviews: 22 }),
  d({ name: "Acer Swift 3", brand: "Acer", category: "laptops", kind: "laptop", price: 1299, compare: 2499, storage: "512GB · 8GB RAM", colorName: "Silver", color: "#cfd3d8", battery: 85, grade: "Good", rating: 4.4, reviews: 41 }),
  // Tablets
  d({ name: "iPad Pro 11\" M2", brand: "Apple", category: "tablets", kind: "tablet", price: 2999, compare: 4299, storage: "128GB", colorName: "Space Gray", color: "#6e7076", battery: 92, rating: 4.9, reviews: 74, featured: true }),
  d({ name: "iPad Air 5th Gen", brand: "Apple", category: "tablets", kind: "tablet", price: 1999, compare: 2799, storage: "64GB", colorName: "Blue", color: "#9db7d1", battery: 91, rating: 4.8, reviews: 83 }),
  d({ name: "iPad 9th Gen", brand: "Apple", category: "tablets", kind: "tablet", price: 949, compare: 1499, storage: "64GB", colorName: "Silver", color: "#d5d7da", battery: 88, rating: 4.7, reviews: 192, badge: "Great value" }),
  d({ name: "Galaxy Tab S8", brand: "Samsung", category: "tablets", kind: "tablet", price: 1599, compare: 2999, storage: "128GB", colorName: "Graphite", color: "#4a4c52", battery: 89, rating: 4.6, reviews: 47 }),
  // Watches
  d({ name: "Apple Watch Series 9 45mm", brand: "Apple", category: "watches", kind: "watch", price: 1499, compare: 1999, storage: "GPS", colorName: "Midnight", color: "#1f2430", battery: 95, rating: 4.8, reviews: 66, featured: true }),
  d({ name: "Apple Watch Series 8 41mm", brand: "Apple", category: "watches", kind: "watch", price: 1099, compare: 1699, storage: "GPS", colorName: "Starlight", color: "#e6dccb", battery: 91, rating: 4.7, reviews: 102 }),
  d({ name: "Apple Watch SE 2", brand: "Apple", category: "watches", kind: "watch", price: 799, compare: 1199, storage: "GPS", colorName: "Silver", color: "#d9dadd", battery: 92, rating: 4.7, reviews: 77 }),
  d({ name: "Galaxy Watch 6 44mm", brand: "Samsung", category: "watches", kind: "watch", price: 899, compare: 1599, storage: "Bluetooth", colorName: "Graphite", color: "#3a3c42", battery: 90, rating: 4.6, reviews: 39 }),
  // Audio
  d({ name: "AirPods Pro 2", brand: "Apple", category: "audio", kind: "earbuds", price: 749, compare: 1099, colorName: "White", color: "#f1f2f4", battery: 92, rating: 4.8, reviews: 288, badge: "Best seller", featured: true }),
  d({ name: "AirPods 3rd Gen", brand: "Apple", category: "audio", kind: "earbuds", price: 499, compare: 749, colorName: "White", color: "#f1f2f4", battery: 90, rating: 4.7, reviews: 164 }),
  d({ name: "Sony WH-1000XM4", brand: "Sony", category: "audio", kind: "headphones", price: 799, compare: 1399, colorName: "Black", color: "#202124", battery: 88, rating: 4.8, reviews: 93, featured: true }),
  d({ name: "JBL Flip 6", brand: "JBL", category: "audio", kind: "speaker", price: 349, compare: 599, colorName: "Teal", color: "#1c9a98", battery: 90, rating: 4.7, reviews: 58 }),
  // Accessories (new)
  d({ name: "35W Dual USB-C Power Adapter", brand: "Loopt", category: "accessories", kind: "charger", price: 149, colorName: "White", color: "#f4f5f6", grade: "New", rating: 4.7, reviews: 85 }),
  d({ name: "240W USB-C Charge Cable 2m", brand: "Loopt", category: "accessories", kind: "cable", price: 79, colorName: "Black", color: "#1f2124", grade: "New", rating: 4.6, reviews: 120 }),
  d({ name: "Shockproof Clear Case", brand: "Loopt", category: "accessories", kind: "case", price: 59, colorName: "Clear", color: "#dfe7ea", grade: "New", rating: 4.5, reviews: 214 }),
];

export const REVIEW_SEED = [
  { author: "محمد ولد أحمد", rating: 5, body: "وصلني الجهاز في اليوم التالي وكأنه جديد تماماً. صحة البطارية أعلى مما هو مذكور." },
  { author: "مريم منت سيدي", rating: 5, body: "كنت متردداً في شراء جهاز مجدد، لكن تقرير الحالة كان دقيقاً جداً. سعيدة بالتجربة." },
  { author: "سيدي محمد", rating: 4, body: "سعر ممتاز وتغليف رائع. خدمة الواتساب سريعة ومحترمة." },
  { author: "فاطمة منت أحمدو", rating: 5, body: "ساعدني فريق الدعم في اختيار الموديل المناسب. سأشتري منهم مرة أخرى." },
  { author: "عبد الله ولد الشيخ", rating: 5, body: "لا توجد أي خدوش والجهاز يعمل بكفاءة. وفّرت مبلغاً كبيراً مقارنة بالجديد." },
];

export function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
