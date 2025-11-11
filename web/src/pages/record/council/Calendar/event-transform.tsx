import { SummonCalendarCase, SummonEvent } from "./summon-types";

export const transformToEvents = (cases: SummonCalendarCase[]): SummonEvent[] => {
  const events: SummonEvent[] = [];

  cases.forEach(summonCase => {  
    if (summonCase.hearing_schedules && summonCase.hearing_schedules.length > 0) {
      summonCase.hearing_schedules.forEach(schedule => {  
        const startDate = new Date(`${schedule.summon_date.sd_date}T${schedule.summon_time.st_start_time}`);
        const endDate = new Date(startDate);
        endDate.setHours(startDate.getHours() + 1);
        
        events.push({
          id: schedule.hs_id,
          title: summonCase.sc_code,  
          start: startDate.toISOString(),
          end: endDate.toISOString(),
          sc_code: summonCase.sc_code,  
          complainant_names: summonCase.complainant_names,
          accused_names: summonCase.accused_names,
          incident_type: summonCase.incident_type,
          hs_level: schedule.hs_level,
          hearing_date: schedule.summon_date.sd_date,
          hearing_time: schedule.summon_time.st_start_time
        });
      });
    }
  });

  return events;
};