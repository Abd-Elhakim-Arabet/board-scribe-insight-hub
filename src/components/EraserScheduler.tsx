import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Trash2, Plus, Clock, Calendar as CalendarIcon, Save } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/services/api';

export interface ScheduleTask {
  id?: number;
  eraserId: string;
  tasktype: 'capture' | 'erase' | 'capture_erase';
  scheduletype: 'time' | 'interval' | 'weekly';
  schedulevalue: string; // For time: "14:30", for interval: "30", for weekly: "monday"
  intervalunit?: 'minutes' | 'hours' | 'days'; // Only for interval type
  isactive: boolean;
  description?: string;
  createdat?: string;
  lastRun?: string;
  nextrun?: string;
}

interface EraserSchedulerProps {
  eraserId: string;
}

const EraserScheduler: React.FC<EraserSchedulerProps> = ({ eraserId }) => {
  const [schedules, setSchedules] = useState<ScheduleTask[]>([]);
  const [newSchedule, setNewSchedule] = useState<Partial<ScheduleTask>>({
    tasktype: 'capture',
    scheduletype: 'time',
    schedulevalue: '',
    intervalunit: 'minutes',
    isactive: true,
    description: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();

  // Days of the week for weekly scheduling
  const daysOfWeek = [
    'monday', 'tuesday', 'wednesday', 'thursday', 
    'friday', 'saturday', 'sunday'
  ];

  // Task types with descriptions (following Python schedule patterns)
  const tasktypes = [
    { value: 'capture', label: 'Capture Image', description: 'Take a photo of the board' },
    { value: 'erase', label: 'Erase Board', description: 'Clear the board contents' },
    { value: 'capture_erase', label: 'Capture & Erase', description: 'Take photo then erase' }
  ];

  // Schedule types (following Python schedule patterns)
  const scheduletypes = [
    { value: 'time', label: 'At Specific Time', description: 'Run at a specific time each day (e.g., every().day.at("10:30"))' },
    { value: 'interval', label: 'Every X Time', description: 'Run at regular intervals (e.g., every(30).minutes)' },
    { value: 'weekly', label: 'Weekly on Day', description: 'Run weekly on specific day (e.g., every().monday.at("09:00"))' }
  ];

  useEffect(() => {
    fetchSchedules();
  }, [eraserId]);

  const fetchSchedules = async () => {
    try {
      const { data, error } = await supabase
        .from('eraser_schedules')
        .select('*')
        .eq('eraserid', eraserId)
        .order('createdat', { ascending: false });

      if (error) throw error;
      setSchedules(data || []);
    } catch (error) {
      console.error('Error fetching schedules:', error);
      toast({
        title: "Error",
        description: "Failed to load schedules",
        variant: "destructive",
      });
    }
  };

  const calculatenextrun = (schedule: Partial<ScheduleTask>): string => {
    const now = new Date();
    let nextrun = new Date();

    switch (schedule.scheduletype) {
      case 'time':
        // Daily at specific time
        const [hours, minutes] = schedule.schedulevalue!.split(':').map(Number);
        nextrun.setHours(hours, minutes, 0, 0);
        if (nextrun <= now) {
          nextrun.setDate(nextrun.getDate() + 1);
        }
        break;

      case 'interval':
        // Interval-based
        const interval = parseInt(schedule.schedulevalue!);
        switch (schedule.intervalunit) {
          case 'minutes':
            nextrun = new Date(now.getTime() + interval * 60 * 1000);
            break;
          case 'hours':
            nextrun = new Date(now.getTime() + interval * 60 * 60 * 1000);
            break;
          case 'days':
            nextrun = new Date(now.getTime() + interval * 24 * 60 * 60 * 1000);
            break;
        }
        break;

      case 'weekly':
        // Weekly on specific day
        const targetDay = daysOfWeek.indexOf(schedule.schedulevalue!);
        const currentDay = now.getDay() === 0 ? 6 : now.getDay() - 1; // Convert Sunday=0 to Monday=0
        let daysUntilTarget = targetDay - currentDay;
        if (daysUntilTarget <= 0) {
          daysUntilTarget += 7;
        }
        nextrun = new Date(now.getTime() + daysUntilTarget * 24 * 60 * 60 * 1000);
        nextrun.setHours(9, 0, 0, 0); // Default to 9 AM for weekly tasks
        break;
    }

    return nextrun.toISOString();
  };

  const createSchedule = async () => {
    if (!newSchedule.schedulevalue || !newSchedule.tasktype || !newSchedule.scheduletype) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const nextrun = calculatenextrun(newSchedule);
      
      const scheduleData = {
        eraserid: eraserId,
        tasktype: newSchedule.tasktype,
        scheduletype: newSchedule.scheduletype,
        schedulevalue: newSchedule.schedulevalue,
        intervalunit: newSchedule.intervalunit,
        isactive: newSchedule.isactive,
        description: newSchedule.description || '',
        createdat: new Date().toISOString(),
        nextrun: nextrun
      };

      const { error } = await supabase
        .from('eraser_schedules')
        .insert([scheduleData]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Schedule created successfully",
      });

      // Reset form and refresh schedules
      setNewSchedule({
        tasktype: 'capture',
        scheduletype: 'time',
        schedulevalue: '',
        intervalunit: 'minutes',
        isactive: true,
        description: ''
      });
      setShowForm(false);
      fetchSchedules();
    } catch (error) {
      console.error('Error creating schedule:', error);
      toast({
        title: "Error",
        description: "Failed to create schedule",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleScheduleStatus = async (scheduleId: number, isactive: boolean) => {
    try {
      const { error } = await supabase
        .from('eraser_schedules')
        .update({ isactive })
        .eq('id', scheduleId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Schedule ${isactive ? 'activated' : 'deactivated'}`,
      });

      fetchSchedules();
    } catch (error) {
      console.error('Error updating schedule:', error);
      toast({
        title: "Error",
        description: "Failed to update schedule",
        variant: "destructive",
      });
    }
  };

  const deleteSchedule = async (scheduleId: number) => {
    try {
      const { error } = await supabase
        .from('eraser_schedules')
        .delete()
        .eq('id', scheduleId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Schedule deleted successfully",
      });

      fetchSchedules();
    } catch (error) {
      console.error('Error deleting schedule:', error);
      toast({
        title: "Error",
        description: "Failed to delete schedule",
        variant: "destructive",
      });
    }
  };

  const formatScheduleDescription = (schedule: ScheduleTask): string => {
    let description = `every()`;
    
    switch (schedule.scheduletype) {
      case 'time':
        description += `.day.at("${schedule.schedulevalue}")`;
        break;
      case 'interval':
        description += `(${schedule.schedulevalue}).${schedule.intervalunit}`;
        break;
      case 'weekly':
        description += `.${schedule.schedulevalue}.at("09:00")`;
        break;
    }

    return description;
  };

  const formatnextrun = (nextrun: string): string => {
    const date = new Date(nextrun);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    
    if (diffMs < 0) return 'Overdue';
    
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffDays > 0) return `in ${diffDays}d ${diffHours}h`;
    if (diffHours > 0) return `in ${diffHours}h ${diffMinutes}m`;
    return `in ${diffMinutes}m`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Scheduled Tasks</h3>
          <p className="text-sm text-gray-500">
            Automate eraser actions using Python schedule-like syntax
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Schedule
        </Button>
      </div>

      {/* Create New Schedule Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Create New Schedule</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Task Type */}
              <div className="space-y-2">
                <Label htmlFor="tasktype">Task Type</Label>
                <Select
                  value={newSchedule.tasktype}
                  onValueChange={(value) => setNewSchedule({ ...newSchedule, tasktype: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select task type" />
                  </SelectTrigger>
                  <SelectContent>
                    {tasktypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div>
                          <div className="font-medium">{type.label}</div>
                          <div className="text-xs text-gray-500">{type.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Schedule Type */}
              <div className="space-y-2">
                <Label htmlFor="scheduletype">Schedule Type</Label>
                <Select
                  value={newSchedule.scheduletype}
                  onValueChange={(value) => setNewSchedule({ ...newSchedule, scheduletype: value as any, schedulevalue: '' })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select schedule type" />
                  </SelectTrigger>
                  <SelectContent>
                    {scheduletypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div>
                          <div className="font-medium">{type.label}</div>
                          <div className="text-xs text-gray-500">{type.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Schedule Value Input */}
            <div className="space-y-2">
              <Label htmlFor="schedulevalue">
                {newSchedule.scheduletype === 'time' && 'Time (HH:MM)'}
                {newSchedule.scheduletype === 'interval' && 'Interval Value'}
                {newSchedule.scheduletype === 'weekly' && 'Day of Week'}
              </Label>
              
              {newSchedule.scheduletype === 'time' && (
                <Input
                  type="time"
                  value={newSchedule.schedulevalue || ''}
                  onChange={(e) => setNewSchedule({ ...newSchedule, schedulevalue: e.target.value })}
                  placeholder="14:30"
                />
              )}

              {newSchedule.scheduletype === 'interval' && (
                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={newSchedule.schedulevalue || ''}
                    onChange={(e) => setNewSchedule({ ...newSchedule, schedulevalue: e.target.value })}
                    placeholder="30"
                    min="1"
                  />
                  <Select
                    value={newSchedule.intervalunit}
                    onValueChange={(value) => setNewSchedule({ ...newSchedule, intervalunit: value as any })}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="minutes">Minutes</SelectItem>
                      <SelectItem value="hours">Hours</SelectItem>
                      <SelectItem value="days">Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {newSchedule.scheduletype === 'weekly' && (
                <Select
                  value={newSchedule.schedulevalue}
                  onValueChange={(value) => setNewSchedule({ ...newSchedule, schedulevalue: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select day" />
                  </SelectTrigger>
                  <SelectContent>
                    {daysOfWeek.map((day) => (
                      <SelectItem key={day} value={day}>
                        {day.charAt(0).toUpperCase() + day.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Input
                value={newSchedule.description || ''}
                onChange={(e) => setNewSchedule({ ...newSchedule, description: e.target.value })}
                placeholder="Daily board cleanup at end of lectures"
              />
            </div>

            {/* Active Toggle */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isactive"
                checked={newSchedule.isactive}
                onCheckedChange={(checked) => setNewSchedule({ ...newSchedule, isactive: !!checked })}
              />
              <Label htmlFor="isactive">Start this schedule immediately</Label>
            </div>

            {/* Python Schedule Preview */}
            {newSchedule.schedulevalue && (
              <div className="p-3 bg-gray-50 rounded-md border">
                <Label className="text-xs text-gray-600">Python Schedule Equivalent:</Label>
                <code className="block text-sm font-mono mt-1 text-blue-600">
                  schedule.{formatScheduleDescription({ ...newSchedule } as ScheduleTask)}.do(job)
                </code>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button onClick={createSchedule} disabled={isLoading}>
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? 'Creating...' : 'Create Schedule'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Existing Schedules */}
      <div className="space-y-4">
        {schedules.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No scheduled tasks yet.</p>
              <p className="text-sm text-gray-400 mt-1">
                Create your first schedule to automate eraser actions.
              </p>
            </CardContent>
          </Card>
        ) : (
          schedules.map((schedule) => (
            <Card key={schedule.id} className={schedule.isactive ? 'border-green-200 bg-green-50' : 'border-gray-200'}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium">
                        {tasktypes.find(t => t.value === schedule.tasktype)?.label}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        schedule.isactive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {schedule.isactive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-600 space-y-1">
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">
                          schedule.{formatScheduleDescription(schedule)}.do(job)
                        </code>
                      </div>
                      
                      {schedule.description && (
                        <p className="text-sm">{schedule.description}</p>
                      )}
                      
                      {schedule.nextrun && (
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="h-3 w-3" />
                          <span className="text-xs">
                            Next run: {new Date(schedule.nextrun).toLocaleString()} ({formatnextrun(schedule.nextrun)})
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={schedule.isactive}
                      onCheckedChange={(checked) => toggleScheduleStatus(schedule.id!, !!checked)}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteSchedule(schedule.id!)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default EraserScheduler;
