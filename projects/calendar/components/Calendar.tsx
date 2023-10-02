import * as elements from "typed-html";
import { Card } from "@fw/components/Card";
import { Router } from "express";

function getLocaleDayNames(locales: Intl.LocalesArgument = [], weekday: Intl.DateTimeFormatOptions["weekday"] = "long") {
  const date = new Date();
  const day = date.getDay();
  const days: string[] = [];
  for (let i = 0; i < 7; i++) {
    days.push(new Date(date.setDate(day + i)).toLocaleDateString(locales, { weekday }));
  }
  return days;
}

function getFirstDayOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

const GRID_COLUMNS = 7;
const GRID_ROWS = 6;

function Day({ date, selectedMonth }: { date: Date, selectedMonth: number }) {
  const headerColor = date.getMonth() === selectedMonth ? "text-gray-800 dark:text-gray-300" : "text-gray-400 dark:text-gray-500";
  const isToday = date.toDateString() === new Date().toDateString();
  const highlight = isToday ? "underline font-semibold" : "";
  return (
    <div class="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer">
      <h1 class={`text-center ${headerColor} ${highlight}`}>{date.getDate()}</h1>
      <div class="h-16"></div>
    </div>
  );
}

function Navigation({ year, month }: { year: number, month: number }) {
  const previousMonth = month === 0 ? 11 : month - 1;
  const previousYear = month === 0 ? year - 1 : year;
  const nextMonth = month === 11 ? 0 : month + 1;
  const nextYear = month === 11 ? year + 1 : year;
  return (
    <div>
      <button hx-get={`/calendar/${previousYear}/${previousMonth}`}>
        &lt;
      </button>
      <span>{ year } / { month + 1 }</span>
      <button hx-get={`/calendar/${nextYear}/${nextMonth}`}>
        &gt;
      </button>
    </div>
  );
}

export function Calendar({ year = new Date().getFullYear(), month = new Date().getMonth() }: { year?: number, month?: number }) {
  const days = getLocaleDayNames("en-US");
  const firstDayOfMonth = getFirstDayOfMonth(new Date(year, month));
  const firstDayOfMonthDay = firstDayOfMonth.getDay();
  return (
    <Card hx-target="this" hx-swap="outerHTML">
      <header class="text-xl font-bold mb-5 flex flex-row justify-between">
        <span>Calendar</span>
        <Navigation year={year} month={month} />
      </header>
      <div class="grid grid-cols-7">
        {days.map(day => <div class="text-center capitalize p-2">{day}</div>)}
        {new Array(GRID_COLUMNS * GRID_ROWS - days.length).fill(null).map((n, index) => (
          <Day
            date={new Date(year, month, index - firstDayOfMonthDay + 2)}
            selectedMonth={month}
          />
        ))}
      </div>
    </Card>
  );
}

export function handleCalendar() {
  const router = Router();

  router.get("/calendar/:year/:month", (req, res) => {
    const year = parseInt(req.params.year);
    const month = parseInt(req.params.month);
    res.send((
      <Calendar year={year} month={month} />
    ));
  });

  return router;
}