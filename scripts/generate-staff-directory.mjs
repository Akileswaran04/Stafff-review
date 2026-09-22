// Regenerates src/lib/staff-directory.data.ts and staff-login-codes.local.txt.
//
// Run with:  node --env-file=.env.local scripts/generate-staff-directory.mjs
//
// Each staff member gets a random login code (never stored anywhere) plus a per-record salt and
// a scrypt hash of that code keyed with PORTAL_LOGIN_PEPPER. Only the salt+hash go into the
// committed .data.ts file; the plaintext codes go only into the gitignored .local.txt handout —
// this is the same shape as password storage, applied to the staff ID itself.
//
// The hashing here MUST match src/lib/staff-directory.ts's `deriveHash` exactly, or logins break.
import { createHmac, randomBytes, randomInt, scryptSync } from "node:crypto";
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const PEPPER = process.env.PORTAL_LOGIN_PEPPER;
if (!PEPPER) {
  console.error("PORTAL_LOGIN_PEPPER is not set. Run with: node --env-file=.env.local scripts/generate-staff-directory.mjs");
  process.exit(1);
}

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const DEPT = "Information Science & Technology";
const DAY = 86_400_000;
const TEACHERS_DAY_2026 = Date.parse("2026-09-05T09:00:00.000Z");

// code alphabet excludes visually ambiguous characters (I, L, O, 0, 1)
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
function randomSuffix(len) {
  let suffix = "";
  for (let i = 0; i < len; i++) suffix += ALPHABET[randomInt(0, ALPHABET.length)];
  return suffix;
}
const randomCode = () => `DIST-${randomSuffix(8)}`; // the secret credential — hashed, never stored

// the public/display id (routing key + the "ID" chip shown post-login) — NOT a secret, just needs
// to be unique, so a short random combination is enough
const usedIds = new Set();
function randomDisplayId() {
  let id;
  do id = `DIST-${randomSuffix(4)}`; while (usedIds.has(id));
  usedIds.add(id);
  return id;
}

// keep in sync with src/lib/staff-directory.ts
function deriveHash(code, saltHex) {
  const keyed = createHmac("sha256", PEPPER).update(code).digest();
  return scryptSync(keyed, Buffer.from(saltHex, "hex"), 64).toString("hex");
}

