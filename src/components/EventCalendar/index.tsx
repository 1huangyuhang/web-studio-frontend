import React, { useCallback, useState } from 'react';
import { Activity } from '@/types/activity';
import { Calendar } from 'antd';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import './index.less';

interface EventCalendarProps {
  activities: Activity[];
  onActivityClick: (activity: Activity) => void;
}

const EventCalendar: React.FC<EventCalendarProps> = ({
  activities,
  onActivityClick,
}) => {
  // 保存当前显示的日期
  const [currentDate, setCurrentDate] = useState<Dayjs>(dayjs());

  // 获取指定日期的活动
  const getActivitiesForDate = useCallback(
    (date: Dayjs) => {
      const formattedDate = date.format('YYYY-MM-DD');
      return activities.filter((activity) => {
        const activityDate = dayjs(activity.date).format('YYYY-MM-DD');
        return activityDate === formattedDate;
      });
    },
    [activities]
  );

  // 渲染日历单元格内容
  const renderCell = useCallback(
    (current: Dayjs) => {
      const dayActivities = getActivitiesForDate(current);

      // 只渲染活动列表，日期数字由Ant Design自动处理
      if (dayActivities.length > 0) {
        return (
          <div className="event-list" role="list" aria-label="当天活动">
            {dayActivities.map((activity) => (
              <div
                key={activity.id}
                className="event-item"
                onClick={() => onActivityClick(activity)}
                role="listitem"
                aria-label={`活动: ${activity.title}`}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    onActivityClick(activity);
                  }
                }}
              >
                <div className="event-title">{activity.title}</div>
              </div>
            ))}
          </div>
        );
      }

      // 没有活动时返回null，不渲染任何内容
      return null;
    },
    [getActivitiesForDate, onActivityClick]
  );

  // 处理日历月份变化
  const handleDateChange = useCallback((value: Dayjs | null) => {
    if (value) {
      setCurrentDate(value);
    }
  }, []);

  return (
    <div className="event-calendar">
      <Calendar
        fullscreen={false}
        dateCellRender={renderCell}
        value={currentDate}
        onChange={handleDateChange}
      />
    </div>
  );
};

export default EventCalendar;
