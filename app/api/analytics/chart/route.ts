import { NextRequest, NextResponse } from 'next/server'
import { getExerciseChartData } from '@/app/actions/analytics'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const exerciseId = searchParams.get('exerciseId')
    const days = parseInt(searchParams.get('days') || '90')

    if (!exerciseId) {
      return NextResponse.json({ error: 'exerciseId is required' }, { status: 400 })
    }

    const data = await getExerciseChartData(exerciseId, days)
    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

