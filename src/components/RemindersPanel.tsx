
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Bell, Plus } from 'lucide-react';
import { Reminder } from '../hooks/useReminders';

interface RemindersPanelProps {
  reminders: Reminder[];
  onAddReminder: (reminderData: Omit<Reminder, 'id' | 'created_at'>) => Promise<void>;
  onToggleReminder: (id: string, isCompleted: boolean) => void;
  onAddIncome?: (incomeData: any) => Promise<void>;
}

export const RemindersPanel = ({ reminders, onAddReminder, onToggleReminder, onAddIncome }: RemindersPanelProps) => {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const categories = ['loan', 'bill', 'medicine', 'recharge'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !category || !dueDate) return;

    setLoading(true);
    try {
      await onAddReminder({
        title,
        description,
        category,
        due_date: dueDate,
        amount: amount ? parseFloat(amount) : undefined,
        is_completed: false,
      });

      // Reset form
      setTitle('');
      setDescription('');
      setCategory('');
      setDueDate('');
      setAmount('');
      setShowForm(false);
    } catch (error) {
      console.error('Error adding reminder:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleReminder = async (id: string, isCompleted: boolean) => {
    const reminder = reminders.find(r => r.id === id);
    
    // If reminder is being marked as complete and has an amount, add it as income
    if (isCompleted && reminder && reminder.amount && onAddIncome) {
      try {
        await onAddIncome({
          amount: reminder.amount,
          description: `Payment received: ${reminder.title}`,
          category: 'Other',
          date: new Date().toISOString().split('T')[0],
          currency: 'USD',
        });
      } catch (error) {
        console.error('Error adding income from reminder:', error);
      }
    }
    
    onToggleReminder(id, isCompleted);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Bell className="h-5 w-5 text-orange-600" />
            Reminders
          </CardTitle>
          <Button
            onClick={() => setShowForm(!showForm)}
            variant="outline"
            size="sm"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {showForm && (
          <form onSubmit={handleSubmit} className="space-y-4 mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Reminder title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount (optional)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Additional details"
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={loading}>
                {loading ? 'Adding...' : 'Add Reminder'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        )}

        <div className="space-y-3">
          {reminders.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Bell className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No reminders set</p>
              <p className="text-sm">Add reminders for bills, loans, and more</p>
            </div>
          ) : (
            reminders.map((reminder) => (
              <div
                key={reminder.id}
                className={`flex items-center gap-3 p-3 rounded-lg border ${
                  reminder.is_completed ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                }`}
              >
                <Checkbox
                  checked={reminder.is_completed}
                  onCheckedChange={(checked) => handleToggleReminder(reminder.id, checked as boolean)}
                />
                <div className="flex-1">
                  <h4 className={`font-medium ${reminder.is_completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                    {reminder.title}
                  </h4>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="capitalize">{reminder.category}</span>
                    <span>Due: {new Date(reminder.due_date).toLocaleDateString()}</span>
                    {reminder.amount && <span>{formatCurrency(reminder.amount)}</span>}
                  </div>
                  {reminder.description && (
                    <p className="text-sm text-gray-600 mt-1">{reminder.description}</p>
                  )}
                  {reminder.is_completed && reminder.amount && (
                    <p className="text-xs text-green-600 mt-1">✓ Automatically added to income</p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
