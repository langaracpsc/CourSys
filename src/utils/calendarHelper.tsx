import { Schedule, Section } from '../types/Section';

// ASSUMPTION: sunday doesn't exist
const DAYS_MAP: { [key: string]: number } = {
  'M': 1, // Monday
  'T': 2, // Tuesday
  'W': 3, // Wednesday
  'R': 4, // Thursday
  'F': 5, // Friday
  'S': 6, // Saturday
};

// Function to generate a color based on the course subject and course code
function generateColor(subject: string, courseCode: string): string {
  const input = `${subject}${courseCode}`;
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = input.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = hash % 360; // Use the hash to generate a hue value between 0 and 360
  const saturation = 50; // Fixed saturation value
  const lightness = 50; // Fixed lightness value
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

export function convertScheduleToEvents(sections: Section[]) {
  const events: {
    title: string;
    startTime?: string;
    endTime?: string;
    daysOfWeek: number[];
    backgroundColor: string;
    borderColor: string;
    start?: string;
    end?: string;
    extendedProps: {
      instructor: string;
      type: string;
      section: string;
    };
  }[] = [];

  sections.forEach(section => {
    section.schedule.forEach(schedule => {
      const scheduleEvents = createEventsFromSchedule(schedule, section);
      events.push(...scheduleEvents);
    });
  });

  return events;
}

export function generateHiddenDays(sections: Section[]) {
  
  let hasSaturday = false;
  sections.forEach(section => {
    section.schedule.forEach(schedule => {
      if (schedule.days.includes('S')) {
        hasSaturday = true;
      }
    });
  });
  
  return hasSaturday ? [0] : [0, 6];
}


function createEventsFromSchedule(schedule: Schedule, section: Section) {
  const events: {
    title: string;
    startTime?: string;
    endTime?: string;
    daysOfWeek: number[];
    backgroundColor: string;
    borderColor: string;
    start?: string;
    end?: string;
    extendedProps: {
      instructor: string;
      type: string;
      section: string;
    };
  }[] = [];
  const days = schedule.days.split('');
  const [startTime, endTime] = schedule.time.split('-');
  const color = generateColor(section.subject, section.course_code);

  days.forEach((day) => {
    if (day !== '-' && DAYS_MAP[day]) {
      const event: {
        title: string;
        startTime?: string;
        endTime?: string;
        daysOfWeek: number[];
        backgroundColor: string;
        borderColor: string;
        start?: string;
        end?: string;
        extendedProps: {
          instructor: string;
          type: string;
          section: string;
        };
      } = {
        title: `${section.subject} ${section.course_code}\n${schedule.type}`,
        daysOfWeek: [DAYS_MAP[day]],
        backgroundColor: color,
        borderColor: color,
        extendedProps: {
          instructor: schedule.instructor,
          type: schedule.type,
          section: section.section
        },
      };


      // not technically correct, but its close enough
      // if you set a recuring time fullcalendar breaks and renders exams every week
      // even if start and end are defined?
      // honestly not sure whats happening here
      const event_is_one_day = schedule.start !== null && schedule.end !== null && schedule.start === schedule.end;

      if (!event_is_one_day) {
        event.startTime = formatTime(startTime);
        event.endTime = formatTime(endTime);
      }

      if (schedule.start) {
        event.start = `${schedule.start}`;
      }

      if (schedule.end) {
        event.end = `${schedule.end}`;
      }

      events.push(event);
    }
  });

  return events;
}

function formatTime(time: string): string {
  return `${time.slice(0, 2)}:${time.slice(2)}:00`;
}