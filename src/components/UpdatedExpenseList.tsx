
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Receipt, Sparkles, File, Image, Edit, Trash } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Expense } from '../hooks/useExpenses';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UpdatedExpenseListProps {
  expenses: Expense[];
  onRefresh: () => void;
}

export const UpdatedExpenseList = ({ expenses, onRefresh }: UpdatedExpenseListProps) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [editAmount, setEditAmount] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editDate, setEditDate] = useState('');
  const [loading, setLoading] = useState(false);

  const categories = [
    'Food & Dining',
    'Transportation',
    'Shopping',
    'Entertainment',
    'Bills & Utilities',
    'Healthcare',
    'Education',
    'Travel',
    'Other'
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const downloadFile = async (filePath: string, fileName: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('expense-attachments')
        .download(filePath);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setEditAmount(expense.amount.toString());
    setEditDescription(expense.description);
    setEditCategory(expense.category);
    setEditDate(expense.date);
  };

  const handleSaveEdit = async () => {
    if (!editingExpense) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('expenses')
        .update({
          amount: parseFloat(editAmount),
          description: editDescription,
          category: editCategory,
          date: editDate,
        })
        .eq('id', editingExpense.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Expense updated successfully!',
      });

      setEditingExpense(null);
      onRefresh();
    } catch (error) {
      console.error('Error updating expense:', error);
      toast({
        title: 'Error',
        description: 'Failed to update expense.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (expenseId: string) => {
    if (!confirm('Are you sure you want to delete this expense?')) return;

    try {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', expenseId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Expense deleted successfully!',
      });

      onRefresh();
    } catch (error) {
      console.error('Error deleting expense:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete expense.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-xl">
          <Receipt className="h-5 w-5 text-blue-600" />
          {t('recentTransactions')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {expenses.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Receipt className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No expenses recorded yet</p>
              <p className="text-sm">Start by adding your first expense above</p>
            </div>
          ) : (
            expenses.map((expense) => (
              <div
                key={expense.id}
                className="flex flex-col p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-gray-900">{expense.description}</h4>
                      {expense.ai_suggested && (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                          <Sparkles className="h-3 w-3 mr-1" />
                          {t('aiCategorized')}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>{expense.category}</span>
                      <span>{formatDate(expense.date)}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg text-gray-900">
                      {formatCurrency(expense.amount)}
                    </div>
                    <div className="flex gap-1 mt-1">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(expense)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit Expense</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <label className="text-sm font-medium">Amount</label>
                              <Input
                                type="number"
                                step="0.01"
                                value={editAmount}
                                onChange={(e) => setEditAmount(e.target.value)}
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium">Description</label>
                              <Input
                                value={editDescription}
                                onChange={(e) => setEditDescription(e.target.value)}
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium">Category</label>
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
                            <div>
                              <label className="text-sm font-medium">Date</label>
                              <Input
                                type="date"
                                value={editDate}
                                onChange={(e) => setEditDate(e.target.value)}
                              />
                            </div>
                            <div className="flex gap-2">
                              <Button onClick={handleSaveEdit} disabled={loading}>
                                {loading ? 'Saving...' : 'Save'}
                              </Button>
                              <Button variant="outline" onClick={() => setEditingExpense(null)}>
                                Cancel
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(expense.id)}
                      >
                        <Trash className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
                
                {expense.attachments && expense.attachments.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-sm font-medium text-gray-700 mb-2">Attachments:</p>
                    <div className="flex flex-wrap gap-2">
                      {expense.attachments.map((attachment) => (
                        <Button
                          key={attachment.id}
                          variant="outline"
                          size="sm"
                          onClick={() => downloadFile(attachment.file_path, attachment.file_name)}
                          className="text-xs"
                        >
                          {attachment.file_type.startsWith('image/') ? (
                            <Image className="h-3 w-3 mr-1" />
                          ) : (
                            <File className="h-3 w-3 mr-1" />
                          )}
                          {attachment.file_name}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
