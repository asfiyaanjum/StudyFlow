import {
  Task,
  ScheduleItem,
  RecoveryPlan,
  RescheduleSuggestion,
  OverloadedDayWarning,
  Priority,
  DayOfWeek,
} from '../types';
import { parseTimeToMinutes, minutesToTimeString, isDatePast } from './dateUtils';

// Priority weight for sorting urgent tasks
const PRIORITY_WEIGHTS: Record<Priority, number> = {
  urgent: 100,
  high: 75,
  medium: 50,
  low: 25,
};

// Maximum healthy study/work capacity per day in minutes (8 hours)
const MAX_HEALTHY_DAILY_MINUTES = 480;

/**
 * StudyFlow Recovery Engine
 * 
 * Signature differentiator: Deterministic, explainable academic rescheduling.
 * Identifies overdue/at-risk tasks, maps existing timetable commitments,
 * detects overloaded days, and generates actionable, approved-only suggestions.
 */
export class RecoveryEngine {
  /**
   * Run full academic workload and recovery analysis
   */
  public static analyze(
    tasks: Task[],
    scheduleItems: ScheduleItem[],
    currentDate: Date = new Date()
  ): RecoveryPlan {
    // 1. Identify incomplete and overdue tasks
    const incompleteTasks = tasks.filter((t) => !t.is_completed && t.status !== 'cancelled');
    const overdueTasks = incompleteTasks.filter((t) => isDatePast(t.due_date));

    // Sort overdue tasks by priority and due date
    const sortedOverdue = [...overdueTasks].sort((a, b) => {
      const weightA = PRIORITY_WEIGHTS[a.priority];
      const weightB = PRIORITY_WEIGHTS[b.priority];
      if (weightA !== weightB) return weightB - weightA;
      return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
    });

    // 2. Analyze next 7 days for schedule load and available slots
    const dayCapacities = this.calculateNextSevenDaysCapacity(
      currentDate,
      scheduleItems,
      incompleteTasks
    );

    // 3. Detect overloaded days
    const overloadedDays: OverloadedDayWarning[] = [];
    for (const day of dayCapacities) {
      const totalLoad = day.scheduledMinutes + day.taskMinutes;
      if (totalLoad > MAX_HEALTHY_DAILY_MINUTES) {
        overloadedDays.push({
          date: day.dateString,
          day_name: day.dayName,
          total_scheduled_minutes: day.scheduledMinutes,
          total_task_minutes: day.taskMinutes,
          available_capacity_minutes: MAX_HEALTHY_DAILY_MINUTES,
          overload_by_minutes: totalLoad - MAX_HEALTHY_DAILY_MINUTES,
          high_priority_conflicts: day.highPriorityTaskCount,
        });
      }
    }

    // 4. Generate intelligent reschedule suggestions for overdue and at-risk tasks
    const suggestions: RescheduleSuggestion[] = [];

    for (const task of sortedOverdue) {
      const bestSlot = this.findBestAvailableSlot(task, dayCapacities);
      if (bestSlot) {
        suggestions.push({
          id: `rec-sug-${task.id}`,
          task_id: task.id,
          task_title: task.title,
          priority: task.priority,
          estimated_duration_minutes: task.estimated_duration_minutes,
          original_due_date: task.due_date,
          suggested_new_date: bestSlot.dateString,
          suggested_time_slot: bestSlot.timeSlot,
          reason: bestSlot.reason,
          urgency_score: PRIORITY_WEIGHTS[task.priority],
          status: 'pending',
        });

        // Deduct from temporary capacity so subsequent suggestions don't double book
        bestSlot.targetDay.taskMinutes += task.estimated_duration_minutes;
      }
    }

    // 5. Generate human-readable recommendation summary
    let recommendationSummary = 'Your schedule is currently balanced and on track.';
    if (overdueTasks.length > 0 && overloadedDays.length > 0) {
      recommendationSummary = `You have ${overdueTasks.length} overdue ${overdueTasks.length === 1 ? 'task' : 'tasks'} and ${overloadedDays.length} overloaded study ${overloadedDays.length === 1 ? 'day' : 'days'}. Review the suggested rescheduling below to regain control.`;
    } else if (overdueTasks.length > 0) {
      recommendationSummary = `You have ${overdueTasks.length} overdue ${overdueTasks.length === 1 ? 'task' : 'tasks'}. StudyFlow found open study windows to catch up without exceeding your daily workload limit.`;
    } else if (overloadedDays.length > 0) {
      recommendationSummary = `Warning: ${overloadedDays.length} upcoming days exceed the recommended 8-hour academic limit. Consider spreading tasks to lighter days.`;
    }

    return {
      analyzed_at: currentDate.toISOString(),
      overdue_tasks_count: overdueTasks.length,
      incomplete_tasks_count: incompleteTasks.length,
      suggestions,
      overloaded_days: overloadedDays,
      recommendation_summary: recommendationSummary,
    };
  }

