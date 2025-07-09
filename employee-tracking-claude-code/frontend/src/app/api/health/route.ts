import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Check if the application is healthy
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    }

    return NextResponse.json(health, { status: 200 })
  } catch (error) {
    const health = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    }

    return NextResponse.json(health, { status: 503 })
  }
}