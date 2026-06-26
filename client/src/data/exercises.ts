import type { MuscleGroup } from './splits'

export type MovementPattern =
  | 'press' | 'pull' | 'squat' | 'hinge' | 'curl'
  | 'extension' | 'row' | 'raise' | 'fly' | 'plank'

export interface Exercise {
  id: string
  name: string
  muscleGroup: MuscleGroup
  description: string
  movementPattern: MovementPattern
  equipment: 'barbell' | 'dumbbell' | 'cable' | 'machine' | 'bodyweight'
}

const ex = (
  id: string, name: string, muscleGroup: MuscleGroup,
  description: string, movementPattern: MovementPattern,
  equipment: Exercise['equipment']
): Exercise => ({ id, name, muscleGroup, description, movementPattern, equipment })

export const EXERCISES: Exercise[] = [
  // ── Chest ─────────────────────────────────────────────────────────────────
  ex('chest_bbench',  'Barbell Bench Press',   'chest', 'The king of chest exercises. Lie on a flat bench, lower the bar to your chest and press it back up. Targets the entire pec with heavy loading.', 'press', 'barbell'),
  ex('chest_dbbench', 'Dumbbell Bench Press',  'chest', 'Like the barbell version but with independent arms, increasing the range of motion and fixing imbalances. Great for chest development.', 'press', 'dumbbell'),
  ex('chest_incline', 'Incline Bench Press',   'chest', 'Performed on a 30–45° incline to bias the upper chest. A staple for building the clavicular head of the pec.', 'press', 'barbell'),
  ex('chest_pushup',  'Push-Up',               'chest', 'The foundational bodyweight chest exercise. Trains the pecs, front delts, and triceps. Progress by elevating feet or adding weight.', 'press', 'bodyweight'),
  ex('chest_dips',    'Chest Dips',            'chest', 'Lean forward on the dip bars to shift emphasis onto the chest. One of the best mass builders requiring no equipment beyond a dip station.', 'press', 'bodyweight'),
  ex('chest_dbfly',   'Dumbbell Flyes',        'chest', 'An isolation movement stretching the pecs under load. Keep a slight bend in the elbows and focus on the squeeze at the top.', 'fly', 'dumbbell'),
  ex('chest_cable',   'Cable Crossover',       'chest', 'Cables keep the chest under constant tension throughout the movement. Best performed from a high, mid, or low pulley angle.', 'fly', 'cable'),

  // ── Back ──────────────────────────────────────────────────────────────────
  ex('back_pullup',   'Pull-Up',               'back', 'The ultimate back exercise. Hang from a bar and pull yourself up until your chin clears it. Develops the lats, rhomboids, and biceps.', 'pull', 'bodyweight'),
  ex('back_latpd',    'Lat Pulldown',          'back', 'A machine-based pull-up alternative. Pull the bar down to your upper chest, keeping your torso slightly back. Great for lat width.', 'pull', 'cable'),
  ex('back_brow',     'Barbell Row',           'back', 'Hinge at the hips, keep a neutral spine, and row the bar to your lower chest. One of the best compound back builders for thickness.', 'row', 'barbell'),
  ex('back_dbrow',    'Dumbbell Row',          'back', 'Supported single-arm row. Allows a longer range of motion and great isolation of each side of the back.', 'row', 'dumbbell'),
  ex('back_cable_row','Seated Cable Row',      'back', 'Sit upright and row a cable handle to your midsection. Constant tension throughout; excellent for mid-back development.', 'row', 'cable'),
  ex('back_deadlift', 'Deadlift',              'back', 'The greatest posterior chain exercise. Hinge at the hips and lift the bar from the floor. Trains the entire back, glutes, and hamstrings.', 'hinge', 'barbell'),
  ex('back_facepull', 'Face Pull',             'back', 'A cable exercise pulling a rope attachment to face level. Essential for rear deltoids, external rotation, and shoulder health.', 'row', 'cable'),

  // ── Shoulders ─────────────────────────────────────────────────────────────
  ex('sh_ohp',        'Overhead Press',        'shoulders', 'Press a barbell or dumbbells overhead from shoulder height. The primary shoulder mass builder, also engaging the triceps.', 'press', 'barbell'),
  ex('sh_arnoldpress','Arnold Press',          'shoulders', 'A rotating dumbbell press invented by Arnold Schwarzenegger. Hits all three deltoid heads through the full rotation.', 'press', 'dumbbell'),
  ex('sh_lateraise',  'Lateral Raise',         'shoulders', 'Raise dumbbells out to the sides to shoulder height. The primary isolation exercise for the medial deltoid — key for shoulder width.', 'raise', 'dumbbell'),
  ex('sh_frontraise', 'Front Raise',           'shoulders', 'Raise a weight in front of you to shoulder height. Targets the anterior deltoid. Use a plate, dumbbell, or cable.', 'raise', 'dumbbell'),
  ex('sh_rearraise',  'Rear Delt Fly',         'shoulders', 'Bend over and raise dumbbells out to the sides. Targets the often-neglected posterior deltoid and improves posture.', 'fly', 'dumbbell'),
  ex('sh_uprightrow', 'Upright Row',           'shoulders', 'Pull a barbell or dumbbells up along your torso to chin height. Works the medial deltoid and traps, but requires good shoulder mobility.', 'row', 'barbell'),

  // ── Biceps ────────────────────────────────────────────────────────────────
  ex('bi_bbcurl',     'Barbell Curl',          'biceps', 'The classic bicep curl with a barbell. Allows heavy loading and is the primary mass-builder for the biceps.', 'curl', 'barbell'),
  ex('bi_dbcurl',     'Dumbbell Curl',         'biceps', 'Alternating or simultaneous dumbbell curls. Allows supination (wrist rotation) at the top for a stronger peak contraction.', 'curl', 'dumbbell'),
  ex('bi_hammer',     'Hammer Curl',           'biceps', 'Neutral-grip curl targeting the brachialis and brachioradialis alongside the biceps. Builds arm thickness and forearm strength.', 'curl', 'dumbbell'),
  ex('bi_preacher',   'Preacher Curl',         'biceps', 'Performed on a preacher bench with arms angled forward. Removes cheating from the movement and keeps constant tension on the biceps.', 'curl', 'machine'),
  ex('bi_cable',      'Cable Curl',            'biceps', 'Curl a cable bar or rope from a low pulley. Cables maintain tension at the top of the movement where dumbbells do not.', 'curl', 'cable'),
  ex('bi_incline',    'Incline Dumbbell Curl', 'biceps', 'Seated on an incline bench, the arms hang behind the body, providing a stretched starting position for maximum bicep recruitment.', 'curl', 'dumbbell'),

  // ── Triceps ───────────────────────────────────────────────────────────────
  ex('tri_pushdown',  'Tricep Pushdown',       'triceps', 'The most popular tricep isolation exercise. Push a cable bar or rope downward to full elbow extension, focusing on the lateral head.', 'extension', 'cable'),
  ex('tri_skull',     'Skull Crushers',        'triceps', 'Lower a barbell or dumbbells to your forehead while lying on a bench. Excellent mass builder for the long and lateral heads of the triceps.', 'extension', 'barbell'),
  ex('tri_cgbench',   'Close-Grip Bench',      'triceps', 'A bench press with a narrower grip that shifts emphasis from the pecs to the triceps. Allows very heavy loading.', 'press', 'barbell'),
  ex('tri_ohext',     'Overhead Extension',    'triceps', 'Extend a dumbbell or cable overhead to stretch and load the long head of the triceps — the largest portion of the muscle.', 'extension', 'dumbbell'),
  ex('tri_dips',      'Tricep Dips',           'triceps', 'Upright dips with elbows close to the body. A powerful compound tricep movement also involving the chest and front delts.', 'press', 'bodyweight'),

  // ── Quads ─────────────────────────────────────────────────────────────────
  ex('qu_squat',      'Barbell Back Squat',    'quads', 'The king of lower body exercises. Bar on the traps, squat to depth, drive up. Targets the entire quadriceps, glutes, and core.', 'squat', 'barbell'),
  ex('qu_legpress',   'Leg Press',             'quads', 'A machine-based squat alternative. Allows heavy loading with less lower back stress. Foot position changes muscle emphasis.', 'squat', 'machine'),
  ex('qu_hacksquat',  'Hack Squat',            'quads', 'A machine squat with the back supported. Creates a more upright torso for maximum quad isolation and safer loading.', 'squat', 'machine'),
  ex('qu_bsquat',     'Bulgarian Split Squat', 'quads', 'Rear foot elevated, single-leg squat. Brutal quad and glute exercise that also reveals and corrects side-to-side imbalances.', 'squat', 'dumbbell'),
  ex('qu_legext',     'Leg Extension',         'quads', 'Isolation machine that trains the quads through knee extension. Excellent for adding finishing volume and targeting the VMO.', 'extension', 'machine'),
  ex('qu_lunges',     'Lunges',                'quads', 'Step forward or backward into a lunge position. Targets quads and glutes; the unilateral nature also challenges balance.', 'squat', 'dumbbell'),

  // ── Hamstrings ────────────────────────────────────────────────────────────
  ex('hm_rdl',        'Romanian Deadlift',     'hamstrings', 'Hip hinge with a slight knee bend, lowering the bar along the legs. The best exercise for hamstring hypertrophy through hip extension.', 'hinge', 'barbell'),
  ex('hm_legcurl',    'Leg Curl',              'hamstrings', 'Isolation machine curling the lower leg toward the glutes. Available as lying, seated, or standing — all effective for hamstring development.', 'curl', 'machine'),
  ex('hm_sldl',       'Stiff-Leg Deadlift',   'hamstrings', 'Like the RDL but with straighter legs and a focus on the stretch at the bottom. Targets the hamstrings and lower back.', 'hinge', 'barbell'),
  ex('hm_nordic',     'Nordic Hamstring Curl', 'hamstrings', 'Kneel and lower your torso to the floor resisting with your hamstrings. One of the most effective and challenging hamstring exercises.', 'curl', 'bodyweight'),
  ex('hm_goodmorning','Good Mornings',         'hamstrings', 'Bar on the traps, hinge at the hips. A classic posterior chain exercise targeting the hamstrings, glutes, and spinal erectors.', 'hinge', 'barbell'),

  // ── Glutes ────────────────────────────────────────────────────────────────
  ex('gl_hipthrust',  'Hip Thrust',            'glutes', 'Shoulders on a bench, bar across the hips — drive your hips to full extension. The most effective direct glute exercise available.', 'hinge', 'barbell'),
  ex('gl_bridge',     'Glute Bridge',          'glutes', 'The floor version of the hip thrust. Accessible and effective, especially for beginners or those without a bench.', 'hinge', 'bodyweight'),
  ex('gl_kickback',   'Cable Kickback',        'glutes', 'Kick one leg behind you against a cable resistance. Excellent isolation for the gluteus maximus through hip hyperextension.', 'extension', 'cable'),
  ex('gl_sumo',       'Sumo Deadlift',         'glutes', 'Wide stance deadlift with toes pointed out. The wide stance increases glute and inner-thigh activation compared to conventional.', 'hinge', 'barbell'),
  ex('gl_stepup',     'Step-Up',               'glutes', 'Step onto a raised platform one leg at a time. A functional unilateral movement that strongly activates the glutes and quads.', 'squat', 'dumbbell'),

  // ── Calves ────────────────────────────────────────────────────────────────
  ex('ca_standing',   'Standing Calf Raise',   'calves', 'Stand and raise your heels as high as possible. The primary calf exercise targeting the gastrocnemius (the outer muscle).', 'raise', 'machine'),
  ex('ca_seated',     'Seated Calf Raise',     'calves', 'Seated with a load on your knees, raise your heels. Targets the soleus — the deeper calf muscle — due to the bent-knee position.', 'raise', 'machine'),
  ex('ca_donkey',     'Donkey Calf Raise',     'calves', 'Bent at the hips with the weight on your lower back. Creates maximum stretch at the bottom for superior calf development.', 'raise', 'bodyweight'),

  // ── Core ──────────────────────────────────────────────────────────────────
  ex('co_plank',      'Plank',                 'core', 'Hold a push-up position on your forearms. The foundational anti-extension core exercise, building deep spinal stability.', 'plank', 'bodyweight'),
  ex('co_crunch',     'Crunch',                'core', 'Flex the spine to bring your shoulders toward your hips. A basic ab isolation exercise — best combined with lower-ab and rotational work.', 'extension', 'bodyweight'),
  ex('co_legraise',   'Hanging Leg Raise',     'core', 'Hang from a bar and raise your legs to hip height or above. A demanding lower-ab exercise also challenging grip and shoulder stability.', 'raise', 'bodyweight'),
  ex('co_rustwist',   'Russian Twist',         'core', 'Seated with feet raised, rotate your torso side to side. Trains the obliques and rotational stability.', 'extension', 'bodyweight'),
  ex('co_abrollout',  'Ab Rollout',            'core', 'Kneel with an ab wheel, roll forward until fully extended and return. One of the hardest anti-extension core exercises.', 'plank', 'bodyweight'),
  ex('co_cablecr',    'Cable Crunch',          'core', 'Kneel at a high pulley and crunch your elbows toward your knees. Allows progressive overload on the abs unlike most bodyweight core work.', 'extension', 'cable'),
]

// In-memory store for user-defined custom exercises (session-persistent)
const customExerciseStore = new Map<string, Exercise>()

export function addCustomExercise(exercise: Exercise): void {
  customExerciseStore.set(exercise.id, exercise)
}

export function getCustomExercises(): Exercise[] {
  return Array.from(customExerciseStore.values())
}

export function getExercisesForMuscleGroup(muscleGroup: MuscleGroup): Exercise[] {
  const builtin = EXERCISES.filter((e) => e.muscleGroup === muscleGroup)
  const custom = getCustomExercises().filter((e) => e.muscleGroup === muscleGroup)
  return [...builtin, ...custom]
}

export function getExerciseById(id: string): Exercise | undefined {
  return customExerciseStore.get(id) ?? EXERCISES.find((e) => e.id === id)
}
