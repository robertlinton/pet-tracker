// components/AppointmentCard.tsx

import { format } from 'date-fns';
import { Calendar, Clock, MapPin, User, AlertCircle } from 'lucide-react';
import { Appointment } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { EditAppointmentDialog } from './EditAppointmentDialog';
import { capitalizeFirst } from '@/lib/utils';
import { capitalizeWords } from '@/lib/utils';

interface AppointmentCardProps {
  appointment: Appointment;
  isUpcoming: boolean;
}

export function AppointmentCard({ appointment, isUpcoming }: AppointmentCardProps) {
  const formattedDate = format(new Date(appointment.date), 'MMMM d, yyyy');
  const formattedTime = format(new Date(`2000-01-01T${appointment.time}`), 'h:mm a');

  const getBadgeVariant = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'default';
      case 'completed':
        return 'secondary';
      case 'cancelled':
        return 'destructive';
      default:
        return 'default';
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <Badge variant={getBadgeVariant(appointment.status)}>
                {capitalizeFirst(appointment.status)}
              </Badge>
              <Badge variant="outline">
                {capitalizeWords(appointment.type)}
              </Badge>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{formattedDate}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{formattedTime}</span>
              </div>
              {appointment.clinic && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{appointment.clinic}</span>
                </div>
              )}
              {appointment.vetName && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span>{appointment.vetName}</span>
                </div>
              )}
            </div>

            {appointment.notes && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2 text-muted-foreground cursor-help">
                    <AlertCircle className="h-4 w-4" />
                    <span className="truncate max-w-[300px]">
                      {appointment.notes}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-[300px] whitespace-normal">
                    {appointment.notes}
                  </p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>

          <div className="flex items-start gap-2">
            <EditAppointmentDialog appointment={appointment}>
              <Button variant="outline" size="sm">
                Edit
              </Button>
            </EditAppointmentDialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}