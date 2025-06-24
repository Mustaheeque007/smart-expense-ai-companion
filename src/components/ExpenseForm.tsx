
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { PlusCircle, Sparkles } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { toast } from 'sonner';

const categories = [
  'Food & Dining',
  'Transportation',
  'Shopping',
  'Entertainment',
  'Bills & Utilities',
  'Health & Fitness',
  'Travel',
  'Education',
  'Other'
];

export const ExpenseForm = ({ onAddExpense }) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    category: '',
    date: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.amount || !formData.description || !formData.category) {
      toast.error('Please fill in all fields');
      return;
    }

    onAddExpense({
      ...formData,
      amount: parseFloat(formData.amount)
    });

    // Reset form
    setFormData({
      amount: '',
      description: '',
      category: '',
      date: new Date().toISOString().split('T')[0]
    });

    toast.success('Expense added successfully!', {
      description: 'AI has categorized your expense automatically'
    });
  };

  const handleAISuggestion = () => {
    // Simulate AI categorization based on description
    const description = formData.description.toLowerCase();
    let suggestedCategory = '';
    
    if (description.includes('coffee') || description.includes('restaurant') || description.includes('food') || description.includes('lunch')) {
      suggestedCategory = 'Food & Dining';
    } else if (description.includes('gas') || description.includes('uber') || description.includes('taxi')) {
      suggestedCategory = 'Transportation';
    } else if (description.includes('bill') || description.includes('electric') || description.includes('water')) {
      suggestedCategory = 'Bills & Utilities';
    } else {
      suggestedCategory = 'Other';
    }

    setFormData({ ...formData, category: suggestedCategory });
    toast.success('AI suggestion applied!', {
      description: `Category set to ${suggestedCategory}`
    });
  };

  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-xl">
          <PlusCircle className="h-5 w-5 text-blue-600" />
          {t('addExpense')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="amount">{t('amount')}</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="description">{t('description')}</Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="description"
                placeholder="Enter expense description..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleAISuggestion}
                disabled={!formData.description}
                className="shrink-0"
              >
                <Sparkles className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div>
            <Label htmlFor="category">{t('category')}</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select category..." />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="date">{t('date')}</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="mt-1"
            />
          </div>
          
          <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700">
            {t('submit')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