  /**
   * Calculate daily schedule load and available capacity for next 7 days
   */
  private static calculateNextSevenDaysCapacity(
    startDate: Date,
    scheduleItems: ScheduleItem[],
    tasks: Task[]
  ) {
    const days = [];
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    for (let i = 0; i < 7; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      const dateString = d.toISOString().split('T')[0];
      const dayOfWeek = d.getDay() as DayOfWeek;

      // Scheduled items on this day
      const itemsForDay = scheduleItems.filter((item) => {
        if (item.is_recurring) {
          return item.day_of_week === dayOfWeek;
        }
        return item.specific_date === dateString;
      });

      let scheduledMinutes = 0;
      for (const item of itemsForDay) {
        const start = parseTimeToMinutes(item.start_time);
        const end = parseTimeToMinutes(item.end_time);
        if (end > start) {
          scheduledMinutes += end - start;
        }
      }

      // Existing pending tasks due on this day
      const tasksOnDay = tasks.filter((t) => t.due_date.startsWith(dateString));
      const taskMinutes = tasksOnDay.reduce(
        (sum, t) => sum + (t.estimated_duration_minutes || 60),
        0
      );
      const highPriorityTaskCount = tasksOnDay.filter(
        (t) => t.priority === 'urgent' || t.priority === 'high'
      ).length;

      days.push({
        date: d,
        dateString,
        dayOfWeek,
        dayName: dayNames[dayOfWeek],
        scheduledMinutes,
        taskMinutes,
        highPriorityTaskCount,
        busyItems: itemsForDay,
      });
    }

    return days;
  }

  /**
   * Find the optimal free day & time slot for an overdue/rescheduled task
   */
  private static findBestAvailableSlot(
    task: Task,
    dayCapacities: ReturnType<typeof RecoveryEngine.calculateNextSevenDaysCapacity>
  ) {
    const duration = task.estimated_duration_minutes || 60;

    // Look for the earliest day that can comfortably fit this task
    for (const day of dayCapacities) {
      const currentLoad = day.scheduledMinutes + day.taskMinutes;
      if (currentLoad + duration <= MAX_HEALTHY_DAILY_MINUTES) {
        // Find a concrete free window between 08:00 (480 mins) and 21:00 (1260 mins)
        const timeSlot = this.findFreeTimeWindow(day.busyItems, duration);

        return {
          targetDay: day,
          dateString: day.dateString,
          timeSlot,
          reason: `Recommended for ${day.dayName} (${day.dateString}) because total workload will remain within healthy limits (${Math.round(
            (currentLoad + duration) / 60
          )}h of 8h max).`,
        };
      }
    }

    // Fallback: Day with lowest total load
    const leastLoadedDay = [...dayCapacities].sort(
      (a, b) => a.scheduledMinutes + a.taskMinutes - (b.scheduledMinutes + b.taskMinutes)
    )[0];

    if (leastLoadedDay) {
      return {
        targetDay: leastLoadedDay,
        dateString: leastLoadedDay.dateString,
        timeSlot: { start: '16:00', end: '17:00' },
        reason: `Placed on ${leastLoadedDay.dayName} as it has the lowest scheduled workload this week.`,
      };
    }

    return null;
  }

  /**
   * Calculate a concrete time window between 8:00 AM and 9:00 PM without schedule collisions
   */
  private static findFreeTimeWindow(
    busyItems: ScheduleItem[],
    neededDurationMinutes: number
  ): { start: string; end: string } {
    const studyStartMinutes = 8 * 60; // 08:00
    const studyEndMinutes = 21 * 60;  // 21:00

    // Map busy intervals
    const busyIntervals = busyItems
      .map((item) => ({
        start: parseTimeToMinutes(item.start_time),
        end: parseTimeToMinutes(item.end_time),
      }))
      .sort((a, b) => a.start - b.start);

    let currentCursor = studyStartMinutes;

    for (const interval of busyIntervals) {
      if (interval.start > currentCursor) {
        const gap = interval.start - currentCursor;
        if (gap >= neededDurationMinutes) {
          return {
            start: minutesToTimeString(currentCursor),
            end: minutesToTimeString(currentCursor + neededDurationMinutes),
          };
        }
      }
      currentCursor = Math.max(currentCursor, interval.end);
    }

    if (studyEndMinutes - currentCursor >= neededDurationMinutes) {
      return {
        start: minutesToTimeString(currentCursor),
        end: minutesToTimeString(currentCursor + neededDurationMinutes),
      };
    }

    // Default afternoon focus slot if tightly packed
    return {
      start: '15:00',
      end: minutesToTimeString(15 * 60 + neededDurationMinutes),
    };
  }
}
