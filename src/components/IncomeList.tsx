
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { TrendingUp, Edit, Trash2, FileText, Image } from 'lucide-react';
import { Income } from '../hooks/useIncome';

interface IncomeListProps {
  income: Income[];
  onUpdate: (id: string, data: Partial<Income>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onRefresh: () => void;
}

export const IncomeList = ({ income, onUpdate, onDelete, onRefresh }: IncomeListProps) => {
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);
  const [editAmount, setEditAmount] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editCurrency, setEditCurrency] = useState('USD');
  const [editDate, setEditDate] = useState('');
  const [loading, setLoading] = useState(false);

  const categories = [
    'Salary',
    'Freelance',
    'Business',
    'Investments',
    'Rental',
    'Bonus',
    'Gift',
    'Other'
  ];

  const currencies = [
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
    { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
    { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
    { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  ];

  const handleEdit = (incomeItem: Income) => {
    setEditingIncome(incomeItem);
    setEditAmount(incomeItem.amount.toString());
    setEditDescription(incomeItem.description);
    setEditCategory(incomeItem.category);
    setEditCurrency(incomeItem.currency || 'USD');
    setEditDate(incomeItem.date);
  };

  const handleUpdate = async () => {
    if (!editingIncome) return;

    setLoading(true);
    try {
      await onUpdate(editingIncome.id, {
        amount: parseFloat(editAmount),
        description: editDescription,
        category: editCategory,
        currency: editCurrency,
        date: editDate,
      });
      setEditingIncome(null);
      onRefresh();
    } catch (error) {
      console.error('Error updating income:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this income record?')) {
      try {
        await onDelete(id);
        onRefresh();
      } catch (error) {
        console.error('Error deleting income:', error);
      }
    }
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    const currencyInfo = currencies.find(c => c.code === currency);
    return `${currencyInfo?.symbol || '$'}${amount.toFixed(2)}`;
  };

  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-xl">
          <TrendingUp className="h-5 w-5 text-green-600" />
          Income Sources
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {income.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <TrendingUp className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No income records found</p>
              <p className="text-sm">Add some income to get started</p>
            </div>
          ) : (
            income.map((incomeItem) => (
              <div
                key={incomeItem.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div>
                      <h4 className="font-medium text-gray-900">{incomeItem.description}</h4>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="capitalize">{incomeItem.category}</span>
                        <span>{new Date(incomeItem.date).toLocaleDateString()}</span>
                        <span className="font-semibold text-green-600">
                          {formatCurrency(incomeItem.amount, incomeItem.currency)}
                        </span>
                      </div>
                      {incomeItem.file_attachments && incomeItem.file_attachments.length > 0 && (
                        <div className="flex items-center gap-1 mt-1">
                          {incomeItem.file_attachments.map((file, index) => (
                            <span key={index} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                              {file.includes('.pdf') ? (
                                <FileText className="h-3 w-3 inline mr-1" />
                              ) : (
                                <Image className="h-3 w-3 inline mr-1" />
                              )}
                              Attachment
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(incomeItem)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Income</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="editAmount">Amount</Label>
                            <Input
                              id="editAmount"
                              type="number"
                              step="0.01"
                              value={editAmount}
                              onChange={(e) => setEditAmount(e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="editCurrency">Currency</Label>
                            <Select value={editCurrency} onValueChange={setEditCurrency}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {currencies.map((curr) => (
                                  <SelectItem key={curr.code} value={curr.code}>
                                    {curr.symbol} {curr.code}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="editDescription">Description</Label>
                          <Input
                            id="editDescription"
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="editCategory">Category</Label>
                          <Select value={editCategory} onValueChange={setEditCategory}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map((cat) => (
                                <SelectItem key={cat} value={cat}>
                                  {cat}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="editDate">Date</Label>
                          <Input
                            id="editDate"
                            type="date"
                            value={editDate}
                            onChange={(e) => setEditDate(e.target.value)}
                          />
                        </div>

                        <Button onClick={handleUpdate} disabled={loading} className="w-full">
                          {loading ? 'Updating...' : 'Update Income'}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(incomeItem.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
