/**
 * Script to insert premade programs
 * 
 * Usage: This script can be run to insert premade programs into the database
 * 
 * To use this:
 * 1. Define your program structure below
 * 2. Run this script (you'll need to set up a connection to Supabase)
 * 
 * Example program structure:
 */

interface PremadeProgram {
  name: string
  description: string
  workouts: Array<{
    name: string
    description?: string
    order_index: number
    rest_timer_seconds: number
    exercises: Array<{
      exerciseName: string // Will be matched or created
      order_index: number
      rest_timer_seconds?: number
      notes?: string
      isCustom?: boolean // If true, will create as custom exercise
      muscleGroups?: string[]
      equipment?: string
    }>
  }>
}

// Example: Push/Pull/Legs Split
export const exampleProgram: PremadeProgram = {
  name: "Push/Pull/Legs Split",
  description: "A classic 3-day split focusing on push movements, pull movements, and legs. Perfect for intermediate lifters.",
  workouts: [
    {
      name: "Push Day",
      description: "Chest, Shoulders, Triceps",
      order_index: 0,
      rest_timer_seconds: 90,
      exercises: [
        {
          exerciseName: "Bench Press",
          order_index: 0,
          rest_timer_seconds: 180,
        },
        {
          exerciseName: "Overhead Press",
          order_index: 1,
          rest_timer_seconds: 120,
        },
        {
          exerciseName: "Incline Dumbbell Press",
          order_index: 2,
        },
        {
          exerciseName: "Lateral Raises",
          order_index: 3,
        },
        {
          exerciseName: "Tricep Dips",
          order_index: 4,
        },
      ]
    },
    {
      name: "Pull Day",
      description: "Back, Biceps",
      order_index: 1,
      rest_timer_seconds: 90,
      exercises: [
        {
          exerciseName: "Deadlift",
          order_index: 0,
          rest_timer_seconds: 180,
        },
        {
          exerciseName: "Barbell Row",
          order_index: 1,
          rest_timer_seconds: 120,
        },
        {
          exerciseName: "Pull-ups",
          order_index: 2,
        },
        {
          exerciseName: "Cable Rows",
          order_index: 3,
        },
        {
          exerciseName: "Barbell Curls",
          order_index: 4,
        },
      ]
    },
    {
      name: "Leg Day",
      description: "Quads, Hamstrings, Glutes, Calves",
      order_index: 2,
      rest_timer_seconds: 90,
      exercises: [
        {
          exerciseName: "Squat",
          order_index: 0,
          rest_timer_seconds: 180,
        },
        {
          exerciseName: "Romanian Deadlift",
          order_index: 1,
          rest_timer_seconds: 120,
        },
        {
          exerciseName: "Leg Press",
          order_index: 2,
        },
        {
          exerciseName: "Leg Curls",
          order_index: 3,
        },
        {
          exerciseName: "Calf Raises",
          order_index: 4,
        },
      ]
    },
  ]
}

/**
 * Function to insert a premade program
 * This would typically be run by an admin or during setup
 */
export async function insertPremadeProgram(
  supabase: any,
  program: PremadeProgram,
  systemUserId?: string
) {
  // Create the program
  const { data: newProgram, error: programError } = await supabase
    .from('programs')
    .insert({
      user_id: systemUserId || null, // System user or null for premade
      name: program.name,
      description: program.description,
      is_premade: true,
      is_active: true,
    })
    .select()
    .single()

  if (programError) throw programError

  // Create workouts and exercises
  for (const workout of program.workouts) {
    // Create workout
    const { data: newWorkout, error: workoutError } = await supabase
      .from('workouts')
      .insert({
        program_id: newProgram.id,
        name: workout.name,
        description: workout.description || null,
        order_index: workout.order_index,
        rest_timer_seconds: workout.rest_timer_seconds,
      })
      .select()
      .single()

    if (workoutError) throw workoutError

    // Create exercises for this workout
    for (const exerciseData of workout.exercises) {
      // Find or create exercise
      let exerciseId: string

      // First, try to find existing exercise
      const { data: existingExercise } = await supabase
        .from('exercises')
        .select('id')
        .eq('name', exerciseData.exerciseName)
        .eq('is_custom', exerciseData.isCustom || false)
        .is('deleted_at', null)
        .maybeSingle()

      if (existingExercise) {
        exerciseId = existingExercise.id
      } else {
        // Create new exercise
        const { data: newExercise, error: exerciseError } = await supabase
          .from('exercises')
          .insert({
            user_id: exerciseData.isCustom ? systemUserId : null,
            name: exerciseData.exerciseName,
            muscle_groups: exerciseData.muscleGroups || null,
            equipment: exerciseData.equipment || null,
            is_custom: exerciseData.isCustom || false,
          })
          .select()
          .single()

        if (exerciseError) throw exerciseError
        exerciseId = newExercise.id
      }

      // Link exercise to workout
      await supabase
        .from('workout_exercises')
        .insert({
          workout_id: newWorkout.id,
          exercise_id: exerciseId,
          order_index: exerciseData.order_index,
          rest_timer_seconds: exerciseData.rest_timer_seconds || workout.rest_timer_seconds,
          notes: exerciseData.notes || null,
        })
    }
  }

  return newProgram
}

