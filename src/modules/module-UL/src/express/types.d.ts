import { Dayjs } from "dayjs";

export type Course = {
  label: string;
  color: `#${string}`;
  type: "CM" | "EI" | "TD" | "TP";
};

export type Teacher = {
  name: string;
  email: string;
};

export type TimeEvent = {
  startDateTime: string | Dayjs;
  endDateTime: string | Dayjs;
  duration: number;
  course: Course;
  teachers: Teacher[];
  rooms: {
    label: string;
  }[];
  groups: {
    label: string;
  }[];
};

export type HTMLTimeEvent = TimeEvent & {
  classnames: string;
  startTime: string;
  endTime: string;
};

export type Timetable = {
  startDate: Dayjs;
  endDate: Dayjs;
  hash: string;
  table: (TimeEvent | HTMLTimeEvent)[];
};

export type ParsedTimetable = Timetable & {
  hours: string[];
  days: string[];
  table: HTMLTimeEvent[];
};
