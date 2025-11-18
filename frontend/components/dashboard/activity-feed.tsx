import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const activities = [
  {
    user: 'Technician',
    avatar: 'TN',
    action: 'closed job card #1024.',
    time: '5 minutes ago',
  },
  {
    user: 'Cashier',
    avatar: 'CS',
    action: 'processed payment of ₹1,250.',
    time: '12 minutes ago',
  },
  {
    user: 'Sales Rep',
    avatar: 'SR',
    action: 'added a new lead: Ankit Sharma.',
    time: '30 minutes ago',
  },
  {
    user: 'Admin',
    avatar: 'AD',
    action: 'updated inventory for Part #55-Tires.',
    time: '1 hour ago',
  },
   {
    user: 'System',
    avatar: 'SYS',
    action: 'sent 15 service reminders.',
    time: '2 hours ago',
  },
];

export function ActivityFeed() {
  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="font-headline">Recent Activity</CardTitle>
        <CardDescription>A log of the latest actions in your dealership.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <div key={index} className="flex items-start gap-4">
              <Avatar className="h-9 w-9">
                <AvatarFallback>{activity.avatar}</AvatarFallback>
              </Avatar>
              <div className="grid gap-1">
                <p className="text-sm font-medium leading-none">
                  <span className='font-semibold'>{activity.user}</span> {activity.action}
                </p>
                <p className="text-sm text-muted-foreground">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
