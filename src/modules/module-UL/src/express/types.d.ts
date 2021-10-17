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

export type Event = {
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

export type GraphQLError = {
  message: string;
  locations: {
    line: number;
    column: number;
  }[];
  path: string[];
  extensions: {
    code: string;
  };
};

export type GraphQLResult = {
  data: {
    timetable: {
      plannings: {
        events: Event[];
      }[];
    };
  };
  errors?: GraphQLError[];
};

export type ParsedEvent = Event & {
  classnames: string;
  startTime: string;
  endTime: string;
};

export type ParsedTimetable = {
  startDate: Dayjs;
  endDate: Dayjs;
  hours?: string[];
  days?: string[];
  timetable: ParsedEvent[];
};
