/**
 * Analytics utility for tracking user events
 * Supports multiple analytics providers
 */

type AnalyticsEvent = {
  name: string
  properties?: Record<string, any>
}

class Analytics {
  private isProduction = process.env.NODE_ENV === 'production'
  private isInitialized = false

  /**
   * Initialize analytics
   * Call this once in your app layout or root component
   */
  init() {
    if (this.isInitialized) return

    // Initialize analytics providers here
    // Example: Google Analytics, Plausible, Mixpanel, etc.
    
    if (this.isProduction) {
      // TODO: Initialize your analytics provider
      // Example for Google Analytics:
      // if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_GA_ID) {
      //   window.gtag('config', process.env.NEXT_PUBLIC_GA_ID)
      // }
    }

    this.isInitialized = true
  }

  /**
   * Track a page view
   */
  pageView(url: string) {
    if (!this.isProduction) {
      console.log('[Analytics] Page view:', url)
      return
    }

    // TODO: Send to your analytics provider
    // Example for Google Analytics:
    // if (typeof window !== 'undefined' && window.gtag) {
    //   window.gtag('event', 'page_view', {
    //     page_path: url,
    //   })
    // }
  }

  /**
   * Track a custom event
   */
  event(event: AnalyticsEvent) {
    if (!this.isProduction) {
      console.log('[Analytics] Event:', event.name, event.properties)
      return
    }

    // TODO: Send to your analytics provider
    // Example for Google Analytics:
    // if (typeof window !== 'undefined' && window.gtag) {
    //   window.gtag('event', event.name, event.properties)
    // }
  }

  /**
   * Track workout-specific events
   */
  workoutStarted(workoutId: string) {
    this.event({
      name: 'workout_started',
      properties: { workout_id: workoutId },
    })
  }

  workoutCompleted(workoutId: string, duration: number) {
    this.event({
      name: 'workout_completed',
      properties: { 
        workout_id: workoutId,
        duration_minutes: Math.round(duration / 60),
      },
    })
  }

  programCreated(programId: string) {
    this.event({
      name: 'program_created',
      properties: { program_id: programId },
    })
  }

  exerciseLogged(exerciseId: string) {
    this.event({
      name: 'exercise_logged',
      properties: { exercise_id: exerciseId },
    })
  }

  /**
   * Identify a user (for user tracking)
   */
  identify(userId: string, traits?: Record<string, any>) {
    if (!this.isProduction) {
      console.log('[Analytics] Identify:', userId, traits)
      return
    }

    // TODO: Send to your analytics provider
    // Example for Mixpanel:
    // if (typeof window !== 'undefined' && window.mixpanel) {
    //   window.mixpanel.identify(userId)
    //   if (traits) {
    //     window.mixpanel.people.set(traits)
    //   }
    // }
  }
}

// Export singleton instance
export const analytics = new Analytics()

// Convenience functions
export const trackPageView = analytics.pageView.bind(analytics)
export const trackEvent = analytics.event.bind(analytics)
export const identifyUser = analytics.identify.bind(analytics)
