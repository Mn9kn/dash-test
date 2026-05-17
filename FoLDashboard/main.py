import json
from collections import defaultdict

# =============================================
# عدّل هذا المسار ليشير لملف data.json عندك
INPUT_FILE = "Data.json"

# الملفات الناتجة تنحفظ في نفس الفولدر
OUTPUT_SUMMARY     = "summary.json"
OUTPUT_DISTRICTS   = "districts.json"
OUTPUT_RESTAURANTS = "restaurants.json"
# =============================================

print("جاري قراءة الملف... (قد يأخذ دقيقة بسبب الحجم)")
with open(INPUT_FILE, encoding="utf-8") as f:
    data = json.load(f)

print(f"عدد السجلات الكلي: {len(data):,}")

# ── تجميع البيانات حسب الحي ──────────────────
districts_map = defaultdict(lambda: {
    "restaurants": defaultdict(set),   # اسم المطعم → مجموعة الـ items
    "items": [],
})

for row in data:
    district = row.get("District", "Unknown")
    restaurant = row.get("Restaurant_Name", "Unknown")
    districts_map[district]["restaurants"][restaurant].add(row.get("Item_Name", ""))
    districts_map[district]["items"].append(row)

# ─────────────────────────────────────────────
# ملف 1: summary.json  (المؤشرات الكاملة)
# ─────────────────────────────────────────────
print("جاري بناء summary.json ...")

summary = {}
total_items   = 0
total_healthy = 0

for district, info in districts_map.items():
    items = info["items"]
    total = len(items)
    healthy   = sum(1 for i in items if i.get("is_Healthy") == "Healthy")
    unhealthy = total - healthy

    # نسب أنواع الطعام
    food_cats = defaultdict(int)
    for i in items:
        food_cats[i.get("Food_Category", "Other")] += 1

    food_cat_pct = {
        cat: round(count / total * 100, 1)
        for cat, count in food_cats.items()
    }

    restaurant_count = len(info["restaurants"])

    summary[district] = {
        "total_items":       total,
        "healthy_count":     healthy,
        "unhealthy_count":   unhealthy,
        "healthy_pct":       round(healthy   / total * 100, 1) if total else 0,
        "unhealthy_pct":     round(unhealthy / total * 100, 1) if total else 0,
        "restaurant_count":  restaurant_count,
        "food_categories":   food_cat_pct,
    }

    total_items   += total
    total_healthy += healthy

# مؤشرات عامة
global_stats = {
    "total_items":        total_items,
    "total_healthy":      total_healthy,
    "total_unhealthy":    total_items - total_healthy,
    "healthy_pct_global": round(total_healthy / total_items * 100, 1) if total_items else 0,
    "total_districts":    len(districts_map),
    "total_restaurants":  len({r for info in districts_map.values() for r in info["restaurants"]}),
}

with open(OUTPUT_SUMMARY, "w", encoding="utf-8") as f:
    json.dump({"global": global_stats, "districts": summary}, f, ensure_ascii=False)

print(f"  ✓ summary.json جاهز — {len(summary)} حي")

# ─────────────────────────────────────────────
# ملف 2: districts.json  (قائمة الأحياء + مطاعمها)
# ─────────────────────────────────────────────
print("جاري بناء districts.json ...")

districts_out = {}
for district, info in districts_map.items():
    restaurants_list = [
        {"name": name, "item_count": len(items)}
        for name, items in info["restaurants"].items()
    ]
    districts_out[district] = {
        "restaurants": restaurants_list
    }

with open(OUTPUT_DISTRICTS, "w", encoding="utf-8") as f:
    json.dump(districts_out, f, ensure_ascii=False)

print(f"  ✓ districts.json جاهز")

# ─────────────────────────────────────────────
# ملف 3: restaurants.json  (كل المطاعم مع items)
# ─────────────────────────────────────────────
print("جاري بناء restaurants.json ...")

restaurants_out = defaultdict(list)
for row in data:
    district = row.get("District", "Unknown")
    restaurants_out[district].append({
        "restaurant":     row.get("Restaurant_Name"),
        "item_name":      row.get("Item_Name"),
        "price":          row.get("Price"),
        "calories":       row.get("Calorie"),
        "description":    row.get("Description"),
        "food_category":  row.get("Food_Category"),
        "portion":        row.get("Portion_Category"),
        "is_healthy":     row.get("is_Healthy"),
    })

with open(OUTPUT_RESTAURANTS, "w", encoding="utf-8") as f:
    json.dump(dict(restaurants_out), f, ensure_ascii=False)

print(f"  ✓ restaurants.json جاهز")
print("\n✅ انتهى! الملفات الثلاثة جاهزة بجانب السكريبت.")