// [studentAlias, ratingOutOf5, comment, tags, minutesAfterFirstReview]
// No ratings were given with these Teachers' Day messages — every one is a positive tribute, so
// each is recorded as 5/5. Comments are transcribed verbatim (typos and emoji kept) from what was
// submitted; tags come from each message's own "one word" answer.
const STAFF_INPUT = [
  { name: "Dr. P. Yogesh", reviews: [
    ["Anonymous student", "Your lectures and interactions between those lectures make us knowledgeable in both technical and non-technical aspects of life.", ["supportive"], 0],
  ]},
  { name: "Dr. S. Sridhar", reviews: [
    ["Anonymous student", "Your two hours of lectures will always give us a feel of sitting in an IIT lecture hall. We enjoy those unexpected scolding moments in the class.", ["goat"], 0],
  ]},
  { name: "Dr. M. Vijayalakshmi", reviews: [
    ["Sanmitha", "Her FYP reviews and tremendous questions 😂 - I would never forget!", ["thug"], 0],
  ]},
  { name: "Dr. P. Varalakshmi", reviews: [
    ["Anonymous student", "I was absent for asses1, I was approaching in fear Abt how to convey this & to ask reg reasses...But casually she said to write tmrw itself and she gave only 2 questions to me, Also she is very kind and patient in every answer.", ["kindful"], 0],
    ["Anonymous student", "You made me to gain a lot of technical knowledge in this campus. I love those moments you talk with us like your one of the family member.", ["caring"], 5],
  ]},
  { name: "Dr. T. Mala", reviews: [
    ["Anonymous student", "Mam is honestly one of the calmest teachers we have, never rushes through anything and always explains till everyone gets it. Super caring too, like she actually checks on us and not just about studies. And ngl she's really generous with marks lol, never strict over small mistakes. Classes with her are just chill and stress-free, love that for us 😄", ["friendly"], 0],
    ["Anonymous student", "She teaches DS very clearly, even though the subject can be challenging. She explains every concept and makes sure all students understand. She is very caring and approachable, clears our doubts patiently, and motivates us to stay focused.", ["kindful", "inspiring"], 5],
  ]},
  { name: "Dr. S. Sendhil Kumar", reviews: [
    ["Anonymous student", "Thanks for making us know and use our potential more", ["thoughtful"], 0],
    ["Anonymous student", "thanks for guding us with your endless knowledge and helping us to seek the true potential sir", ["inspiring"], 5],
  ]},
  { name: "Dr. Abirami Murugappan", reviews: [
    ["Anonymous student", "Making me to become a structured, detailed and faster notes taker with your rapid detailed lectures.", ["caring"], 0],
    ["Anonymous student", "Making us to realise that we need to study more and improve more than just academics", ["caring"], 5],
  ]},
  { name: "Dr. K. Kulothungan", reviews: [
    ["Anonymous student", "In my view, a teacher is not just someone who teaches the syllabus, but someone from whom students genuinely learn.", ["up-to-date"], 0],
    ["Anonymous student", "Beyond learning for semester exams, you made us to learn a lot in IoT and Crypto by encouraging us to practically gain knowledge on it.", ["visionary"], 5],
  ]},
  { name: "Dr. N. Thangaraj", reviews: [
    ["Anonymous student", "A teacher who not only teaches syllabus but also a person who cares his students as friends", ["friendly"], 0],
    ["Anonymous student", "On my personal opinion, sir is one of the teachers who takes clases in entertaining way not just boring theory", ["student-friendly"], 5],
  ]},
  { name: "Dr. K. Indra Gandhi", reviews: [
    ["Anonymous student", "Tankyou for your ability to teach with patients and sharing your endless knowledge with us", ["inspiring"], 0],
  ]},
  { name: "Dr. E. Uma", reviews: [
    ["Anonymous student", "I would like to express my sincere gratitude for your dedication and clarity in teaching. Your well-structured lectures and willingness to address student queries have made a meaningful difference in my learning experience. Thank you for your guidance and support.", ["inspiring"], 0],
  ]},
  { name: "Dr. S. Bama", reviews: [
    ["Anonymous student", "Her Teaching style is great", ["inspiring"], 0],
    ["Anonymous student", "Goated staff in goated college", ["inspiring"], 5],
  ]},
  { name: "Dr. P. Geetha", reviews: [
    ["Anonymous student", "We always love your calm and composed classes and interactions with us when we feel bored or tired during the class.", ["caring"], 0],
  ]},
  { name: "Dr. K. Vidya", reviews: [
    ["Anonymous student", "Ma'am's classes are always calm and well-paced, and she explains concepts clearly without ever rushing. She's genuinely caring toward students and easy to approach with doubts or concerns. When it comes to marks, she's fair and generous, never harsh on small mistakes. One of the most comfortable and supportive teachers to learn under.", ["caring"], 0],
  ]},
  { name: "Dr. Selvi Ravindran", reviews: [
    ["Anonymous student", "A lot. We've spoken about various random stuffs starting from cricket matches till crunching life moments. When others are finding difficult to restrict students from cheating in lab exams, Mam would focus on question standards 😂. I really admire Mam's perspective in many things, she would make you understand things without making you feel awkward about it even if you had committed a mistake. Still cherishing the period when you served as ISTA treasurer, mam!", ["student-friendly", "inspiring", "ista treasure"], 0],
  ]},
  { name: "Dr. G. Geetha", reviews: [
    ["Anonymous student", "A student friendly staff member, who not just teaches lesson but also give life lesson and motivation when needed the most", ["inspiring"], 0],
  ]},
  { name: "Dr. K. Manimala", reviews: [
    ["Anonymous student", "“Students are my energy” — these are words I'll carry with me for the rest of my life. Not every teacher says it, and not every teacher makes their students feel it. But hearing those words from you made them truly special.", ["friendly"], 0],
    ["Anonymous student", "Always brings positive energy into class and makes us smile atleast once in a class", ["vibrant"], 5],
    ["Anonymous student", "A very chill faculty who helps us learn new things in a relaxed and comfortable environment.", ["inspiring", "patient"], 10],
    ["Anonymous student", "I just can't express in words how much I appreciate your love for your students and the efforts you put into uplifting their lives. They are truly beyond words. The life lessons you share, the entrepreneurship journeys you make us listen to, and everything else you do for us are just amazing. Thank you for choosing to be a part of our campus and, more importantly, for being such a wonderful teacher.", ["empowering"], 15],
  ]},
  { name: "Dr. D. Sangeetha", reviews: [
    ["Anonymous student", "You really have been a great advisor mam. Even though, as a teacher, you don't have to spend your teaching time giving life advice, you still shared so much with us in class. Those little pieces of advice have genuinely made a huge difference in my life. Thank you so much for everything mam", ["inspirational"], 0],
  ]},
  { name: "Dr. K. Arul Deepa", reviews: [
    ["Anonymous student", "Java class activity was so nice and interesting. Thank you for that and pls continue conducting activities ma'am", ["joyful"], 0],
    ["Anonymous student", "One of my favourite moments was when you made Java concepts into fun activities instead of just theory! Acting, drawing, and explaining the concept while earning points made the whole class enjoy learning. Somehow, we were studying without feeling like we were studying! That was one of the most memorable and enjoyable classes. Thank you, Ma'am!", ["friendly speech"], 5],
  ]},
  { name: "Dr. M. Deivamani", reviews: [
    ["Anonymous student", "More than a teacher, thanks for also being a mentor", ["perfectionist"], 0],
    ["Anonymous student", "The entire FYP period before placement felt like a big mountain in our heads. But you understood us, Sir, and helped us handle one pressure at a time. Thank you so much, for your understanding, guidance, and support throughout our journey. Truly grateful!", ["inspiring", "perfection"], 5],
  ]},
  { name: "D. Narashiman", reviews: [
    ["Anonymous student", "Thank you for being a teacher who never judges students based on their marks. You genuinely want us to understand what we learn, gain real knowledge, and grow as individuals. You don't just want us to get good grades and leave; you want us to carry the lessons we learn into our lives and become better people. Your patience, understanding, and willingness to help every student learn truly make you a great teacher. Thank you for always encouraging us to learn beyond the textbooks and become better versions of ourselves.", ["nurturing"], 0],
  ]},
  { name: "N. Anbarasi", reviews: [
    ["Anonymous student", "Thankyou for being a teachers who understand students needs and make grateful and helpful things to the students", ["student-friendly"], 0],
  ]},
];

