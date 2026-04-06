import React, { useCallback, useMemo, useState } from 'react';
import { Popover, Select, Tooltip } from 'antd';
import {
  CalendarOutlined,
  LeftOutlined,
  RightOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import type { Dayjs } from 'dayjs';
import type { ActivityDTO } from '@/types/dto/activity.dto';
import './index.less';

dayjs.locale('zh-cn');

const MAX_EVENTS_VISIBLE = 3;

const WEEK_LABELS = ['一', '二', '三', '四', '五', '六', '日'] as const;

function pillClassForTitle(title: string): string {
  if (/文化/.test(title)) return 'event-calendar__event--culture';
  if (/工艺/.test(title)) return 'event-calendar__event--craft';
  if (/展览/.test(title)) return 'event-calendar__event--expo';
  if (/原材料|材料|原木/.test(title)) return 'event-calendar__event--material';
  return 'event-calendar__event--default';
}

function buildMonthGrid(visibleMonth: Dayjs): Dayjs[] {
  const monthStart = visibleMonth.startOf('month');
  const monthEnd = visibleMonth.endOf('month');
  const startDow = monthStart.day();
  const leadingBlank = startDow === 0 ? 6 : startDow - 1;
  const gridStart = monthStart.subtract(leadingBlank, 'day');
  const daysInMonth = monthEnd.date();
  const totalUsed = leadingBlank + daysInMonth;
  const rows = Math.ceil(totalUsed / 7);
  const cellCount = rows * 7;
  return Array.from({ length: cellCount }, (_, i) => gridStart.add(i, 'day'));
}

function activityDayKey(a: ActivityDTO): string | null {
  const d = dayjs(a.date);
  return d.isValid() ? d.format('YYYY-MM-DD') : null;
}

interface EventCalendarProps {
  activities: ActivityDTO[];
  onActivityClick: (activity: ActivityDTO) => void;
}

function chunkWeeks<T>(days: T[]): T[][] {
  const rows: T[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    rows.push(days.slice(i, i + 7));
  }
  return rows;
}

const EventCalendar: React.FC<EventCalendarProps> = ({
  activities,
  onActivityClick,
}) => {
  const [cursorMonth, setCursorMonth] = useState<Dayjs>(() =>
    dayjs().startOf('month')
  );
  const [selectedDay, setSelectedDay] = useState<Dayjs | null>(() => dayjs());

  const getActivitiesForDate = useCallback(
    (date: Dayjs) => {
      const key = date.format('YYYY-MM-DD');
      return activities.filter((a) => activityDayKey(a) === key);
    },
    [activities]
  );

  const monthStats = useMemo(() => {
    const y = cursorMonth.year();
    const m = cursorMonth.month();
    const inMonth = activities.filter((a) => {
      const k = activityDayKey(a);
      if (!k) return false;
      const d = dayjs(k);
      return d.year() === y && d.month() === m;
    });
    const daysWithEvents = new Set(
      inMonth.map((a) => activityDayKey(a)).filter(Boolean)
    ).size;
    return { count: inMonth.length, activeDays: daysWithEvents };
  }, [activities, cursorMonth]);

  /** 本月按日期排序的议程，用于顶部速览带，减轻「大空白」感 */
  const monthAgendaSorted = useMemo(() => {
    const y = cursorMonth.year();
    const m = cursorMonth.month();
    return activities
      .filter((a) => {
        const k = activityDayKey(a);
        if (!k) return false;
        const d = dayjs(k);
        return d.year() === y && d.month() === m;
      })
      .sort((a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf());
  }, [activities, cursorMonth]);

  const ribbonItems = useMemo(
    () => monthAgendaSorted.slice(0, 8),
    [monthAgendaSorted]
  );

  const selectedDayCount = selectedDay
    ? getActivitiesForDate(selectedDay).length
    : 0;

  const gridDays = useMemo(() => buildMonthGrid(cursorMonth), [cursorMonth]);

  const gridWeeks = useMemo(() => chunkWeeks(gridDays), [gridDays]);

  const yearOptions = useMemo(() => {
    const y = cursorMonth.year();
    const start = y - 12;
    const end = y + 8;
    return Array.from({ length: end - start + 1 }, (_, i) => {
      const year = start + i;
      return { value: year, label: `${year}年` };
    });
  }, [cursorMonth]);

  const monthOptions = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => ({
        value: i,
        label: dayjs().month(i).format('M月'),
      })),
    []
  );

  const goPrevMonth = () => setCursorMonth((d) => d.subtract(1, 'month'));
  const goNextMonth = () => setCursorMonth((d) => d.add(1, 'month'));
  const goToday = () => {
    const n = dayjs();
    setCursorMonth(n.startOf('month'));
    setSelectedDay(n);
  };

  const titleText = cursorMonth.format('YYYY年M月');
  const now = dayjs();

  return (
    <div className="event-calendar">
      <div className="event-calendar__meta" aria-live="polite">
        <div className="event-calendar__meta-brand">
          <span className="event-calendar__meta-icon" aria-hidden>
            <CalendarOutlined />
          </span>
          <div className="event-calendar__meta-main">
            <span className="event-calendar__meta-kicker">本月排期</span>
            <div className="event-calendar__meta-metrics">
              <div className="event-calendar__metric">
                <span className="event-calendar__metric-value">
                  {monthStats.count}
                </span>
                <span className="event-calendar__metric-label">场活动</span>
              </div>
              <div className="event-calendar__metric-divider" aria-hidden />
              <div className="event-calendar__metric">
                <span className="event-calendar__metric-value">
                  {monthStats.activeDays}
                </span>
                <span className="event-calendar__metric-label">个有排期日</span>
              </div>
            </div>
            {selectedDay ? (
              <p className="event-calendar__meta-focus">
                {selectedDay.isSame(now, 'day') ? (
                  <>今日聚焦 · </>
                ) : (
                  <>已选 {selectedDay.format('M月D日')} · </>
                )}
                {selectedDayCount > 0 ? (
                  <strong>{selectedDayCount} 场</strong>
                ) : (
                  <span className="event-calendar__meta-focus--muted">
                    当日暂无活动
                  </span>
                )}
              </p>
            ) : null}
          </div>
        </div>
        <button
          type="button"
          className="event-calendar__today-pill"
          onClick={goToday}
        >
          今天
        </button>
      </div>

      {ribbonItems.length > 0 ? (
        <div
          className="event-calendar__ribbon"
          aria-label="本月活动速览，可快速打开详情"
        >
          <span className="event-calendar__ribbon-label">速览</span>
          <div className="event-calendar__ribbon-track">
            {ribbonItems.map((activity) => {
              const d = dayjs(activity.date);
              return (
                <button
                  key={activity.id}
                  type="button"
                  className={`event-calendar__ribbon-card event-calendar__chip ${pillClassForTitle(activity.title)}`}
                  onClick={() => onActivityClick(activity)}
                >
                  <span className="event-calendar__chip-date">
                    {d.format('M/D')}
                  </span>
                  <span className="event-calendar__chip-title">
                    {activity.title}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      <div className="event-calendar__chrome">
        <div className="event-calendar__nav">
          <div className="event-calendar__nav-primary">
            <button
              type="button"
              className="event-calendar__icon-btn"
              aria-label="上一月"
              onClick={goPrevMonth}
            >
              <LeftOutlined />
            </button>
            <h2 className="event-calendar__title">{titleText}</h2>
            <button
              type="button"
              className="event-calendar__icon-btn"
              aria-label="下一月"
              onClick={goNextMonth}
            >
              <RightOutlined />
            </button>
          </div>
          <div className="event-calendar__nav-jump">
            <Select
              size="middle"
              className="event-calendar__select event-calendar__select--year"
              popupMatchSelectWidth={false}
              options={yearOptions}
              value={cursorMonth.year()}
              onChange={(y) =>
                setCursorMonth(cursorMonth.year(y).startOf('month'))
              }
              aria-label="选择年份"
            />
            <Select
              size="middle"
              className="event-calendar__select event-calendar__select--month"
              popupMatchSelectWidth={false}
              options={monthOptions}
              value={cursorMonth.month()}
              onChange={(m) =>
                setCursorMonth(cursorMonth.month(m).startOf('month'))
              }
              aria-label="选择月份"
            />
          </div>
        </div>

        <div className="event-calendar__weekdays" role="row">
          {WEEK_LABELS.map((label, idx) => (
            <div
              key={label}
              className={`event-calendar__weekday${idx >= 5 ? ' event-calendar__weekday--weekend' : ''}`}
              role="columnheader"
            >
              {label}
            </div>
          ))}
        </div>

        <div className="event-calendar__grid" role="grid" aria-label="活动月历">
          {gridWeeks.map((week, wi) => (
            <div key={wi} role="row" className="event-calendar__row">
              {week.map((date) => {
                const inMonth = date.month() === cursorMonth.month();
                const isToday = date.isSame(now, 'day');
                const isSelected = selectedDay?.isSame(date, 'day') ?? false;
                const list = getActivitiesForDate(date);
                const visible = list.slice(0, MAX_EVENTS_VISIBLE);
                const overflow = list.slice(MAX_EVENTS_VISIBLE);
                const overflowCount = overflow.length;

                const cellClasses = [
                  'event-calendar__day',
                  !inMonth && 'event-calendar__day--outside',
                  inMonth && list.length === 0 && 'event-calendar__day--empty',
                  isToday && 'event-calendar__day--today',
                  isSelected && 'event-calendar__day--selected',
                ]
                  .filter(Boolean)
                  .join(' ');

                return (
                  <div
                    key={date.format('YYYY-MM-DD')}
                    role="gridcell"
                    className={cellClasses}
                    aria-label={`${date.format('M月D日')}${
                      list.length ? `，${list.length} 场活动` : ''
                    }`}
                    onClick={() => setSelectedDay(date)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelectedDay(date);
                      }
                    }}
                    tabIndex={isSelected ? 0 : -1}
                  >
                    <div className="event-calendar__day-num">{date.date()}</div>
                    <div className="event-calendar__day-events">
                      {visible.map((activity) => (
                        <Tooltip
                          key={activity.id}
                          title={
                            <span className="event-calendar__tip">
                              <strong>{activity.title}</strong>
                              <br />
                              {activity.description?.slice(0, 160)}
                              {activity.description &&
                              activity.description.length > 160
                                ? '…'
                                : ''}
                            </span>
                          }
                          placement="topLeft"
                          mouseEnterDelay={0.35}
                        >
                          <button
                            type="button"
                            className={`event-calendar__event event-calendar__chip ${pillClassForTitle(activity.title)}`}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              onActivityClick(activity);
                            }}
                            aria-label={`查看活动：${activity.title}`}
                          >
                            <span className="event-calendar__chip-title">
                              {activity.title}
                            </span>
                          </button>
                        </Tooltip>
                      ))}
                      {overflowCount > 0 ? (
                        <Popover
                          placement="bottomLeft"
                          trigger={['click']}
                          styles={{ content: { padding: 8, maxWidth: 320 } }}
                          content={
                            <ul className="event-calendar__overflow-list">
                              {overflow.map((activity) => (
                                <li key={activity.id}>
                                  <button
                                    type="button"
                                    className="event-calendar__overflow-item"
                                    onClick={() => onActivityClick(activity)}
                                  >
                                    {activity.title}
                                  </button>
                                </li>
                              ))}
                            </ul>
                          }
                        >
                          <button
                            type="button"
                            className="event-calendar__more-btn"
                            onClick={(e) => e.stopPropagation()}
                            aria-label={`另有 ${overflowCount} 场，点击查看`}
                          >
                            +{overflowCount} 场
                          </button>
                        </Popover>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EventCalendar;
