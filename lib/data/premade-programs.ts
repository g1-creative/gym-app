/**
 * Hardcoded Premade Programs
 * 
 * Add your premade program here in the format below.
 * This will be used to seed the database with premade programs.
 */

export interface PremadeWorkout {
  name: string
  description?: string
  order_index: number
  rest_timer_seconds: number
  exercises: Array<{
    name: string
    order_index: number
    rest_timer_seconds?: number
    notes?: string
    // If exercise doesn't exist, it will be created as a custom exercise
    isCustom?: boolean
    muscleGroups?: string[]
    equipment?: string
  }>
}

export interface PremadeProgram {
  name: string
  description: string
  workouts: PremadeWorkout[]
}

/**
 * PREMADE PROGRAMS
 */
export const PREMADE_PROGRAMS: PremadeProgram[] = [
  {
    name: "Push-Pull-Legs-Arms Split",
    description: "A 6-day mass-building program focusing on progressive overload with consistent movement patterns. Split: Push A, Pull A, Quads, Rest, Push B, Arms, Pull B. All working sets are to failure. Rest 2-4 minutes between sets. Use for 8-12 weeks before taking 3-5 rest days.",
    workouts: [
      {
        name: "Day 1: Chest/Mid Delt/Tri (Push A)",
        description: "Chest, Mid Delts, Triceps focus",
        order_index: 0,
        rest_timer_seconds: 120, // 2-4 minutes
        exercises: [
          {
            name: "Incline Machine Press (Neutral Grip)",
            order_index: 0,
            rest_timer_seconds: 180,
            notes: "Top Set: 6-10 reps, 2 Backoff Sets: 12-20 reps. 2 seconds down, explosive press, no full lockout",
          },
          {
            name: "Incline Smith Machine Press",
            order_index: 1,
            rest_timer_seconds: 180,
            notes: "Top Set: 8-12 reps, Rest Pause Backoff Set (12-15 reps, rest 10-15 sec, repeat 2x)",
          },
          {
            name: "Flat Cable Press",
            order_index: 2,
            rest_timer_seconds: 180,
            notes: "2 Top Sets: 8-11 reps, 1 Backoff Set: 12-20 reps. Slight incline, mid chest angle",
          },
          {
            name: "Pec Dec Fly",
            order_index: 3,
            rest_timer_seconds: 120,
            notes: "2 Sets: 10-12 reps. Squeeze biceps into chest. Stretch 1 second before contracting",
          },
          {
            name: "Standing Cable Fly",
            order_index: 4,
            rest_timer_seconds: 120,
            notes: "2 Sets: 12-15 reps. Start above shoulders, finish towards lower chest",
          },
          {
            name: "Stretched Push Ups",
            order_index: 5,
            rest_timer_seconds: 60,
            notes: "Superset with Standing Cable Fly. 8-15 reps. Use step platforms or dip machine",
          },
          {
            name: "Machine Lateral Raise",
            order_index: 6,
            rest_timer_seconds: 45,
            notes: "4 Sets: 15-20 reps. Constant movement, partials if needed",
          },
          {
            name: "Overhead Extensions",
            order_index: 7,
            rest_timer_seconds: 120,
            notes: "1x8-10, 1x10-15",
          },
          {
            name: "Machine Dips",
            order_index: 8,
            rest_timer_seconds: 120,
            notes: "2 Sets: 8-12 reps. Explosive press, 2 seconds upwards",
          },
        ]
      },
      {
        name: "Day 2: Back - Row Focused (Pull A)",
        description: "Back and biceps with row focus",
        order_index: 1,
        rest_timer_seconds: 120,
        exercises: [
          {
            name: "Dual Single Arm Pulldown",
            order_index: 0,
            rest_timer_seconds: 180,
            notes: "1 Top Set: 10-12 reps, 1 Backoff: 12-15, 1 Backoff: 15-20. Semi pronated grip, stretch at top, pull to lower chest",
          },
          {
            name: "Single Arm Machine Row",
            order_index: 1,
            rest_timer_seconds: 180,
            notes: "1 Top Set: 6-8 each arm, 1 Rest Pause Set (8-10 each, switch arms, repeat 2x). Pull to hip, elbow not past stomach",
          },
          {
            name: "Deadstop Row",
            order_index: 2,
            rest_timer_seconds: 180,
            notes: "3 Sets: 8-11 reps. Smith machine, pull to belly button, back parallel and neutral",
          },
          {
            name: "Long Rope Cable Pullovers",
            order_index: 3,
            rest_timer_seconds: 180,
            notes: "1 Top Set: 10-12, 1 Stretch Pause Set. Arms straight, scoop to hips, elbows not past midline",
          },
          {
            name: "Rhomboid Row",
            order_index: 4,
            rest_timer_seconds: 120,
            notes: "2 Sets: 8-11 reps. Pull to lower chest, arms flared/abducted",
          },
          {
            name: "Rear Delt Row",
            order_index: 5,
            rest_timer_seconds: 120,
            notes: "2 Sets: 10-12 reps. Superset with Rhomboid Row. Pull at higher angle",
          },
          {
            name: "Cable Hammer Curls",
            order_index: 6,
            rest_timer_seconds: 120,
            notes: "1 Set: 8-10, 1 Set: 12-15. Can use rope or dual cable",
          },
          {
            name: "Preacher Curls",
            order_index: 7,
            rest_timer_seconds: 120,
            notes: "2 Sets: 10-12. Cables, dumbbells or machine",
          },
        ]
      },
      {
        name: "Day 3: Quad Focused Leg Day",
        description: "Quad focused with hamstring work",
        order_index: 2,
        rest_timer_seconds: 120,
        exercises: [
          {
            name: "Adductors",
            order_index: 0,
            rest_timer_seconds: 90,
            notes: "2 Sets: 8-10 reps. 2 seconds outward, stretch, contract 2 seconds",
          },
          {
            name: "Lying Hamstring Curls",
            order_index: 1,
            rest_timer_seconds: 180,
            notes: "1 Top Set: 8-10, 1 Backoff: 12-15. 3-4 second eccentric after 1 second contraction",
          },
          {
            name: "Leg Extensions",
            order_index: 2,
            rest_timer_seconds: 180,
            notes: "2 Top Sets: 10-12, 1 Backoff: 12-15. 1 second hold, 3 second eccentric. Keep legs in fixed position",
          },
          {
            name: "Leg Press",
            order_index: 3,
            rest_timer_seconds: 180,
            notes: "1 Top Set: 6-9, 1 Cluster Set: 25 reps. Legs on lower portion, go as deep as possible",
          },
          {
            name: "Hack Squats",
            order_index: 4,
            rest_timer_seconds: 180,
            notes: "1 Top Set: 8-10, 1 Backoff: 12-20. Legs on lower portion. Get deep",
          },
          {
            name: "Bulgarians",
            order_index: 5,
            rest_timer_seconds: 180,
            notes: "1 Set: 6-8 each leg, 1 triple dropset. Dropset: weight 5-15lbs lighter, failure, drop half, failure, bodyweight failure",
          },
          {
            name: "Walking Lunges + Squats",
            order_index: 6,
            rest_timer_seconds: 120,
            notes: "2 Sets: 30 seconds lunges + 15 air squats",
          },
        ]
      },
      {
        name: "Day 4: Chest & Shoulders (Push B)",
        description: "Chest and shoulder focus",
        order_index: 3,
        rest_timer_seconds: 120,
        exercises: [
          {
            name: "Cable Y Raise",
            order_index: 0,
            rest_timer_seconds: 120,
            notes: "3 Sets: 10-15 reps. Can use dual row cable, standard cable, or seated cross cable",
          },
          {
            name: "Incline Machine Press (Pronated Grip)",
            order_index: 1,
            rest_timer_seconds: 180,
            notes: "2 Working Sets: 8-10, 1 Backoff: 8-10. Hammer strength or regular incline press machine",
          },
          {
            name: "Machine Shoulder Press",
            order_index: 2,
            rest_timer_seconds: 180,
            notes: "1 Top Set: 8-10, 1 Backoff: 10-15. Slight pause at bottom before pressing",
          },
          {
            name: "Cable Lateral Raises",
            order_index: 3,
            rest_timer_seconds: 120,
            notes: "1 Top Set: 8-10, 2 Backoff: 12-15. Cables around hips. 2-3 partials at end of each set",
          },
          {
            name: "High to Low Cable Flys",
            order_index: 4,
            rest_timer_seconds: 120,
            notes: "2 Sets: 10-12. Squeeze and stretch chest, force blood in",
          },
          {
            name: "DB Lateral Raises",
            order_index: 5,
            rest_timer_seconds: 120,
            notes: "2 Sets: 10-12, 1 Set: 12-15 (triple dropset). Each drop: 6-11 reps",
          },
          {
            name: "Upright Rows",
            order_index: 6,
            rest_timer_seconds: 120,
            notes: "3 Sets: 8-10. Cable or EZ Bar",
          },
          {
            name: "Face Pulls",
            order_index: 7,
            rest_timer_seconds: 120,
            notes: "3 Sets: 10-15. Cable slightly lower than typical, rear delt and rhomboid stretch at bottom",
          },
        ]
      },
      {
        name: "Day 5: Biceps & Triceps (Arms)",
        description: "Arm specialization day",
        order_index: 4,
        rest_timer_seconds: 120,
        exercises: [
          {
            name: "Tricep Pressdowns",
            order_index: 0,
            rest_timer_seconds: 120,
            notes: "1 Top Set: 8-11, 1 Backoff: 10-15. EZ bar attachment. Stretch triceps at top",
          },
          {
            name: "Hammer Curls",
            order_index: 1,
            rest_timer_seconds: 120,
            notes: "1 Top Set: 6-10 each arm, 1 Backoff: 8-10 each + AMRAP together. Backoff: 2-3 reps shy of failure before AMRAP. 0.5 second squeeze",
          },
          {
            name: "Overhead Extensions Superset",
            order_index: 2,
            rest_timer_seconds: 120,
            notes: "2 Sets: 8-10 Cable/EZ Bar + 5-10 reps incline DB. Keep elbows high",
          },
          {
            name: "Cable Curls",
            order_index: 3,
            rest_timer_seconds: 120,
            notes: "1 Top Set: 8-10, 1 Backoff: 12-15 (triple dropset). EZ Bar attachment",
          },
          {
            name: "Dips",
            order_index: 4,
            rest_timer_seconds: 120,
            notes: "2 Sets: AMRAP. 2 second eccentric, explosive press, no lockout",
          },
          {
            name: "Spider Curls",
            order_index: 5,
            rest_timer_seconds: 120,
            notes: "3 Sets: 10-12. With dumbbells",
          },
          {
            name: "JM Press",
            order_index: 6,
            rest_timer_seconds: 10,
            notes: "5x6 (Cluster Set). 6 reps, rest 10 seconds, repeat 5 times. Weight for 15-20 reps",
          },
        ]
      },
      {
        name: "Day 6: Back/Ham (Posterior Chain) (Pull B)",
        description: "Back and hamstring focus",
        order_index: 5,
        rest_timer_seconds: 120,
        exercises: [
          {
            name: "Adductors",
            order_index: 0,
            rest_timer_seconds: 90,
            notes: "2 Sets: 8-10",
          },
          {
            name: "Seated Leg Curl",
            order_index: 1,
            rest_timer_seconds: 180,
            notes: "1 Top Set: 8-10, 1 Backoff: 12-20",
          },
          {
            name: "RDL's",
            order_index: 2,
            rest_timer_seconds: 180,
            notes: "1 Top Set: 6-8, 1 Backoff: 8-10, 1 Backoff: 8-12. Barbell or dumbbell",
          },
          {
            name: "Single Arm Lat Pulldown",
            order_index: 3,
            rest_timer_seconds: 120,
            notes: "2 Sets: 8-12 each arm. Incline bench or cable pulldown. Spine neutral, pull to hips",
          },
          {
            name: "High to Low Row",
            order_index: 4,
            rest_timer_seconds: 180,
            notes: "1 Top Set: 6-8, 1 Backoff: 10-12 each arm. Finish to middle abdominals. Stretch at top, unilateral",
          },
          {
            name: "Chest Supported Row",
            order_index: 5,
            rest_timer_seconds: 180,
            notes: "1 Top Set: 10-12, 1 Backoff: 12-15 Stretch Pause. Stretch at bottom 10-15 sec, repeat 2x",
          },
          {
            name: "Machine Pullovers",
            order_index: 6,
            rest_timer_seconds: 120,
            notes: "2 Sets: 12-15",
          },
          {
            name: "Pull Ups",
            order_index: 7,
            rest_timer_seconds: 120,
            notes: "2 Sets: AMRAP. Pull with intent to target lats",
          },
          {
            name: "Hyperextensions",
            order_index: 8,
            rest_timer_seconds: 120,
            notes: "2 Sets: 12-15. Keep spine slightly concave for hams and lower back",
          },
        ]
      },
    ]
  },
  {
    name: "Sam Sulek Twist",
    description: "A 6-day high-volume bodybuilding split inspired by Sam Sulek's training style. Focus on pump, volume, and progressive overload. Day 7 is optional for arms/delts pump, weak points, or active recovery.",
    workouts: [
      {
        name: "Day 1: Chest + Triceps",
        description: "Chest and triceps focus",
        order_index: 0,
        rest_timer_seconds: 90,
        exercises: [
          {
            name: "Incline Smith Press",
            order_index: 0,
            rest_timer_seconds: 120,
            notes: "4 Sets: 8-12 reps",
          },
          {
            name: "Machine Chest Press",
            order_index: 1,
            rest_timer_seconds: 90,
            notes: "3 Sets: 10-15 reps",
          },
          {
            name: "Cable Fly (mid to low)",
            order_index: 2,
            rest_timer_seconds: 90,
            notes: "4 Sets: 12-20 reps",
          },
          {
            name: "Dips (assisted or weighted)",
            order_index: 3,
            rest_timer_seconds: 90,
            notes: "3 Sets: AMRAP",
          },
          {
            name: "Rope Pushdowns",
            order_index: 4,
            rest_timer_seconds: 90,
            notes: "4 Sets: 10-15 reps",
          },
          {
            name: "Overhead Cable Extensions",
            order_index: 5,
            rest_timer_seconds: 90,
            notes: "3 Sets: 12-20 reps",
          },
          {
            name: "Single-Arm Pushdowns",
            order_index: 6,
            rest_timer_seconds: 90,
            notes: "2 Sets: AMRAP",
          },
        ]
      },
      {
        name: "Day 2: Back + Biceps",
        description: "Back and biceps focus",
        order_index: 1,
        rest_timer_seconds: 90,
        exercises: [
          {
            name: "Lat Pulldown (wide or neutral)",
            order_index: 0,
            rest_timer_seconds: 120,
            notes: "4 Sets: 8-12 reps",
          },
          {
            name: "Chest-Supported Row",
            order_index: 1,
            rest_timer_seconds: 90,
            notes: "4 Sets: 10-15 reps",
          },
          {
            name: "Seated Cable Row",
            order_index: 2,
            rest_timer_seconds: 90,
            notes: "3 Sets: 12-15 reps",
          },
          {
            name: "Straight-Arm Pulldown",
            order_index: 3,
            rest_timer_seconds: 90,
            notes: "3 Sets: 15-20 reps",
          },
          {
            name: "EZ-Bar Curl",
            order_index: 4,
            rest_timer_seconds: 120,
            notes: "4 Sets: 8-12 reps",
          },
          {
            name: "Preacher Curl (machine preferred)",
            order_index: 5,
            rest_timer_seconds: 90,
            notes: "3 Sets: 10-15 reps",
          },
          {
            name: "Cable Curl (slow)",
            order_index: 6,
            rest_timer_seconds: 90,
            notes: "3 Sets: 12-20 reps",
          },
        ]
      },
      {
        name: "Day 3: Legs (Hamstring/Glute)",
        description: "Hamstring and glute focused leg day",
        order_index: 2,
        rest_timer_seconds: 90,
        exercises: [
          {
            name: "Lying or Seated Leg Curl",
            order_index: 0,
            rest_timer_seconds: 90,
            notes: "4 Sets: 10-15 reps",
          },
          {
            name: "Romanian Deadlift",
            order_index: 1,
            rest_timer_seconds: 120,
            notes: "4 Sets: 8-12 reps",
          },
          {
            name: "Smith Machine Squat (hip bias)",
            order_index: 2,
            rest_timer_seconds: 120,
            notes: "4 Sets: 8-12 reps",
          },
          {
            name: "Hip Thrust or Glute Bridge",
            order_index: 3,
            rest_timer_seconds: 90,
            notes: "3 Sets: 10-15 reps",
          },
          {
            name: "Adductor Machine",
            order_index: 4,
            rest_timer_seconds: 90,
            notes: "3 Sets: 12-20 reps",
          },
          {
            name: "Seated Calf Raise",
            order_index: 5,
            rest_timer_seconds: 60,
            notes: "5 Sets: 12-20 reps",
          },
        ]
      },
      {
        name: "Day 4: Shoulders + Arms",
        description: "Shoulders, triceps, and biceps",
        order_index: 3,
        rest_timer_seconds: 90,
        exercises: [
          {
            name: "Seated DB Shoulder Press",
            order_index: 0,
            rest_timer_seconds: 120,
            notes: "4 Sets: 8-12 reps",
          },
          {
            name: "Machine Lateral Raise",
            order_index: 1,
            rest_timer_seconds: 90,
            notes: "4 Sets: 12-20 reps",
          },
          {
            name: "Cable Lateral Raise",
            order_index: 2,
            rest_timer_seconds: 90,
            notes: "3 Sets: 15-20 reps",
          },
          {
            name: "Rear Delt Fly (machine or cables)",
            order_index: 3,
            rest_timer_seconds: 90,
            notes: "4 Sets: 15-20 reps",
          },
          {
            name: "Close-Grip Bench or Machine Press",
            order_index: 4,
            rest_timer_seconds: 120,
            notes: "3 Sets: 8-12 reps",
          },
          {
            name: "Rope Pushdowns",
            order_index: 5,
            rest_timer_seconds: 90,
            notes: "3 Sets: 12-15 reps",
          },
          {
            name: "Incline DB Curls",
            order_index: 6,
            rest_timer_seconds: 90,
            notes: "3 Sets: 10-15 reps",
          },
          {
            name: "Hammer Curls",
            order_index: 7,
            rest_timer_seconds: 90,
            notes: "3 Sets: 12-15 reps",
          },
        ]
      },
      {
        name: "Day 5: Legs (Quad Bias)",
        description: "Quad focused leg day",
        order_index: 4,
        rest_timer_seconds: 90,
        exercises: [
          {
            name: "Seated Leg Curl (warm-up focus)",
            order_index: 0,
            rest_timer_seconds: 90,
            notes: "4 Sets: 12-20 reps",
          },
          {
            name: "Back Squat",
            order_index: 1,
            rest_timer_seconds: 180,
            notes: "5 Sets: 6-12 reps. Target: 205 lbs",
          },
          {
            name: "Leg Press (quad stance)",
            order_index: 2,
            rest_timer_seconds: 120,
            notes: "4 Sets: 10-15 reps",
          },
          {
            name: "Walking Lunges",
            order_index: 3,
            rest_timer_seconds: 90,
            notes: "3 Sets: 20-30 steps",
          },
          {
            name: "Leg Extensions",
            order_index: 4,
            rest_timer_seconds: 90,
            notes: "4 Sets: 12-20 reps + partials",
          },
          {
            name: "Standing Calf Raise",
            order_index: 5,
            rest_timer_seconds: 60,
            notes: "5 Sets: 10-20 reps",
          },
        ]
      },
      {
        name: "Day 6: Chest + Back (Pump/Volume)",
        description: "High volume pump day for chest and back",
        order_index: 5,
        rest_timer_seconds: 60,
        exercises: [
          {
            name: "Incline Machine Press",
            order_index: 0,
            rest_timer_seconds: 90,
            notes: "4 Sets: 10-15 reps",
          },
          {
            name: "Pec Deck",
            order_index: 1,
            rest_timer_seconds: 60,
            notes: "4 Sets: 12-20 reps",
          },
          {
            name: "Neutral-Grip Pulldown",
            order_index: 2,
            rest_timer_seconds: 90,
            notes: "4 Sets: 10-15 reps",
          },
          {
            name: "Single-Arm Machine Row",
            order_index: 3,
            rest_timer_seconds: 60,
            notes: "3 Sets: 12-15 reps",
          },
          {
            name: "Cable Fly (stretch focus)",
            order_index: 4,
            rest_timer_seconds: 60,
            notes: "2 Sets: 20 reps",
          },
          {
            name: "Straight-Arm Pulldown",
            order_index: 5,
            rest_timer_seconds: 60,
            notes: "2 Sets: 20 reps",
          },
        ]
      },
    ]
  }
]