// --demo: generate just one staff member with one review, for a small/public demo deployment,
// without touching the full real roster above (which stays intact for the real rollout later).
const DEMO = process.argv.includes("--demo");
const SOURCE = DEMO ? [{ ...STAFF_INPUT[0], reviews: [STAFF_INPUT[0].reviews[0]] }] : STAFF_INPUT;

const staffLines = [];
const codeLines = ["Name\tLogin code", "--------------------------------------------"];
const dataParts = [];
const reviewParts = [];

SOURCE.forEach(({ name, reviews }) => {
  const id = randomDisplayId();
  const code = randomCode();
  const salt = randomBytes(16).toString("hex");
  const hash = deriveHash(code, salt);

  codeLines.push(`${name}\t${code}`);
  dataParts.push(
    `  { id: ${JSON.stringify(id)}, name: ${JSON.stringify(name)}, dept: ${JSON.stringify(DEPT)}, avatar_url: null, salt: ${JSON.stringify(salt)}, hash: ${JSON.stringify(hash)} },`,
  );

  const rows = reviews
    .map(([alias, comment, tags, minutesOffset]) => {
      const created = new Date(TEACHERS_DAY_2026 + minutesOffset * 60_000).toISOString();
      return `    { student_alias: ${JSON.stringify(alias)}, rating: 5, comment: ${JSON.stringify(comment)}, tags: ${JSON.stringify(tags)}, created_at: ${JSON.stringify(created)} },`;
    })
    .join("\n");
  reviewParts.push(`  ${JSON.stringify(id)}: [\n${rows}\n  ],`);
  staffLines.push({ id, name });
});

const dataFile = `// GENERATED by scripts/generate-staff-directory.mjs — do not hand-edit.
// Regenerate with: node --env-file=.env.local scripts/generate-staff-directory.mjs
//
// No plaintext login code is stored here, only a per-record salt and a peppered scrypt hash of
// it (see src/lib/staff-directory.ts). Reviews are the ones actually submitted for Teachers' Day;
// see that script's source for notes on the (few) editorial choices made converting them.

export interface StaffCredential {
  id: string;
  name: string;
  dept: string;
  avatar_url: string | null;
  salt: string;
  hash: string;
}

export interface ReviewSeed {
  student_alias: string;
  rating: number;
  comment: string;
  tags: string[];
  created_at: string;
}

export const STAFF: StaffCredential[] = [
${dataParts.join("\n")}
];

export const REVIEWS: Record<string, ReviewSeed[]> = {
${reviewParts.join("\n")}
};
`;

writeFileSync(path.join(root, "src/lib/staff-directory.data.ts"), dataFile);
writeFileSync(path.join(root, "staff-login-codes.local.txt"), codeLines.join("\n") + "\n");

console.log(`Wrote src/lib/staff-directory.data.ts (${DEMO ? "DEMO — " : ""}${staffLines.length} staff, ${SOURCE.reduce((n, s) => n + s.reviews.length, 0)} reviews)`);
console.log("Wrote staff-login-codes.local.txt (gitignored — hand these out, then delete or keep it somewhere private)");
