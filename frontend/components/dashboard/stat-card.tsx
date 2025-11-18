
import type { FC, ReactNode } from 'react';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';

type StatCardProps = {
  title: string;
  value: ReactNode;
  icon: ReactNode;
  description?: ReactNode;
  className?: string;
};

export const StatCard: FC<StatCardProps> = ({
  title,
  value,
  icon,
  description,
  className,
}) => {
  return (
    <Card className={cn('shadow-md', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold font-headline">{value}</div>
        {description && (
          <div className="text-xs text-muted-foreground">{description}</div>
        )}
      </CardContent>
    </Card>
  );
};
