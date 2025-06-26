
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { FileText, Mail } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Expense } from '../hooks/useExpenses';
import { Income } from '../hooks/useIncome';

interface ReportGeneratorProps {
  expenses: Expense[];
  income: Income[];
}

export const ReportGenerator = ({ expenses, income }: ReportGeneratorProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reportType, setReportType] = useState('monthly');
  const [reportPeriod, setReportPeriod] = useState('');
  const [customRequirements, setCustomRequirements] = useState('');
  const [loading, setLoading] = useState(false);

  const generateReport = () => {
    const currentDate = new Date();
    let filteredExpenses = expenses;
    let filteredIncome = income;
    let periodLabel = '';

    // Filter data based on report type
    switch (reportType) {
      case 'monthly':
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();
        filteredExpenses = expenses.filter(exp => {
          const expDate = new Date(exp.date);
          return expDate.getMonth() === currentMonth && expDate.getFullYear() === currentYear;
        });
        filteredIncome = income.filter(inc => {
          const incDate = new Date(inc.date);
          return incDate.getMonth() === currentMonth && incDate.getFullYear() === currentYear;
        });
        periodLabel = `${currentDate.toLocaleString('default', { month: 'long' })} ${currentYear}`;
        break;
      
      case 'quarterly':
        const quarter = Math.floor(currentDate.getMonth() / 3);
        const quarterStart = quarter * 3;
        filteredExpenses = expenses.filter(exp => {
          const expDate = new Date(exp.date);
          return Math.floor(expDate.getMonth() / 3) === quarter && expDate.getFullYear() === currentDate.getFullYear();
        });
        filteredIncome = income.filter(inc => {
          const incDate = new Date(inc.date);
          return Math.floor(incDate.getMonth() / 3) === quarter && incDate.getFullYear() === currentDate.getFullYear();
        });
        periodLabel = `Q${quarter + 1} ${currentDate.getFullYear()}`;
        break;
      
      case 'yearly':
        filteredExpenses = expenses.filter(exp => {
          const expDate = new Date(exp.date);
          return expDate.getFullYear() === currentDate.getFullYear();
        });
        filteredIncome = income.filter(inc => {
          const incDate = new Date(inc.date);
          return incDate.getFullYear() === currentDate.getFullYear();
        });
        periodLabel = `${currentDate.getFullYear()}`;
        break;
    }

    return {
      expenses: filteredExpenses,
      income: filteredIncome,
      periodLabel
    };
  };

  const formatCurrency = (amount: number, currency = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const createReportContent = () => {
    const { expenses: reportExpenses, income: reportIncome, periodLabel } = generateReport();
    
    const totalIncome = reportIncome.reduce((sum, inc) => sum + inc.amount, 0);
    const totalExpenses = reportExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const netSavings = totalIncome - totalExpenses;

    // Category breakdown
    const expensesByCategory = reportExpenses.reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
      return acc;
    }, {} as Record<string, number>);

    const incomeByCategory = reportIncome.reduce((acc, inc) => {
      acc[inc.category] = (acc[inc.category] || 0) + inc.amount;
      return acc;
    }, {} as Record<string, number>);

    return `
FINANCIAL REPORT - ${periodLabel}
Generated on: ${new Date().toLocaleDateString()}

SUMMARY:
--------
Total Income: ${formatCurrency(totalIncome)}
Total Expenses: ${formatCurrency(totalExpenses)}
Net Savings: ${formatCurrency(netSavings)}
Savings Rate: ${totalIncome > 0 ? ((netSavings / totalIncome) * 100).toFixed(1) : 0}%

INCOME BREAKDOWN:
----------------
${Object.entries(incomeByCategory)
  .sort(([,a], [,b]) => b - a)
  .map(([category, amount]) => `${category}: ${formatCurrency(amount)}`)
  .join('\n')}

EXPENSE BREAKDOWN:
-----------------
${Object.entries(expensesByCategory)
  .sort(([,a], [,b]) => b - a)
  .map(([category, amount]) => `${category}: ${formatCurrency(amount)}`)
  .join('\n')}

TOP EXPENSES:
------------
${reportExpenses
  .sort((a, b) => b.amount - a.amount)
  .slice(0, 5)
  .map(exp => `${exp.description}: ${formatCurrency(exp.amount)} (${exp.category})`)
  .join('\n')}

TOP INCOME SOURCES:
------------------
${reportIncome
  .sort((a, b) => b.amount - a.amount)
  .slice(0, 5)
  .map(inc => `${inc.description}: ${formatCurrency(inc.amount)} (${inc.category})`)
  .join('\n')}

${customRequirements ? `\nCUSTOM REQUIREMENTS:\n${customRequirements}` : ''}

INSIGHTS & RECOMMENDATIONS:
--------------------------
${netSavings > 0 
  ? `✓ Great job! You saved ${formatCurrency(netSavings)} this ${reportType.replace('ly', '')}.`
  : `⚠ You overspent by ${formatCurrency(Math.abs(netSavings))} this ${reportType.replace('ly', '')}. Consider reviewing your expenses.`
}

${Object.entries(expensesByCategory).length > 0 
  ? `Your highest expense category is ${Object.entries(expensesByCategory).sort(([,a], [,b]) => b - a)[0][0]} at ${formatCurrency(Object.entries(expensesByCategory).sort(([,a], [,b]) => b - a)[0][1])}.`
  : ''
}

Total Transactions: ${reportExpenses.length + reportIncome.length}
Average Daily Spending: ${formatCurrency(totalExpenses / 30)}
    `;
  };

  const handleGenerateAndEmail = async () => {
    if (!user?.email) {
      toast({
        title: 'Error',
        description: 'No email address found. Please sign in again.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const reportContent = createReportContent();
      
      // Here you would typically send this to your backend/edge function
      // For now, we'll just show a success message and could copy to clipboard
      
      await navigator.clipboard.writeText(reportContent);
      
      toast({
        title: 'Report Generated!',
        description: `Your ${reportType} report has been copied to clipboard. Email functionality will be implemented with backend integration.`,
      });
      
      // TODO: Implement actual email sending via Supabase Edge Function
      console.log('Report content:', reportContent);
      console.log('Send to email:', user.email);
      
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate report. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-xl">
          <FileText className="h-5 w-5 text-purple-600" />
          Generate Financial Report
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="reportType">Report Type</Label>
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger>
              <SelectValue placeholder="Select report type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Monthly Report</SelectItem>
              <SelectItem value="quarterly">Quarterly Report</SelectItem>
              <SelectItem value="yearly">Yearly Report</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="requirements">Custom Requirements (Optional)</Label>
          <Textarea
            id="requirements"
            value={customRequirements}
            onChange={(e) => setCustomRequirements(e.target.value)}
            placeholder="Any specific analysis or insights you'd like included in the report..."
            className="min-h-[80px]"
          />
        </div>

        <div className="space-y-2">
          <Label>Email Address</Label>
          <Input value={user?.email || ''} disabled />
        </div>

        <Button 
          onClick={handleGenerateAndEmail} 
          disabled={loading}
          className="w-full"
        >
          <Mail className="h-4 w-4 mr-2" />
          {loading ? 'Generating Report...' : 'Generate & Email Report'}
        </Button>

        <div className="text-sm text-gray-600">
          <p>The report will include:</p>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>Income and expense summary</li>
            <li>Category-wise breakdown</li>
            <li>Top transactions</li>
            <li>Savings analysis</li>
            <li>Financial insights and recommendations</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
