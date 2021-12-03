import dayjs from "dayjs";
import "dayjs/locale/fr";
import utc from "dayjs/plugin/utc";
import { mkdir, readFile, rmdir } from "fs/promises";
import ical from "node-ical";
import nodeHtmlToImage from "node-html-to-image";
import hash from "object-hash";
import { dirname, join } from "path";
import { sendTimetable } from "../bot";
import type {
  ParsedTimetable,
  HTMLTimeEvent,
  TimeEvent,
  Timetable,
} from "./types";

dayjs.extend(utc);
dayjs.locale("fr");

const parseEvent = (
  e: ical.CalendarComponent,
  prepareHTML: boolean
): TimeEvent | HTMLTimeEvent => {
  const startDateTime = dayjs(e.start as ical.DateWithTimeZone);
  const endDateTime = dayjs(e.end as ical.DateWithTimeZone);

  const [group, ...teachers] = (e.description as string).matchAll(
    /(?:(.+)\n)/g
  );

  const [{ groups: summary }] = (e.summary as string).matchAll(
    /^(?<type>.{2}(?:$|\s))?(?<course>.+)?/g
  );

  const event = {
    startDateTime,
    endDateTime,
    duration: endDateTime.diff(startDateTime),
    course: {
      label: summary?.course
        ? summary?.course.trim()
        : summary?.type.trim() ?? "",
      color: "#fffa42", // No data
      type: summary?.type ? summary.type.trim() : "TD",
    },
    teachers: teachers
      // Remove export date
      .filter((t) => !t.includes("Exporté le:"))
      .map((t) => ({
        name: t[1],
        email: "", // No data
      })),
    rooms: [
      {
        label: e.location,
      },
    ],
    groups: [
      {
        label: group[1],
      },
    ],
  } as TimeEvent;

  if (prepareHTML) {
    return {
      ...event,
      classnames: `timegrid_c${startDateTime.day() + 1} timegrid_rs${
        startDateTime.hour() - 6
      } timegrid_re${endDateTime.hour() - 6}`,
      startTime: startDateTime.format("HH:mm"),
      endTime: endDateTime.format("HH:mm"),
    } as HTMLTimeEvent;
  }

  return event;
};

export const basepath = join(__dirname, "/../../cache/edts/");

export const fetchEDT = async (
  resourceId: number,
  prepareHTML = false
): Promise<Timetable | ParsedTimetable> => {
  let startDate = dayjs().utc().startOf("w");
  // If Sunday, get next week
  if (new Date().getDay() === 0) {
    startDate = startDate.add(1, "w");
  }

  const endDate = startDate.endOf("w");

  const events = await ical.async.fromURL(
    `https://planning.univ-lorraine.fr/jsp/custom/modules/plannings/anonymous_cal.jsp?resources=${resourceId}&projectId=9&calType=ical&firstDate=${startDate.format(
      "YYYY-MM-DD"
    )}&nbWeeks=1`
  );

  const data = {
    startDate,
    endDate,
    hash: hash(events),
    table: Object.values(events)
      // Remove events that are not matching
      .filter(
        (e) =>
          (e.start as ical.DateWithTimeZone).getTime() <
          endDate.toDate().getTime()
      )
      // Sort events
      .sort((a, b) =>
        a.start && b.start
          ? (a.start as ical.DateWithTimeZone).getTime() -
            (b.start as ical.DateWithTimeZone).getTime()
          : 0
      )
      // Parse content
      .map((e) => parseEvent(e, prepareHTML)),
  } as Timetable;

  if (prepareHTML) {
    let days: string[] = [];
    let hours: string[] = [];

    let date = startDate;
    while (date.isBefore(endDate, "day")) {
      days.push(date.format("dddd DD MMMM"));
      date = date.add(1, "day");
    }

    for (let i = 8; i < 18; i++) {
      hours.push(i < 10 ? "0" + i : i.toString());
    }

    return {
      ...data,
      hours,
      days,
    } as ParsedTimetable;
  }

  return data;
};

export const generateEDT = async (
  login: string,
  resourceId: number
): Promise<string> => {
  const data = await fetchEDT(resourceId, true);

  let html =
    "<style>" +
    (await readFile(join(__dirname, "/../../dist/css/style.css"))).toString() +
    "</style>";
  html += (await readFile(join(__dirname, "/edt.handlebars"))).toString();

  const file = join(basepath, login, `/${data.hash}.jpg`);

  try {
    // Trying to read the file
    await readFile(file);
  } catch (error) {
    // Ensuring that dir exists
    await mkdir(dirname(file), {
      recursive: true,
    });
    // Generate image
    (await nodeHtmlToImage({
      output: file,
      html,
      content: { data },
      quality: 50,
      puppeteerArgs: {
        defaultViewport: {
          width: 1500,
          height: 900,
        },
        headless: true,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--headless",
          "--disable-gpu",
          "--disable-dev-shm-usage",
        ],
      },
    })) as Buffer;

    // TODO: Dirty
    if (!data.hash)
      sendTimetable(
        login,
        `https://oxypomme.fr/pommebot/edt/${resourceId}/${data.hash}`,
        data.startDate,
        data.endDate
      );
  }
  return data.hash;
};

export const clearCache = async (): Promise<void> =>
  rmdir(basepath, { recursive: true });
