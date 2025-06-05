-- Create eraser_schedules table for Python schedule-like functionality
CREATE TABLE IF NOT EXISTS public.eraser_schedules (
    id SERIAL PRIMARY KEY,
    eraserId VARCHAR NOT NULL,
    tasktype VARCHAR NOT NULL CHECK (tasktype IN ('capture', 'erase', 'capture_erase')),
    scheduletype VARCHAR NOT NULL CHECK (scheduletype IN ('time', 'interval', 'weekly')),
    schedulevalue VARCHAR NOT NULL, -- For time: "14:30", for interval: "30", for weekly: "monday"
    intervalunit VARCHAR CHECK (intervalunit IN ('minutes', 'hours', 'days')), -- Only for interval type
    isactive BOOLEAN NOT NULL DEFAULT true,
    description TEXT,
    createdat TIMESTAMPTZ NOT NULL DEFAULT now(),
    lastRun TIMESTAMPTZ,
    nextrun TIMESTAMPTZ,
    
    -- Add foreign key constraint to eraser table
    CONSTRAINT fk_eraser_schedules_eraser 
        FOREIGN KEY (eraserId) 
        REFERENCES public.Eraser(id) 
        ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_eraser_schedules_eraser_id ON public.eraser_schedules(eraserId);
CREATE INDEX IF NOT EXISTS idx_eraser_schedules_active ON public.eraser_schedules(isactive);
CREATE INDEX IF NOT EXISTS idx_eraser_schedules_next_run ON public.eraser_schedules(nextrun) WHERE isactive = true;

-- Enable Row Level Security (RLS)
ALTER TABLE public.eraser_schedules ENABLE ROW LEVEL SECURITY;

-- Create policies for eraser_schedules
-- Allow all operations for authenticated users (you might want to restrict this based on your needs)
CREATE POLICY "Allow all operations on eraser_schedules for authenticated users" 
    ON public.eraser_schedules 
    FOR ALL 
    TO authenticated 
    USING (true);

-- Allow read access for anonymous users (adjust as needed)
CREATE POLICY "Allow read access on eraser_schedules for anonymous users" 
    ON public.eraser_schedules 
    FOR SELECT 
    TO anon 
    USING (true);

-- Grant necessary permissions
GRANT ALL ON public.eraser_schedules TO authenticated;
GRANT SELECT ON public.eraser_schedules TO anon;
GRANT USAGE, SELECT ON SEQUENCE public.eraser_schedules_id_seq TO authenticated;

-- Function to calculate next run time for schedules (optional helper function)
CREATE OR REPLACE FUNCTION public.calculate_next_schedule_run(
    schedule_type VARCHAR,
    schedule_value VARCHAR,
    interval_unit VARCHAR DEFAULT NULL,
    base_time TIMESTAMPTZ DEFAULT now()
) RETURNS TIMESTAMPTZ
LANGUAGE plpgsql
AS $$
DECLARE
    next_run TIMESTAMPTZ;
    target_hour INTEGER;
    target_minute INTEGER;
    target_day INTEGER;
    current_day INTEGER;
    days_until_target INTEGER;
    interval_val INTEGER;
BEGIN
    CASE schedule_type
        WHEN 'time' THEN
            -- Daily at specific time
            target_hour := CAST(split_part(schedule_value, ':', 1) AS INTEGER);
            target_minute := CAST(split_part(schedule_value, ':', 2) AS INTEGER);
            
            next_run := date_trunc('day', base_time) + 
                       make_interval(hours => target_hour, mins => target_minute);
            
            -- If the time has already passed today, schedule for tomorrow
            IF next_run <= base_time THEN
                next_run := next_run + interval '1 day';
            END IF;
            
        WHEN 'interval' THEN
            -- Interval-based
            interval_val := CAST(schedule_value AS INTEGER);
            
            CASE interval_unit
                WHEN 'minutes' THEN
                    next_run := base_time + make_interval(mins => interval_val);
                WHEN 'hours' THEN
                    next_run := base_time + make_interval(hours => interval_val);
                WHEN 'days' THEN
                    next_run := base_time + make_interval(days => interval_val);
                ELSE
                    RAISE EXCEPTION 'Invalid interval unit: %', interval_unit;
            END CASE;
            
        WHEN 'weekly' THEN
            -- Weekly on specific day (default to 9 AM)
            target_day := CASE schedule_value
                WHEN 'monday' THEN 1
                WHEN 'tuesday' THEN 2
                WHEN 'wednesday' THEN 3
                WHEN 'thursday' THEN 4
                WHEN 'friday' THEN 5
                WHEN 'saturday' THEN 6
                WHEN 'sunday' THEN 0
                ELSE RAISE EXCEPTION 'Invalid day: %', schedule_value
            END;
            
            current_day := EXTRACT(dow FROM base_time);
            days_until_target := target_day - current_day;
            
            IF days_until_target <= 0 THEN
                days_until_target := days_until_target + 7;
            END IF;
            
            next_run := date_trunc('day', base_time) + 
                       make_interval(days => days_until_target, hours => 9);
                       
        ELSE
            RAISE EXCEPTION 'Invalid schedule type: %', schedule_type;
    END CASE;
    
    RETURN next_run;
END;
$$;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.calculate_next_schedule_run(VARCHAR, VARCHAR, VARCHAR, TIMESTAMPTZ) TO authenticated;

-- Trigger function to automatically calculate nextrun on insert/update
CREATE OR REPLACE FUNCTION public.update_schedule_next_run()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Only calculate next run if the schedule is active
    IF NEW.isactive THEN
        NEW.nextrun := public.calculate_next_schedule_run(
            NEW.scheduletype,
            NEW.schedulevalue,
            NEW.intervalunit,
            COALESCE(NEW.createdat, now())
        );
    ELSE
        NEW.nextrun := NULL;
    END IF;
    
    RETURN NEW;
END;
$$;

-- Create trigger to automatically update nextrun
CREATE TRIGGER trigger_update_schedule_next_run
    BEFORE INSERT OR UPDATE ON public.eraser_schedules
    FOR EACH ROW
    EXECUTE FUNCTION public.update_schedule_next_run();

-- Comment on table and columns for documentation
COMMENT ON TABLE public.eraser_schedules IS 'Scheduled tasks for erasers, following Python schedule library patterns';
COMMENT ON COLUMN public.eraser_schedules.scheduletype IS 'Type of schedule: time (daily at specific time), interval (every X units), weekly (specific day)';
COMMENT ON COLUMN public.eraser_schedules.schedulevalue IS 'Schedule value: time format HH:MM, interval number, or day name';
COMMENT ON COLUMN public.eraser_schedules.intervalunit IS 'Unit for interval schedules: minutes, hours, or days';
COMMENT ON COLUMN public.eraser_schedules.tasktype IS 'Type of task to execute: capture, erase, or capture_erase';
