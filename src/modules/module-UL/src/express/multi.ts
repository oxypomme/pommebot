import dayjs from "dayjs";
import "dayjs/locale/fr";
import utc from "dayjs/plugin/utc";
import { mkdir, readFile, rmdir } from "fs/promises";
import fetch from "node-fetch";
import nodeHtmlToImage from "node-html-to-image";
import hash from "object-hash";
import { dirname, join } from "path";
import { sendTimetable } from "../bot";
import { GraphQLResult, ParsedEvent, ParsedTimetable } from "./types";

dayjs.extend(utc);
dayjs.locale("fr");

export const basepath = join(__dirname, "/../../cache/edts/");

export const fetchEDT = async (
  login: string,
  prepareHTML = false
): Promise<GraphQLResult | ParsedTimetable> => {
  let startDate = dayjs().utc().startOf("w");
  // If Sunday, get next week
  if (new Date().getDay() === 0) {
    startDate = startDate.add(1, "w");
  }

  const endDate = startDate.endOf("w");

  const res = (await (
    await fetch("https://multi.univ-lorraine.fr/graphql", {
      headers: {
        "content-type": "application/json",
        "x-refresh-token":
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7InVpZCI6InN1YmxldDF1In0sImlhdCI6MTYzNDQ1NDUzMCwiZXhwIjoxNjM1MDU5MzMwfQ.c84lvD8ILb-X_qcpVYLUs0qHpC0UEGAFi8nThNcOc7w",
        "x-token":
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7InVpZCI6InN1YmxldDF1Iiwicm9sZXMiOlsiRVQiXSwiZW1haWwiOiJ0b20uc3VibGV0MkBldHUudW5pdi1sb3JyYWluZS5mciIsImRuIjoiU1VCTEVUIFRvbSIsIm4iOiJTdWJsZXQiLCJmIjoiVG9tIn0sImlhdCI6MTYzNDQ1NDUzMCwiZXhwIjoxNjM0NDU4MTMwfQ._LD4BFgbYYh-BEmksZ9W7QUd9ZzQ3AioQ9oHyeJHVzo",
      },
      body: `{"operationName":"timetable","variables":{"uid":"${login}","from":${startDate.valueOf()},"to":${endDate.valueOf()}},"query":"query timetable($uid: String!, $from: Float, $to: Float) {\\n  timetable(uid: $uid, from: $from, to: $to) {\\n    id\\n    messages {\\n      text\\n      level\\n    }\\n    plannings {\\n      id\\n      type\\n      label\\n      default\\n      messages {\\n        text\\n        level\\n      }\\n      events {\\n        startDateTime\\n        endDateTime\\n        duration\\n        course {\\n          label\\n          color\\n          type\\n        }\\n        teachers {\\n          name\\n          email\\n        }\\n        rooms {\\n          label\\n        }\\n        groups {\\n          label\\n        }\\n      }\\n    }\\n  }\\n}\\n"}`,
      method: "POST",
    })
  ).json()) as GraphQLResult;

  if (res.errors) {
    return res;
  }

  const timetable = res.data.timetable.plannings[0].events;
  let days: string[] | undefined = undefined;
  let hours: string[] | undefined = undefined;

  if (prepareHTML) {
    days = [];
    hours = [];

    let date = startDate;
    while (date.isBefore(endDate, "day")) {
      days.push(date.format("dddd DD MMMM"));
      date = date.add(1, "day");
    }

    for (let i = 8; i < 18; i++) {
      hours.push(i < 10 ? "0" + i : i.toString());
    }
  }

  for (const event of timetable) {
    // Fuck you France
    const summerHour = dayjs().isBefore("2021-10-31 04:00:00");

    event.startDateTime = dayjs(event.startDateTime)
      .utc()
      .add(summerHour ? 2 : 1, "h");
    event.endDateTime = dayjs(event.endDateTime)
      .utc()
      .add(summerHour ? 2 : 1, "h");

    if (prepareHTML) {
      (event as ParsedEvent).classnames = `timegrid_c${
        event.startDateTime.day() + 1
      } timegrid_rs${event.startDateTime.hour() - 6} timegrid_re${
        event.endDateTime.hour() - 6
      }`;
      (event as ParsedEvent).startTime = event.startDateTime.format("HH:mm");
      (event as ParsedEvent).endTime = event.endDateTime.format("HH:mm");
    }
  }

  return {
    startDate,
    endDate,
    hours,
    days,
    timetable,
  } as ParsedTimetable;
};

export const generateEDT = async (login: string): Promise<string> => {
  const data = await fetchEDT(login, true);

  if ((data as GraphQLResult).errors) {
    throw data;
  }

  let html =
    "<style>" +
    (await readFile(join(__dirname, "/../../dist/css/style.css"))).toString() +
    "</style>";
  html += (await readFile(join(__dirname, "/edt.handlebars"))).toString();

  const filename = hash(data);
  const file = join(basepath, login, `/${filename}.jpg`);

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
    if (!filename)
      sendTimetable(
        login,
        `https://oxypomme.fr/pommebot/edt/${login}/${filename}`,
        (data as ParsedTimetable).startDate,
        (data as ParsedTimetable).endDate
      );
  }
  return filename;
};

export const clearCache = async (): Promise<void> =>
  rmdir(basepath, { recursive: true });
