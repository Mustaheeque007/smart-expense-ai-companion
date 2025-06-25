
-- Add income table
CREATE TABLE public.income (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  amount NUMERIC NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security for income
ALTER TABLE public.income ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own income" 
  ON public.income 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own income" 
  ON public.income 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own income" 
  ON public.income 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own income" 
  ON public.income 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Add notifications/reminders table
CREATE TABLE public.reminders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL, -- 'loan', 'bill', 'medicine', 'recharge'
  due_date DATE NOT NULL,
  amount NUMERIC,
  is_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security for reminders
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own reminders" 
  ON public.reminders 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own reminders" 
  ON public.reminders 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reminders" 
  ON public.reminders 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reminders" 
  ON public.reminders 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Add stored links table
CREATE TABLE public.stored_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  description TEXT,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security for stored links
ALTER TABLE public.stored_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own stored links" 
  ON public.stored_links 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own stored links" 
  ON public.stored_links 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own stored links" 
  ON public.stored_links 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own stored links" 
  ON public.stored_links 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Add RLS policies for expenses to allow updates and deletes
CREATE POLICY "Users can update their own expenses" 
  ON public.expenses 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own expenses" 
  ON public.expenses 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Add RLS policies for expense_attachments
ALTER TABLE public.expense_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own expense attachments" 
  ON public.expense_attachments 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.expenses 
    WHERE expenses.id = expense_attachments.expense_id 
    AND expenses.user_id = auth.uid()
  ));

CREATE POLICY "Users can create their own expense attachments" 
  ON public.expense_attachments 
  FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.expenses 
    WHERE expenses.id = expense_attachments.expense_id 
    AND expenses.user_id = auth.uid()
  ));

CREATE POLICY "Users can update their own expense attachments" 
  ON public.expense_attachments 
  FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM public.expenses 
    WHERE expenses.id = expense_attachments.expense_id 
    AND expenses.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete their own expense attachments" 
  ON public.expense_attachments 
  FOR DELETE 
  USING (EXISTS (
    SELECT 1 FROM public.expenses 
    WHERE expenses.id = expense_attachments.expense_id 
    AND expenses.user_id = auth.uid()
  ));
