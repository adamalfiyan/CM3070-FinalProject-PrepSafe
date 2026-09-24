// Local SQLite-backed storage for the offline Resource Hub, seeded on first launch.

import * as SQLite from 'expo-sqlite';

const DB_NAME = 'prepsafe_resources.db';

const SEED_CONTENT = [
  {
    category: 'first_aid',
    title: 'Treating minor burns',
    body: 'Cool the burn under running water for 20 minutes. Do not use ice, butter, or ointments. Cover loosely with a clean, non-fluffy cloth. Seek medical help if the burn is larger than your palm or on the face, hands, or joints.',
  },
  {
    category: 'first_aid',
    title: 'CPR basics (adult)',
    body: 'Call for emergency help first. Push hard and fast in the centre of the chest, about 5-6cm deep, at a rate of 100-120 compressions per minute. Continue until help arrives or the person starts breathing.',
  },
  {
    category: 'first_aid',
    title: 'Controlling severe bleeding',
    body: 'Apply firm, direct pressure to the wound with a clean cloth. Do not remove the cloth if it becomes soaked, add more on top. Keep the injured area raised above heart level if possible.',
  },
  {
    category: 'first_aid',
    title: 'Choking (adult)',
    body: 'Ask "Are you choking?" If they cannot speak, cough, or breathe, give up to 5 sharp back blows between the shoulder blades with the heel of your hand. If that doesn\u2019t work, give up to 5 abdominal thrusts (Heimlich manoeuvre). Alternate between the two and call for help if it continues.',
  },
  {
    category: 'first_aid',
    title: 'Treating a sprain or fracture',
    body: 'Do not try to realign the limb. Immobilise the area with a splint or sling in the position you find it. Apply a cold pack wrapped in cloth to reduce swelling. Get medical attention as soon as possible, especially if the area looks deformed or the person cannot bear weight.',
  },
  {
    category: 'first_aid',
    title: 'Recognising heatstroke',
    body: 'Warning signs include a high body temperature, confusion, rapid pulse, and hot dry skin (or profuse sweating). Move the person to a cool place, remove excess clothing, and cool them with water or damp cloths. Heatstroke is a medical emergency, call for help immediately.',
  },
  {
    category: 'first_aid',
    title: 'Basic first aid kit checklist',
    body: 'Adhesive bandages in various sizes, sterile gauze pads, adhesive tape, antiseptic wipes, tweezers, scissors, disposable gloves, a thermometer, pain relief medication, and any personal medication your household needs. Check and restock every 6 months.',
  },
  {
    category: 'evacuation',
    title: 'Evacuation checklist',
    body: 'Grab your emergency kit and important documents. Turn off gas and electricity if instructed. Follow official evacuation routes, not your usual route, as roads may be blocked. Move to your agreed household meeting point.',
  },
  {
    category: 'evacuation',
    title: 'What to do if roads are flooded',
    body: 'Never drive through flood water, even if it looks shallow, as it can hide dangerous currents and stall your engine. Turn around and find an alternate route, or move to higher ground on foot.',
  },
  {
    category: 'evacuation',
    title: 'Building an emergency go-bag',
    body: 'Pack a bag in advance with a 3-day supply of water and non-perishable food, a torch and spare batteries, a phone charger and power bank, copies of ID and insurance documents, cash, basic first aid supplies, and any daily medication. Keep it somewhere you can grab quickly.',
  },
  {
    category: 'evacuation',
    title: 'Choosing a household meeting point',
    body: 'Agree on two meeting points with your household in advance: one nearby (e.g. a neighbour\u2019s house) for a sudden local incident, and one further away in case your neighbourhood itself is inaccessible. Make sure every family member, including children, knows both locations.',
  },
  {
    category: 'evacuation',
    title: 'Evacuating with pets',
    body: 'Keep a pet carrier, leash, food, and any medication ready in advance, since many emergency shelters do not accept animals without one. Have a backup plan (a friend, relative, or pet-friendly shelter) identified before you need it.',
  },
  {
    category: 'evacuation',
    title: 'If you are told to shelter in place instead',
    body: 'Not every emergency requires evacuation, sometimes staying put is safer. Close and lock all windows and doors, turn off ventilation systems if instructed, and move to an interior room away from windows. Keep a battery or hand-crank radio on for official updates.',
  },
  {
    category: 'contacts',
    title: 'Emergency services',
    body: 'Police, Fire, Ambulance: 999 (Singapore/Malaysia general emergency line). Save this in your phone now, before an emergency happens.',
  },
  {
    category: 'contacts',
    title: 'Non-emergency support',
    body: 'For non-life-threatening issues, contact your local civil defence or community emergency response team. Check your household profile in the app for the nearest hospital based on your postcode.',
  },
  {
    category: 'contacts',
    title: 'Poison control',
    body: 'If someone has been poisoned or had a severe allergic reaction, call emergency services immediately and, if possible, keep the packaging or substance involved to show responders. Do not induce vomiting unless a medical professional tells you to.',
  },
  {
    category: 'contacts',
    title: 'Utility companies (gas, water, electricity)',
    body: 'Save the emergency fault-reporting number for your gas, water, and electricity providers. If you smell gas or suspect a leak, leave the area immediately, do not switch anything electrical on or off, and call your gas provider\u2019s emergency line from outside.',
  },
  {
    category: 'contacts',
    title: 'Keeping a household contact card',
    body: 'Write down and keep printed (not just digital) copies of key numbers: each family member\u2019s phone, an out-of-area emergency contact, your family doctor, your insurance provider, and your workplace or school\u2019s main line. Phones can run out of battery, paper doesn\u2019t.',
  },
];

let dbPromise = null;

function getDb() {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync(DB_NAME);
  }
  return dbPromise;
}

// initResourceDb: creates the table and re-seeds it whenever the row count not match SEED_CONTENT.length.
export async function initResourceDb() {
  const db = await getDb();
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS resources (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category TEXT NOT NULL,
      title TEXT NOT NULL,
      body TEXT NOT NULL
    );
  `);

  const row = await db.getFirstAsync('SELECT COUNT(*) as count FROM resources');
  if (!row || row.count !== SEED_CONTENT.length) {
    await db.execAsync('DELETE FROM resources');
    for (const item of SEED_CONTENT) {
      await db.runAsync(
        'INSERT INTO resources (category, title, body) VALUES (?, ?, ?)',
        [item.category, item.title, item.body]
      );
    }
  }
}

// getResourcesByCategory: fetches all seeded resource rows for a category.
export async function getResourcesByCategory(category) {
  const db = await getDb();
  return db.getAllAsync('SELECT * FROM resources WHERE category = ? ORDER BY id', [category]);
}
