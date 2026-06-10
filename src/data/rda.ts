import type { NutrientInfo, UserProfile, MacroTargets } from '../types';

// Base RDA values (used as fallback when no profile is set)
export const nutrients: NutrientInfo[] = [
  { key: 'calories', label: 'Calories', unit: 'kcal', rda: 2000, category: 'macro' },
  { key: 'protein', label: 'Protein', unit: 'g', rda: 50, category: 'macro' },
  { key: 'carbs', label: 'Carbs', unit: 'g', rda: 275, category: 'macro' },
  { key: 'fat', label: 'Fat', unit: 'g', rda: 78, category: 'macro' },
  { key: 'fiber', label: 'Fiber', unit: 'g', rda: 28, category: 'macro' },
  { key: 'vitaminA', label: 'Vitamin A', unit: 'mcg', rda: 800, category: 'vitamin' },
  { key: 'vitaminC', label: 'Vitamin C', unit: 'mg', rda: 82, category: 'vitamin' },
  { key: 'vitaminD', label: 'Vitamin D', unit: 'mcg', rda: 15, category: 'vitamin' },
  { key: 'vitaminE', label: 'Vitamin E', unit: 'mg', rda: 15, category: 'vitamin' },
  { key: 'vitaminK', label: 'Vitamin K', unit: 'mcg', rda: 108, category: 'vitamin' },
  { key: 'vitaminB6', label: 'Vitamin B6', unit: 'mg', rda: 1.3, category: 'vitamin' },
  { key: 'vitaminB12', label: 'Vitamin B12', unit: 'mcg', rda: 2.4, category: 'vitamin' },
  { key: 'thiamin', label: 'Thiamin (B1)', unit: 'mg', rda: 1.2, category: 'vitamin' },
  { key: 'riboflavin', label: 'Riboflavin (B2)', unit: 'mg', rda: 1.3, category: 'vitamin' },
  { key: 'niacin', label: 'Niacin (B3)', unit: 'mg', rda: 16, category: 'vitamin' },
  { key: 'folate', label: 'Folate', unit: 'mcg', rda: 400, category: 'vitamin' },
  { key: 'choline', label: 'Choline', unit: 'mg', rda: 550, category: 'vitamin' },
  { key: 'calcium', label: 'Calcium', unit: 'mg', rda: 1000, category: 'mineral' },
  { key: 'iron', label: 'Iron', unit: 'mg', rda: 13, category: 'mineral' },
  { key: 'magnesium', label: 'Magnesium', unit: 'mg', rda: 370, category: 'mineral' },
  { key: 'potassium', label: 'Potassium', unit: 'mg', rda: 2800, category: 'mineral' },
  { key: 'sodium', label: 'Sodium', unit: 'mg', rda: 2300, category: 'mineral' },
  { key: 'zinc', label: 'Zinc', unit: 'mg', rda: 9.5, category: 'mineral' },
  { key: 'selenium', label: 'Selenium', unit: 'mcg', rda: 55, category: 'mineral' },
  { key: 'copper', label: 'Copper', unit: 'mg', rda: 0.9, category: 'mineral' },
  { key: 'manganese', label: 'Manganese', unit: 'mg', rda: 2.3, category: 'mineral' },
  { key: 'iodine', label: 'Iodine', unit: 'mcg', rda: 150, category: 'mineral' },
  { key: 'phosphorus', label: 'Phosphorus', unit: 'mg', rda: 700, category: 'mineral' },
];

// NIH/IOM Dietary Reference Intakes by gender and age
// Sources: NIH Office of Dietary Supplements, IOM DRI tables
function getMicroRda(key: string, gender: 'male' | 'female', age: number): number | null {
  const m = gender === 'male';

  switch (key) {
    // Vitamins
    case 'vitaminA': return m ? 900 : 700; // mcg RAE
    case 'vitaminC': return m ? 90 : 75;
    case 'vitaminD': return age >= 71 ? 20 : 15;
    case 'vitaminE': return 15;
    case 'vitaminK': return m ? 120 : 90;
    case 'vitaminB6': return age >= 51 ? (m ? 1.7 : 1.5) : 1.3;
    case 'vitaminB12': return 2.4;
    case 'thiamin': return m ? 1.2 : 1.1;
    case 'riboflavin': return m ? 1.3 : 1.1;
    case 'niacin': return m ? 16 : 14;
    case 'folate': return 400;
    case 'choline': return m ? 550 : 425;

    // Minerals
    case 'calcium': return age >= 51 && !m ? 1200 : age >= 71 ? 1200 : 1000;
    case 'iron': return (!m && age <= 50) ? 18 : 8;
    case 'magnesium': return m ? (age >= 31 ? 420 : 400) : (age >= 31 ? 320 : 310);
    case 'potassium': return m ? 3400 : 2600;
    case 'sodium': return 2300;
    case 'zinc': return m ? 11 : 8;
    case 'selenium': return 55;
    case 'copper': return 0.9;
    case 'manganese': return m ? 2.3 : 1.8;
    case 'iodine': return 150;
    case 'phosphorus': return 700;

    default: return null;
  }
}

// Mifflin-St Jeor equation for BMR (sedentary multiplier 1.2 applied)
function estimateTDEE(profile: UserProfile): number {
  const { gender, age, weightKg, heightCm } = profile;
  let bmr: number;
  if (gender === 'male') {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
  } else {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
  }
  return Math.round(bmr * 1.2);
}

export function getProfileNutrients(profile: UserProfile): NutrientInfo[] {
  return nutrients.map(n => {
    if (n.category === 'macro') return n; // macros handled separately
    const rda = getMicroRda(n.key, profile.gender, profile.age);
    return rda !== null ? { ...n, rda } : n;
  });
}

export function getProfileMacroDefaults(profile: UserProfile): MacroTargets {
  const tdee = estimateTDEE(profile);
  // Protein: 0.8g/kg minimum, use 1.0g/kg as practical target
  const protein = Math.round(profile.weightKg * 1.0);
  // Fiber: male 38g, female 25g (AI values from IOM)
  const fiber = profile.gender === 'male' ? 38 : 25;
  // Fat: 25-35% of calories, use 30%
  const fatCals = tdee * 0.30;
  const fat = Math.round(fatCals / 9);
  // Carbs: remainder
  const carbCals = tdee - (protein * 4) - (fat * 9);
  const carbs = Math.round(carbCals / 4);

  return { calories: tdee, protein, carbs, fat, fiber };
}
