
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from 'lucide-react';

interface TimeFilterProps {
  timeFilter: string;
  onTimeFilterChange: (filter: string) => void;
}

export const TimeFilter = ({ timeFilter, onTimeFilterChange }: TimeFilterProps) => {
  return (
    <div className="flex items-center gap-2">
      <Calendar className="h-4 w-4 text-gray-600" />
      <Select value={timeFilter} onValueChange={onTimeFilterChange}>
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Time period" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Time</SelectItem>
          <SelectItem value="week">Past Week</SelectItem>
          <SelectItem value="month">Past Month</SelectItem>
          <SelectItem value="year">Past Year</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
